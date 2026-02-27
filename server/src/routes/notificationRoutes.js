const express = require('express');
const router = express.Router();
const notiController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth'); // ตรวจสอบว่าชื่อ middleware ตรงกับที่คุณใช้ (auth.js)

// ดึงสรุปการแจ้งเตือน
router.get('/summary', verifyToken, notiController.getNotificationSummary);

module.exports = router;