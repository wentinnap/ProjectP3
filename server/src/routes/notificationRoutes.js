const express = require('express');
const router = express.Router();
const notiController = require('../controllers/notificationController');
// ✅ ต้องใช้ authenticate (ตามไฟล์ auth.js ของคุณ) ไม่ใช่ verifyToken
const { authenticate } = require('../middleware/auth'); 

router.get('/summary', authenticate, notiController.getNotificationSummary);

module.exports = router;