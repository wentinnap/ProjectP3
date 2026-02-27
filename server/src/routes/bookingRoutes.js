const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, isAdmin } = require('../middleware/auth');

// ==========================================
// 1. Public Routes (เส้นทางสาธารณะ)
// ==========================================
router.get('/types', bookingController.getBookingTypes);

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
router.get('/admin/stats', authenticate, isAdmin, bookingController.getBookingStats);

// ✅ [เพิ่มใหม่] ลบประวัติการจอง
router.delete('/admin/:id', authenticate, isAdmin, bookingController.deleteBooking);

// --- จัดการประเภทพิธี (Booking Types) ---
// ✅ [เพิ่มใหม่] สร้างประเภทพิธีใหม่
router.post('/types', authenticate, isAdmin, bookingController.createBookingType);

// ✅ [เพิ่มใหม่] ลบประเภทพิธี (หรือปิดการใช้งาน)
router.delete('/types/:id', authenticate, isAdmin, bookingController.deleteBookingType);

module.exports = router;