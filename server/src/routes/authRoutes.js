const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// เพิ่ม 2 เส้นทางใหม่สำหรับลืมรหัสผ่าน
router.post('/forgot-password', authController.forgotPassword); // สำหรับส่งอีเมลขอรีเซ็ต
router.post('/reset-password', authController.resetPassword);   // สำหรับบันทึกรหัสผ่านใหม่ด้วย token

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;