const express = require('express');
const router = express.Router();
const notiController = require('../controllers/notificationController');
// ✅ เปลี่ยนจาก verifyToken เป็น authenticate ให้ตรงกับไฟล์ auth.js ที่คุณส่งมา
const { authenticate } = require('../middleware/auth'); 

// ✅ เปลี่ยนจาก verifyToken เป็น authenticate
router.get('/summary', authenticate, notiController.getNotificationSummary);

module.exports = router;