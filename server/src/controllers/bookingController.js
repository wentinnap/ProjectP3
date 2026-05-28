const db = require('../config/database');
const axios = require('axios'); // ✅ เพิ่ม axios สำหรับส่ง LINE Notify

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

// Create booking type (admin)
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

// ✅ Update booking status (admin) พร้อมบันทึกรายชื่อพระและส่ง LINE Messaging API
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_response, monk_ids } = req.body; // 🌟 รับ monk_ids อาร์เรย์ของไอดีพระเพิ่มเข้ามา
    const admin_id = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' });
    }

    // 1. ดึงข้อมูลการจองมาเตรียมไว้
    const [bookingData] = await db.query(
      `SELECT b.booking_date, b.booking_time, b.monks_count, b.status, 
              b.full_name, b.phone, b.details, 
              bt.name as booking_type_name
       FROM bookings b
       LEFT JOIN booking_types bt ON b.booking_type_id = bt.id
       WHERE b.id = ?`, 
      [id]
    );

    if (bookingData.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบการจอง' });
    }

    const booking = bookingData[0];

    // 2. เช็คจำนวนพระว่าง
    if (status === 'approved') {
      const [stats] = await db.query(
        `SELECT 
          (SELECT total_monks FROM settings LIMIT 1) as max_monks,
          IFNULL(SUM(monks_count), 0) as used_monks
         FROM bookings 
         WHERE booking_date = ? AND booking_time = ? AND status = 'approved' AND id != ?`,
        [booking.booking_date, booking.booking_time, id]
      );

      const available = (stats[0].max_monks || 20) - stats[0].used_monks;
      if (booking.monks_count > available) {
        return res.status(400).json({
          success: false,
          message: `ไม่สามารถอนุมัติได้ เนื่องจากพระในเวลานี้เหลือไม่เพียงพอ (ว่าง ${available} รูป)`
        });
      }
    }

    // 3. อัปเดตสถานะในฐานข้อมูล MySQL
    await db.query(
      `UPDATE bookings 
       SET status = ?, admin_response = ?, admin_id = ?, responded_at = NOW() 
       WHERE id = ?`,
      [status, admin_response || null, admin_id, id]
    );

    // 🌟 [ส่วนเพิ่มใหม่] บันทึกรายชื่อพระสงฆ์ลงตารางเชื่อม booking_monks
    if (status === 'approved' && monk_ids && Array.isArray(monk_ids)) {
      // ล้างรายชื่อเดิมที่เคยผูกกับใบจองนี้ก่อน (เผื่อมีการอัปเดตแก้ไข)
      await db.query(`DELETE FROM booking_monks WHERE booking_id = ?`, [id]);
      
      // ถ้ามีการเลือกพระส่งมา ให้บันทึกชุดใหม่ลงไปทันทีแบบ Bulk Insert
      if (monk_ids.length > 0) {
        const insertValues = monk_ids.map(monkId => [id, monkId]);
        await db.query(
          `INSERT INTO booking_monks (booking_id, monk_id) VALUES ?`,
          [insertValues]
        );
      }
    }

    // 4. ถ้าอนุมัติสำเร็จ ให้ส่งข้อความเข้ากลุ่มไลน์ด้วย Messaging API
    if (status === 'approved') {
      try {
        const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
        const lineGroupId = process.env.LINE_GROUP_ID;

        if (!lineToken || !lineGroupId) {
          console.warn('⚠️ LINE Integration Warning: Missing Env Variables.');
        } else {
          
          // 🌟 ดึงข้อมูลรายชื่อพระที่พึ่งบันทึกสด ๆ ร้อน ๆ มาร้อยเป็นข้อความแจ้งเตือน
          const [monksData] = await db.query(
            `SELECT m.name FROM booking_monks bm
             JOIN monks m ON bm.monk_id = m.id
             WHERE bm.booking_id = ?`,
            [id]
          );

          const monksListText = monksData.length > 0
            ? monksData.map((monk, index) => `   ${index + 1}. ${monk.name}`).join('\n')
            : '   (ยังไม่ได้ระบุรายชื่อพระสงฆ์)';

          // แปลงวันที่เป็นฟอร์แมตภาษาไทย
          const dateObj = new Date(booking.booking_date);
          const formattedDate = dateObj.toLocaleDateString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric'
          });

          // จัดรูปแบบข้อความข้อความ
          const messageText = `🔔 มีงานนิมนต์พระ (ได้รับการอนุมัติแล้ว)\n\n` +
                              `📌 พิธี: ${booking.booking_type_name || 'ไม่ระบุประเภท'}\n` +
                              `🗓 วันที่: ${formattedDate}\n` +
                              `⏰ เวลา: ${booking.booking_time.substring(0, 5)} น.\n` +
                              `🙏 จำนวนพระสงฆ์: ${booking.monks_count} รูป\n\n` +
                              `📿 รายชื่อพระสงฆ์ที่นิมนต์:\n${monksListText}\n\n` + // 🌟 พ่นรายชื่อตรงนี้
                              `👤 เจ้าภาพ/ผู้จอง: ${booking.full_name}\n` +
                              `📞 เบอร์โทรติดต่อ: ${booking.phone}\n` +
                              `📝 รายละเอียดเพิ่มเติม: ${booking.details || '-'}`;

          // โครงสร้าง Payload ตามกำหนดของ LINE Messaging API
          const payload = {
            to: lineGroupId.trim(),
            messages: [
              {
                type: 'text',
                text: messageText
              }
            ]
          };

          // ยิง POST Request ไปที่ LINE Server
          await axios.post(
            'https://api.line.me/v2/bot/message/push',
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lineToken.trim()}`
              }
            }
          );
          console.log('ส่งแจ้งเตือนไลน์กลุ่มสำเร็จพร้อมรายชื่อพระ');
        }

      } catch (lineError) {
        console.error('LINE API Error:', lineError.response ? lineError.response.data : lineError.message);
      }
    }

    res.json({ success: true, message: 'อัปเดตสถานะ บันทึกพระ และแจ้งเตือนเรียบร้อย' });
  } catch (error) {
    console.error('Update booking status error:', error);
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

// Delete booking
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

// Create booking (user)
exports.createBooking = async (req, res) => {
  try {
    const { booking_type_id, booking_date, booking_time, full_name, phone, details, monks_count } = req.body;
    const user_id = req.user.id;

    if (!booking_type_id || !booking_date || !booking_time || !full_name || !phone || !monks_count) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // เช็คพระว่างรายเวลา (Slot)
    const [monkStats] = await db.query(
      `SELECT 
        (SELECT total_monks FROM settings LIMIT 1) as max_monks,
        IFNULL(SUM(monks_count), 0) as used_monks
      FROM bookings 
      WHERE booking_date = ? AND booking_time = ? AND status IN ('approved', 'pending')`,
      [booking_date, booking_time]
    );

    const maxMonks = monkStats[0].max_monks || 20;
    const availableMonks = maxMonks - monkStats[0].used_monks;

    if (parseInt(monks_count) > availableMonks) {
      return res.status(400).json({
        success: false,
        message: `ขออภัย เวลานี้พระว่างเหลือเพียง ${availableMonks} รูป`
      });
    }

    // บันทึกข้อมูล
    const [result] = await db.query(
      `INSERT INTO bookings 
       (user_id, booking_type_id, booking_date, booking_time, full_name, phone, details, monks_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, booking_type_id, booking_date, booking_time, full_name, phone, details || null, monks_count]
    );

    res.status(201).json({ success: true, message: 'จองพิธีสำเร็จ' });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการจอง' });
  }
};

