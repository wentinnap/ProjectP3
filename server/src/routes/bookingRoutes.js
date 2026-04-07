const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const statsController = require('../controllers/statsController');
const { authenticate, isAdmin } = require('../middleware/auth');


// ==========================================
// 1. Public Routes (เส้นทางสาธารณะ)
// ==========================================
router.get('/types', bookingController.getBookingTypes);

// ✅ [เพิ่มใหม่] เช็คจำนวนพระว่าง (Public หรือ Authenticate ก็ได้เพื่อให้ User เห็นก่อนจอง)
// เปลี่ยนจากเดิมที่มีการรับ time
router.get('/check-monks', bookingController.checkAvailableMonks);

// เพิ่มบรรทัดนี้ลงไป
// ✅ ใช้ authenticate แทน auth
router.get('/monthly-status', authenticate, bookingController.getMonthlyStatus);
// ==========================================
// 2. User Routes (เส้นทางสำหรับผู้ใช้งานทั่วไป)
// ==========================================
router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.getUserBookings);
router.patch('/:id/cancel', authenticate, bookingController.cancelBooking);


// ==========================================
// 3. Admin Routes (เส้นทางสำหรับผู้ดูแลระบบ)
// ==========================================

// --- จัดการข้อมูลการจอง ---
router.get('/admin/all', authenticate, isAdmin, bookingController.getAllBookings);
router.put('/admin/:id/status', authenticate, isAdmin, bookingController.updateBookingStatus);

// แก้ไข: ให้เรียกใช้จาก statsController โดยตรงตามที่คุณมี
router.get('/admin/stats', authenticate, isAdmin, statsController.getAdminStats);

// ✅ ลบประวัติการจอง
router.delete('/admin/:id', authenticate, isAdmin, bookingController.deleteBooking);


// --- จัดการประเภทพิธี (Booking Types) ---
// ✅ สร้างประเภทพิธีใหม่
router.post('/types', authenticate, isAdmin, bookingController.createBookingType);

// ✅ แก้ไขรายละเอียดประเภทพิธี
router.put('/types/:id', authenticate, isAdmin, bookingController.updateBookingType);

// ✅ ลบประเภทพิธี (หรือปิดการใช้งาน)
router.delete('/types/:id', authenticate, isAdmin, bookingController.deleteBookingType);


module.exports = router;