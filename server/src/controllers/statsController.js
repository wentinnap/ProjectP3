// controllers/statsController.js
const db = require('../config/database');

exports.getAdminStats = async (req, res) => {
  try {
    // 1. นับจำนวนข่าวทั้งหมด
    const [[{ news_count }]] = await db.query('SELECT COUNT(*) as news_count FROM news');
    
    // 2. นับจำนวนกิจกรรมทั้งหมด
    const [[{ events_count }]] = await db.query('SELECT COUNT(*) as events_count FROM events');
    
    // 3. นับจำนวนคำถาม Q&A
    const [[{ qa_count }]] = await db.query('SELECT COUNT(*) as qa_count FROM qna');
    
    // 4. นับจำนวนการจอง (Booking) แยกตามสถานะ
    const [[{ total_bookings }]] = await db.query('SELECT COUNT(*) as total_bookings FROM bookings');
    const [[{ pending_count }]] = await db.query('SELECT COUNT(*) as pending_count FROM bookings WHERE status = "pending"');
    const [[{ approved_count }]] = await db.query('SELECT COUNT(*) as approved_count FROM bookings WHERE status = "approved"');
    const [[{ rejected_count }]] = await db.query('SELECT COUNT(*) as rejected_count FROM bookings WHERE status = "rejected"');

    // ✅ ส่งค่ากลับไปให้ครบและชื่อต้องตรงกับที่ Frontend ใช้
    res.json({
      success: true,
      data: {
        news_count,
        events_count,
        qa_count,
        total_bookings,
        pending_count,
        approved_count,
        rejected_count
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'ไม่สามารถโหลดข้อมูลสถิติได้' });
  }
};