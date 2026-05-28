const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const crypto = require('crypto'); // 🔥 เพิ่มบรรทัดนี้
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

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

// Forgot password

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมล' });
    
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบที่อยู่อีเมลนี้ในระบบ' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpire = new Date(Date.now() + 3600000); 
    await db.query('UPDATE users SET reset_token = ?, reset_expire = ? WHERE email = ?', [resetToken, resetExpire, email]);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'รีเซ็ตรหัสผ่าน - ระบบวัดกำแพง',
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-top: 5px solid #ff9800; border-radius: 8px;">
          <div style="padding: 30px; text-align: center;">
            <h2 style="color: #ff9800;">ระบบวัดกำแพง</h2>
            <p>สวัสดีครับ/ค่ะ, เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
            <a href="${resetUrl}" style="background-color: #ff9800; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 20px 0;">ตั้งรหัสผ่านใหม่</a>
            <p style="font-size: 12px; color: #999;">ลิงก์นี้มีอายุ 1 ชั่วโมงเท่านั้น</p>
          </div>
          <div style="background-color: #fff3e0; padding: 15px; text-align: center; font-size: 12px;">&copy; ${new Date().getFullYear()} ระบบวัดกำแพง.</div>
        </div>
      `
    });
    res.json({ success: true, message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการส่งอีเมล' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const [users] = await db.query('SELECT id FROM users WHERE reset_token = ? AND reset_expire > NOW()', [token]);
    if (users.length === 0) return res.status(400).json({ success: false, message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุ' });
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_expire = NULL WHERE id = ?', [hashedPassword, users[0].id]);
    res.json({ success: true, message: 'เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};