// Delete booking type (admin)
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

// Update booking type (admin)
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

// Check available monks
exports.checkAvailableMonks = async (req, res) => {
  try {
    const { date, time } = req.query;
    
    // 1. ดึงยอดพระสูงสุด
    const [settings] = await db.query('SELECT total_monks FROM settings LIMIT 1');
    const maxMonks = settings[0]?.total_monks || 20;

    // 2. ต้องเช็คยอดการใช้ "เฉพาะวันที่และเวลา" ที่เลือกเท่านั้น
    const [booked] = await db.query(
      `SELECT SUM(monks_count) as used 
       FROM bookings 
       WHERE booking_date = ? 
       AND booking_time = ? 
       AND status IN ('approved', 'pending')`, 
      [date, time]
    );

    const usedCount = parseInt(booked[0].used || 0);
    const available = maxMonks - usedCount;

    res.json({
      success: true,
      available_monks: available < 0 ? 0 : available
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get monthly status
exports.getMonthlyStatus = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // ดึงค่าจำนวนพระสูงสุดต่อวัน (ถ้าไม่มี Table settings ให้ Default ที่ 20)
    const [settings] = await db.query('SELECT total_monks FROM settings LIMIT 1');
    const maxMonks = settings[0]?.total_monks || 20;

    // ดึงยอดรวมการใช้พระในแต่ละวันของเดือนนั้นๆ
    const [rows] = await db.query(
      `SELECT 
          DATE_FORMAT(booking_date, '%Y-%m-%d') as date, 
          SUM(monks_count) as total_used
       FROM bookings 
       WHERE MONTH(booking_date) = ? AND YEAR(booking_date) = ? 
       AND status IN ('approved', 'pending')
       GROUP BY booking_date`, 
      [month, year]
    );

    // ปั้นข้อมูลให้ Frontend ใช้ง่าย
    const busyDates = {};
    rows.forEach(row => {
      busyDates[row.date] = {
        used: parseInt(row.total_used)
      };
    });

    res.json({
      success: true,
      busyDates,
      max_monks: maxMonks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 🌟 [ส่วนเพิ่มใหม่] ระบบจัดการข้อมูลพระสงฆ์ (Monks Management)
// ==========================================

// 1. ดึงรายชื่อพระทั้งหมด (สำหรับไปแสดงในตารางหน้า Admin และใช้เป็นตัวเลือก Dropdown)
exports.getAllMonks = async (req, res) => {
  try {
    const [monks] = await db.query('SELECT * FROM monks ORDER BY name ASC');

    res.json({
      success: true,
      data: monks
    });
  } catch (error) {
    console.error('Get all monks error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายชื่อพระ'
    });
  }
};

// 2. เพิ่มรายชื่อพระภิกษุสามเณรใหม่
exports.createMonk = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอกชื่อ-ฉายา พระภิกษุสามเณร' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO monks (name) VALUES (?)',
      [name.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'เพิ่มข้อมูลพระภิกษุสามเณรสำเร็จ',
      data: { id: result.insertId, name: name.trim() }
    });
  } catch (error) {
    console.error('Create monk error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลพระ' 
    });
  }
};

// 3. ลบรายชื่อพระ (พร้อมระบบเช็คความปลอดภัย)
exports.deleteMonk = async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบก่อนว่าพระรูปนี้ถูกนิมนต์ไปผูกกับใบจองไหนในตาราง booking_monks หรือยัง เพื่อป้องกัน Data Error
    const [usage] = await db.query(
      'SELECT booking_id FROM booking_monks WHERE monk_id = ? LIMIT 1', 
      [id]
    );
    
    if (usage.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบได้ เนื่องจากพระรูปนี้มีประวัติการไปงานนิมนต์ในระบบแล้ว'
      });
    }

    // ตรวจสอบว่ามีข้อมูลอยู่จริงไหม
    const [exists] = await db.query('SELECT id FROM monks WHERE id = ?', [id]);
    if (exists.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบข้อมูลรายชื่อพระที่ต้องการลบ' 
      });
    }

    // ทำการลบจริง
    await db.query('DELETE FROM monks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'ลบรายชื่อพระออกจากระบบสำเร็จ'
    });
  } catch (error) {
    console.error('Delete monk error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการลบข้อมูลพระ' 
    });
  }
};