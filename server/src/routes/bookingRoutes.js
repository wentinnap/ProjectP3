const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/types', bookingController.getBookingTypes);

// User routes (protected)
router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.getUserBookings);
router.patch('/:id/cancel', authenticate, bookingController.cancelBooking);

// Admin routes
router.get('/admin/all', authenticate, isAdmin, bookingController.getAllBookings);
router.put('/admin/:id/status', authenticate, isAdmin, bookingController.updateBookingStatus);
router.get('/admin/stats', authenticate, isAdmin, bookingController.getBookingStats);

module.exports = router;