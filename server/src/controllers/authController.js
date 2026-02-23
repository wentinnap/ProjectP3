const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    // Validation
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, phone || null, 'user']
    );

    // Get created user
    const [users] = await db.query(
      'SELECT id, username, email, full_name, phone, role FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = users[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
      });
    }

    // Find user
    const [users] = await db.query(
      'SELECT id, username, email, password, full_name, phone, role, is_active FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'บัญชีของคุณถูกระงับ'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // Remove password from response
    delete user.password;

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, full_name, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'อีเมลนี้ถูกใช้งานแล้ว'
        });
      }
    }

    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, email = ? WHERE id = ?',
      [full_name, phone, email, userId]
    );

    const [users] = await db.query(
      'SELECT id, username, email, full_name, phone, role FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลสำเร็จ',
      data: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // Get current password
    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมล' });
    }

    // 1. เช็คว่ามีอีเมลนี้ไหม
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบที่อยู่อีเมลนี้ในระบบ' });
    }

    // 2. สร้าง Token และเวลาหมดอายุ (1 ชั่วโมง)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpire = new Date(Date.now() + 3600000); // 1 hour from now

    // 3. บันทึกลงฐานข้อมูล (อย่าลืมรันคำสั่ง SQL เพิ่ม Column ในข้อ 2 ด้านล่าง)
    await db.query(
      'UPDATE users SET reset_token = ?, reset_expire = ? WHERE email = ?',
      [resetToken, resetExpire, email]
    );

    // 4. ส่งอีเมล (ตัวอย่างใช้ Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // ใส่อีเมลใน .env
        pass: process.env.EMAIL_PASS  // ใส่ App Password ใน .env
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      to: email,
      subject: 'รีเซ็ตรหัสผ่าน - ระบบอัลบั้มรูปภาพ',
      html: `
        <h3>คุณได้รับอีเมลนี้เนื่องจากมีการขอรีเซ็ตรหัสผ่าน</h3>
        <p>กรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์มีอายุ 1 ชม.):</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>หากคุณไม่ได้เป็นคนขอ โปรดละทิ้งอีเมลนี้</p>
      `
    });

    res.json({ success: true, message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการส่งอีเมล' });
  }
};

// Reset Password - ยืนยันรหัสใหม่
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
    }

    // 1. ตรวจสอบ Token และวันหมดอายุ
    const [users] = await db.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expire > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    // 2. Hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. อัปเดตและล้างค่า Token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_expire = NULL WHERE id = ?',
      [hashedPassword, users[0].id]
    );

    res.json({ success: true, message: 'เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' });
  }
};