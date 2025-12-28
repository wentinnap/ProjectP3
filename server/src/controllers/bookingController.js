const db = require('../config/database');

// Get all booking types
exports.getBookingTypes = async (req, res) => {
  try {
    const [types] = await db.query(
      'SELECT * FROM booking_types WHERE is_active = TRUE ORDER BY name'
    );

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Get booking types error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทพิธี'
    });
  }
};

// Create booking (user)
exports.createBooking = async (req, res) => {
  try {
    const { booking_type_id, booking_date, booking_time, full_name, phone, details } = req.body;
    const user_id = req.user.id;

    // Validation
    if (!booking_type_id || !booking_date || !booking_time || !full_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // Check if booking type exists
    const [types] = await db.query(
      'SELECT id FROM booking_types WHERE id = ? AND is_active = TRUE',
      [booking_type_id]
    );

    if (types.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบประเภทพิธีที่เลือก'
      });
    }

    // Check if slot is already booked
    const [existingBookings] = await db.query(
      `SELECT id FROM bookings 
       WHERE booking_date = ? 
       AND booking_time = ? 
       AND status IN ('pending', 'approved')`,
      [booking_date, booking_time]
    );

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'วันและเวลาที่เลือกมีผู้จองแล้ว กรุณาเลือกเวลาอื่น'
      });
    }

    // Create booking
    const [result] = await db.query(
      `INSERT INTO bookings 
       (user_id, booking_type_id, booking_date, booking_time, full_name, phone, details) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, booking_type_id, booking_date, booking_time, full_name, phone, details || null]
    );

    const [booking] = await db.query(
      'SELECT * FROM booking_details WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'จองพิธีสำเร็จ รอการตอบรับจากเจ้าหน้าที่',
      data: booking[0]
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการจองพิธี'
    });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM booking_details WHERE user_id = ?';
    const queryParams = [user_id];

    if (status) {
      query += ' AND status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY booking_date DESC, booking_time DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [bookings] = await db.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM bookings WHERE user_id = ?';
    const countParams = [user_id];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง'
    });
  }
};

// Get all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM booking_details WHERE 1=1';
    const queryParams = [];

    if (status) {
      query += ' AND status = ?';
      queryParams.push(status);
    }

    if (date_from) {
      query += ' AND booking_date >= ?';
      queryParams.push(date_from);
    }

    if (date_to) {
      query += ' AND booking_date <= ?';
      queryParams.push(date_to);
    }

    query += ' ORDER BY booking_date DESC, booking_time DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [bookings] = await db.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM bookings WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (date_from) {
      countQuery += ' AND booking_date >= ?';
      countParams.push(date_from);
    }

    if (date_to) {
      countQuery += ' AND booking_date <= ?';
      countParams.push(date_to);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง'
    });
  }
};

// Update booking status (admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_response } = req.body;
    const admin_id = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'สถานะไม่ถูกต้อง'
      });
    }

    // Check if booking exists
    const [bookings] = await db.query('SELECT id, status FROM bookings WHERE id = ?', [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองที่ต้องการ'
      });
    }

    if (bookings[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถเปลี่ยนสถานะการจองนี้ได้'
      });
    }

    // Update booking
    await db.query(
      `UPDATE bookings 
       SET status = ?, admin_response = ?, admin_id = ?, responded_at = NOW() 
       WHERE id = ?`,
      [status, admin_response || null, admin_id, id]
    );

    const [updatedBooking] = await db.query(
      'SELECT * FROM booking_details WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: status === 'approved' ? 'อนุมัติการจองสำเร็จ' : 'ปฏิเสธการจองสำเร็จ',
      data: updatedBooking[0]
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง'
    });
  }
};

// Cancel booking (user)
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [bookings] = await db.query(
      'SELECT id, status, user_id FROM bookings WHERE id = ?',
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองที่ต้องการ'
      });
    }

    if (bookings[0].user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์ยกเลิกการจองนี้'
      });
    }

    if (bookings[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถยกเลิกการจองนี้ได้'
      });
    }

    await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    res.json({
      success: true,
      message: 'ยกเลิกการจองสำเร็จ'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยกเลิกการจอง'
    });
  }
};

// Get booking statistics (admin)
exports.getBookingStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
      FROM bookings
    `);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติการจอง'
    });
  }
};