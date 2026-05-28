const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const crypto = require('crypto'); // 🔥 เพิ่มบรรทัดนี้
const nodemailer = require('nodemailer'); // 🔥 เพิ่มบรรทัดนี้

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

    // 3. บันทึกลงฐานข้อมูล
    await db.query(
      'UPDATE users SET reset_token = ?, reset_expire = ? WHERE email = ?',
      [resetToken, resetExpire, email]
    );

    // 4. ส่งอีเมล (แก้ไขโดยเพิ่ม family: 4 เพื่อบังคับใช้ IPv4)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      family: 4, // <--- แก้ไขจุดนี้
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      to: email,
      subject: 'รีเซ็ตรหัสผ่าน - ระบบวัดกำแพง',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2c3e50;">ระบบวัดกำแพง</h2>
          </div>
          <div style="padding: 20px; background-color: #ffffff;">
            <h3 style="color: #2c3e50; margin-top: 0;">สวัสดีครับ/ค่ะ,</h3>
            <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณในระบบวัดกำแพง คุณสามารถเริ่มตั้งรหัสผ่านใหม่ได้โดยการคลิกปุ่มด้านล่างนี้:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                 ตั้งรหัสผ่านใหม่
              </a>
            </div>
            <p style="font-size: 0.9em; color: #666;">* ลิงก์นี้จะมีอายุการใช้งาน <strong>1 ชั่วโมง</strong> เท่านั้น</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8em; color: #999;">หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ โปรดละทิ้งอีเมลฉบับนี้ บัญชีของคุณยังคงปลอดภัย</p>
          </div>
          <div style="text-align: center; padding-top: 20px; font-size: 0.75em; color: #aaa;">
            &copy; ${new Date().getFullYear()} ระบบวัดกำแพง. All rights reserved.
          </div>
        </div>
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