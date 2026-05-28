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

// 🛠️ แก้ไข: เปลี่ยนจากดึง VIEW (booking_details) มาดึงตารางจริง (bookings) เพื่อเอาค่า monks_count
exports.getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // ✨ ปรับ Query มาใช้ตารางจริงและ JOIN ดึงชื่อประเภทพิธี
    let query = `
      SELECT b.*, bt.name as booking_type_name 
      FROM bookings b
      LEFT JOIN booking_types bt ON b.booking_type_id = bt.id
      WHERE b.user_id = ?
    `;
    const queryParams = [user_id];

    if (status) {
      query += ' AND b.status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC LIMIT ? OFFSET ?';
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

// 🛠️ แก้ไข: เปลี่ยนจากดึง VIEW (booking_details) มาดึงตารางจริงสำหรับหน้า Admin ด้วยเช่นกัน
// 🛠️ แก้ไข: ดึงตารางหลัก + JOIN ตารางเชื่อมพระสงฆ์ เพื่อให้หน้าบ้านได้ค่า monk_ids ไปเช็คปุ่มจม
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    // ✨ เพิ่ม GROUP_CONCAT(bm.monk_id) เพื่อดึง ID พระที่ถูกเลือกในใบจองนั้นๆ ออกมาด้วย
    let query = `
      SELECT b.*, bt.name as booking_type_name,
             GROUP_CONCAT(bm.monk_id) as assigned_monk_ids
      FROM bookings b
      LEFT JOIN booking_types bt ON b.booking_type_id = bt.id
      LEFT JOIN booking_monks bm ON b.id = bm.booking_id
      WHERE 1=1
    `;
    const queryParams = [];

    if (status) {
      query += ' AND b.status = ?';
      queryParams.push(status);
    }

    if (date_from) {
      query += ' AND b.booking_date >= ?';
      queryParams.push(date_from);
    }

    if (date_to) {
      query += ' AND b.booking_date <= ?';
      queryParams.push(date_to);
    }

    // ⚠️ ต้องเติม GROUP BY b.id เพราะมีการใช้ Aggregate Function (GROUP_CONCAT)
    query += ' GROUP BY b.id ORDER BY b.booking_date DESC, b.booking_time DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [bookings] = await db.query(query, queryParams);

    // 🔄 แปลงสตริงตระกูล "1,2,3" ให้กลับไปเป็น Array ของตัวเลข [1, 2, 3] เพื่อให้หน้าบ้าน map ได้ทันที
    const formattedBookings = bookings.map(b => ({
      ...b,
      monk_ids: b.assigned_monk_ids ? b.assigned_monk_ids.split(',').map(Number) : []
    }));

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
        bookings: formattedBookings, // ส่งข้อมูลที่แปลงฟอร์แมตแล้วกลับไป
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
// ✅ แก้ไขฟังก์ชันอัปเดตสถานะให้ดักจับ "พระรูปหลักติดงานซ้อน" ป้องกัน Human Error
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_response, monk_ids } = req.body; 
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

    if (status === 'approved') {
      // 2. เช็คโควตาจำนวนพระว่างภาพรวม (โค้ดเดิมของคุณ)
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

      // 🔥 [เพิ่มใหม่] เช็คเชิงลึก: รายชื่อพระที่เลือก ไปชนกับใบจองอื่นที่ "อนุมัติแล้ว" ในวันเดียวกันไหม?
      if (monk_ids && Array.isArray(monk_ids) && monk_ids.length > 0) {
        const [conflicts] = await db.query(
          `SELECT m.name 
           FROM booking_monks bm
           JOIN bookings b ON bm.booking_id = b.id
           JOIN monks m ON bm.monk_id = m.id
           WHERE b.booking_date = ? AND b.status = 'approved' AND b.id != ? AND bm.monk_id IN (?)`,
          [booking.booking_date, id, monk_ids]
        );

        if (conflicts.length > 0) {
          const conflictNames = conflicts.map(c => c.name).join(', ');
          return res.status(400).json({
            success: false,
            message: `❌ ไม่สามารถบันทึกได้ เนื่องจากมีพระสงฆ์ติดคิวงานอื่นในวันนี้แล้ว: ${conflictNames}`
          });
        }
      }
    }

    // 3. อัปเดตสถานะในฐานข้อมูล MySQL
    await db.query(
      `UPDATE bookings 
       SET status = ?, admin_response = ?, admin_id = ?, responded_at = NOW() 
       WHERE id = ?`,
      [status, admin_response || null, admin_id, id]
    );

    // บันทึกรายชื่อพระสงฆ์ลงตารางเชื่อม booking_monks
    if (status === 'approved' && monk_ids && Array.isArray(monk_ids)) {
      await db.query(`DELETE FROM booking_monks WHERE booking_id = ?`, [id]);
      
      if (monk_ids.length > 0) {
        const insertValues = monk_ids.map(monkId => [id, monkId]);
        await db.query(
          `INSERT INTO booking_monks (booking_id, monk_id) VALUES ?`,
          [insertValues]
        );
      }
    }

    // 4. ส่วนส่ง LINE Messaging API (โค้ดเดิมของคุณคงเดิมไว้ทั้งหมด...)
    if (status === 'approved') {
      try {
        const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
        const lineGroupId = process.env.LINE_GROUP_ID;

        if (!lineToken || !lineGroupId) {
          console.warn('⚠️ LINE Integration Warning: Missing Env Variables.');
        } else {
          const [monksData] = await db.query(
            `SELECT m.name FROM booking_monks bm
             JOIN monks m ON bm.monk_id = m.id
             WHERE bm.booking_id = ?`,
            [id]
          );

          const monksListText = monksData.length > 0
            ? monksData.map((monk, index) => `   ${index + 1}. ${monk.name}`).join('\n')
            : '   (ยังไม่ได้ระบุรายชื่อพระสงฆ์)';

          const dateObj = new Date(booking.booking_date);
          const formattedDate = dateObj.toLocaleDateString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric'
          });

          const messageText = `🔔 มีงานนิมนต์พระ (ได้รับการอนุมัติแล้ว)\n\n` +
                              `📌 พิธี: ${booking.booking_type_name || 'ไม่ระบุประเภท'}\n` +
                              `🗓 วันที่: ${formattedDate}\n` +
                              `⏰ เวลา: ${booking.booking_time.substring(0, 5)} น.\n` +
                              `🙏 จำนวนพระสงฆ์: ${booking.monks_count} รูป\n\n` +
                              `📿 รายชื่อพระสงฆ์ที่นิมนต์:\n${monksListText}\n\n` + 
                              `👤 เจ้าภาพ/ผู้จอง: ${booking.full_name}\n` +
                              `📞 เบอร์โทรติดต่อ: ${booking.phone}\n` +
                              `📝 รายละเอียดเพิ่มเติม: ${booking.details || '-'}`;

          const payload = {
            to: lineGroupId.trim(),
            messages: [
              {
                type: 'text',
                text: messageText
              }
            ]
          };

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

    const [usage] = await db.query('SELECT id FROM bookings WHERE booking_type_id = ? LIMIT 1', [id]);
    
    if (usage.length > 0) {
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

    const [exists] = await db.query('SELECT id FROM booking_types WHERE id = ?', [id]);
    if (exists.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบประเภทพิธีที่ต้องการแก้ไข' });
    }

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
    
    const [settings] = await db.query('SELECT total_monks FROM settings LIMIT 1');
    const maxMonks = settings[0]?.total_monks || 20;

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
    
    const [settings] = await db.query('SELECT total_monks FROM settings LIMIT 1');
    const maxMonks = settings[0]?.total_monks || 20;

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
// ระบบจัดการข้อมูลพระสงฆ์ (Monks Management)
// ==========================================

// 1. ดึงรายชื่อพระทั้งหมด
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

// 3. ลบรายชื่อพระ
exports.deleteMonk = async (req, res) => {
  try {
    const { id } = req.params;

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

    const [exists] = await db.query('SELECT id FROM monks WHERE id = ?', [id]);
    if (exists.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบข้อมูลรายชื่อพระที่ต้องการลบ' 
      });
    }

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

// เพิ่มฟังก์ชันนี้ใน Controller
// ✅ แก้ไข: เช็คจำนวนพระว่างรายวัน (Public - ไม่เช็คเวลาตามคอมเมนต์ใน Router)
exports.checkAvailableMonks = async (req, res) => {
  try {
    const { date } = req.query; // รับเฉพาะวันที่เข้ามา
    
    if (!date) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุวันที่ต้องการตรวจสอบ' });
    }

    // 1. ดึงจำนวนพระทั้งหมดจากสถานะตั้งค่า
    const [settings] = await db.query('SELECT total_monks FROM settings LIMIT 1');
    const maxMonks = settings[0]?.total_monks || 20;

    // 2. นับจำนวนพระที่ถูกดึงตัวไปทำงานนิมนต์ที่ได้รับการอนุมัติแล้วในวันนั้นทั้งหมด (ไม่สนเวลา)
    const [booked] = await db.query(
      `SELECT COUNT(DISTINCT bm.monk_id) as used 
       FROM booking_monks bm
       JOIN bookings b ON bm.booking_id = b.id
       WHERE b.booking_date = ? 
       AND b.status = 'approved'`, 
      [date]
    );

    const usedCount = parseInt(booked[0].used || 0);
    const available = maxMonks - usedCount;

    res.json({
      success: true,
      available_monks: available < 0 ? 0 : available
    });
  } catch (error) {
    console.error('Check available monks error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบจำนวนพระว่าง' });
  }
};

