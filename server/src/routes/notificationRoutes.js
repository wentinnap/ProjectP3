const express = require('express');
const router = express.Router();
const notiController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth'); // ตรวจสอบชื่อ middleware ของคุณ

router.get('/summary', verifyToken, notiController.getNotificationSummary);

module.exports = router;