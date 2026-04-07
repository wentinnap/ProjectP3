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
// ✅ เพิ่มฟังก์ชันที่หายไป
exports.createBookingType = async (req, res) => {
  try {
    const { name, description, duration_minutes } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อประเภทพิธี' });
    }

    const [result] = await db.query(
      'INSERT INTO booking_types (name, description, duration_minutes) VALUES (?, ?, ?)',
      [name, description || null, duration_minutes || 60]
    );

    res.status(201).json({
      success: true,
      message: 'สร้างประเภทพิธีสำเร็จ',
      data: { id: result.insertId, name, description, duration_minutes }
    });
  } catch (error) {
    console.error('Create booking type error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างประเภทพิธี' });
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
// Update booking status (admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_response } = req.body;
    const admin_id = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' });
    }

    // ดึงข้อมูลการจองที่จะอนุมัติ
    const [bookingData] = await db.query(
      'SELECT booking_date, booking_time, monks_count, status FROM bookings WHERE id = ?', 
      [id]
    );

    if (bookingData.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบการจอง' });
    }

    // ถ้าแอดมินจะอนุมัติ (approved) ให้เช็คพระว่างอีกครั้ง
    if (status === 'approved') {
      const [stats] = await db.query(
        `SELECT 
          (SELECT total_monks FROM settings LIMIT 1) as max_monks,
          IFNULL(SUM(monks_count), 0) as used_monks
        FROM bookings 
        WHERE booking_date = ? AND booking_time = ? AND status = 'approved' AND id != ?`,
        [bookingData[0].booking_date, bookingData[0].booking_time, id]
      );

      const available = (stats[0].max_monks || 20) - stats[0].used_monks;
      if (bookingData[0].monks_count > available) {
        return res.status(400).json({
          success: false,
          message: `ไม่สามารถอนุมัติได้ เนื่องจากพระในเวลานี้เหลือไม่เพียงพอ (ว่าง ${available} รูป)`
        });
      }
    }

    // อัปเดตสถานะ
    await db.query(
      `UPDATE bookings 
       SET status = ?, admin_response = ?, admin_id = ?, responded_at = NOW() 
       WHERE id = ?`,
      [status, admin_response || null, admin_id, id]
    );

    res.json({ success: true, message: 'อัปเดตสถานะเรียบร้อย' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดต' });
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



exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await db.query('SELECT id FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองที่ต้องการลบ'
      });
    }

    await db.query('DELETE FROM bookings WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'ลบข้อมูลการจองสำเร็จ'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบข้อมูลการจอง'
    });
  }
};

// ✅ เพิ่มใหม่: สร้างประเภทพิธี (Admin)
// ✅ ปรับปรุง: สร้างประเภทพิธี (Admin) ให้รับข้อมูลครบถ้วน
// Create booking (user)
exports.createBooking = async (req, res) => {
  try {
    // เพิ่ม monks_count เข้ามาจาก req.body
    const { booking_type_id, booking_date, booking_time, full_name, phone, details, monks_count } = req.body;
    const user_id = req.user.id;

    // 1. Validation (เพิ่มตรวจสอบ monks_count)
    if (!booking_type_id || !booking_date || !booking_time || !full_name || !phone || !monks_count) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วนและระบุจำนวนพระ'
      });
    }

    // 2. ดึงจำนวนพระว่างในเวลานั้น (จำนวนรวม - จำนวนที่ถูกจองแล้ว)
   // ... ส่วนดึงข้อมูลจาก req.body ...
const [monkStats] = await db.query(
  `SELECT 
    (SELECT total_monks FROM settings LIMIT 1) as max_monks,
    IFNULL(SUM(monks_count), 0) as used_monks
  FROM bookings 
  WHERE booking_date = ? 
  AND status = 'approved'`, // เช็คยอดรวมทั้งวัน
  [booking_date]
);

const maxMonks = monkStats[0].max_monks || 20;
const availableMonks = maxMonks - monkStats[0].used_monks;