// ✅ ตรวจสอบความถูกต้อง: ดึงรายชื่อพระทั้งหมด + พ่วงสถานะติดงานรายรูป (สำหรับ Admin Modal)
exports.getAvailableMonks = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุวันที่ต้องการตรวจสอบ' });
    }

    // หาสมณศักดิ์/ID พระที่ติดคิวงานนิมนต์ที่อนุมัติแล้วในวันนั้น
    const [bookedMonks] = await db.query(
      `SELECT DISTINCT bm.monk_id 
       FROM booking_monks bm
       JOIN bookings b ON bm.booking_id = b.id
       WHERE b.booking_date = ? AND b.status = 'approved'`,
      [date]
    );

    const bookedIds = bookedMonks.map(row => row.monk_id);

    // ดึงพระทั้งหมดในวัดออกเรียงตามชื่อ
    const [allMonks] = await db.query('SELECT * FROM monks ORDER BY name ASC');
    
    // map สเตตัสส่งไปให้หน้าบ้านเช็คเพื่อทำปุ่มจม (Disabled)
    const result = allMonks.map(monk => ({
      ...monk,
      is_busy: bookedIds.includes(monk.id) // ถ้า ID ตรงกับที่ติดงานจะเป็น true
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get available monks details error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะพระสงฆ์' });
  }
};