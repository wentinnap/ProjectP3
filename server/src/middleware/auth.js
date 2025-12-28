const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Verify JWT Token
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const [users] = await db.query(
      'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน'
      });
    }

    if (!users[0].is_active) {
      return res.status(403).json({
        success: false,
        message: 'บัญชีผู้ใช้ถูกระงับ'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้อง'
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึง'
    });
  }
  next();
};

// Optional authentication (for routes that work with/without login)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [users] = await db.query(
        'SELECT id, username, email, full_name, role FROM users WHERE id = ? AND is_active = TRUE',
        [decoded.id]
      );

      if (users.length > 0) {
        req.user = users[0];
      }
    }
  } catch (error) {
    // Continue without user
  }
  next();
};

module.exports = { authenticate, isAdmin, optionalAuth };