if (parseInt(monks_count) > availableMonks) {
  return res.status(400).json({
    success: false,
    message: `ไม่สามารถจองได้: วันนี้มีพระว่างเหลือเพียง ${availableMonks} รูป`
  });
}
// ... ส่วน INSERT ข้อมูลต่อไป ...

    // 4. บันทึกการจอง (เพิ่ม monks_count ลงใน INSERT)
    const [result] = await db.query(
      `INSERT INTO bookings 
       (user_id, booking_type_id, booking_date, booking_time, full_name, phone, details, monks_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, booking_type_id, booking_date, booking_time, full_name, phone, details || null, monks_count]
    );

    // ดึงข้อมูลที่เพิ่งบันทึกไปโชว์
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

// ✅ เพิ่มใหม่: ลบประเภทพิธี (Admin)
exports.deleteBookingType = async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่ามีการใช้งานประเภทนี้อยู่ในตาราง bookings หรือไม่ก่อนลบ
    const [usage] = await db.query('SELECT id FROM bookings WHERE booking_type_id = ? LIMIT 1', [id]);
    
    if (usage.length > 0) {
      // หากมีการใช้งานแล้ว แนะนำให้ใช้วิธีปิดการใช้งาน (is_active = FALSE) แทนการลบจริง
      await db.query('UPDATE booking_types SET is_active = FALSE WHERE id = ?', [id]);
      return res.json({ success: true, message: 'ปิดการใช้งานประเภทพิธีเรียบร้อย (เนื่องจากมีการใช้งานในประวัติแล้ว)' });
    }

    await db.query('DELETE FROM booking_types WHERE id = ?', [id]);
    res.json({ success: true, message: 'ลบประเภทพิธีเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Delete booking type error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบประเภทพิธี' });
  }
};

// ✅ แก้ไขใหม่: อัปเดตรายละเอียดและเวลาของประเภทพิธี (Admin)
exports.updateBookingType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration_minutes, is_active } = req.body;

    // ตรวจสอบว่ามี ID นี้อยู่จริงไหม
    const [exists] = await db.query('SELECT id FROM booking_types WHERE id = ?', [id]);
    if (exists.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบประเภทพิธีที่ต้องการแก้ไข' });
    }

    // อัปเดตข้อมูล (รองรับการแก้ไขทั้ง ชื่อ, รายละเอียด, และเวลา)
    await db.query(
      `UPDATE booking_types 
       SET name = ?, description = ?, duration_minutes = ?, is_active = ? 
       WHERE id = ?`,
      [name, description || null, duration_minutes || 60, is_active ?? true, id]
    );

    res.json({ 
      success: true, 
      message: 'อัปเดตข้อมูลพิธีเรียบร้อยแล้ว' 
    });
  } catch (error) {
    console.error('Update booking type error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลพิธี' 
    });
  }
};

// เช็คจำนวนพระว่าง (สำหรับหน้าบ้านเรียกดู)
// เช็คจำนวนพระว่างรายวัน
exports.checkAvailableMonks = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'ระบุวันที่' });

    const [stats] = await db.query(
      `SELECT 
        (SELECT total_monks FROM settings LIMIT 1) as max_monks,
        IFNULL(SUM(monks_count), 0) as used_monks
      FROM bookings 
      WHERE booking_date = ? AND status IN ('approved', 'pending')`, // นับรวม pending เพื่อป้องกันการจองซ้อน
      [date]
    );

    const max = stats[0].max_monks || 20;
    const used = parseInt(stats[0].used_monks);
    const available = max - used;

    res.json({
      success: true,
      available_monks: available < 0 ? 0 : available,
      total_monks: max
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ✅ เพิ่มใหม่: ดึงสถานะรายเดือน (สำหรับระบายสีปฏิทิน แดง/ส้ม/เขียว)
exports.getMonthlyStatus = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ success: false, message: 'ระบุปีและเดือน' });

    const [rows] = await db.query(
      `SELECT 
         DATE_FORMAT(booking_date, '%Y-%m-%d') as date, 
         SUM(monks_count) as total_used,
         (SELECT total_monks FROM settings LIMIT 1) as max_monks
       FROM bookings 
       WHERE MONTH(booking_date) = ? AND YEAR(booking_date) = ? AND status IN ('approved', 'pending')
       GROUP BY booking_date`, 
      [month, year]
    );

    // แปลงข้อมูลให้อยู่ในรูปแบบ Object เพื่อให้ Frontend ใช้ง่าย { "2026-04-10": 15 }
    const busyDates = {};
    rows.forEach(row => {
      busyDates[row.date] = parseInt(row.total_used);
    });

    res.json({
      success: true,
      busyDates,
      max_monks: rows.length > 0 ? rows[0].max_monks : 20
    });
  } catch (error) {
    console.error('Get monthly status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};