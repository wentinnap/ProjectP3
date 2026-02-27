
// ตัวอย่างใน routes/booking.js (อ้างอิงจาก api.js ที่คุณเคยส่งมา)
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate, isAdmin } = require('../middleware/auth'); // ตรวจสอบว่าเป็น Admin หรือไม่

// เส้นทางนี้ต้องตรงกับที่ Frontend เรียก (bookingAPI.getStats)
router.get('/admin/stats', authenticate, isAdmin, statsController.getAdminStats);

module.exports = router;