// controllers/statsController.js
const db = require('../config/database');

exports.getAdminStats = async (req, res) => {
  try {
    // 1. นับจำนวนข่าว
    const [[{ news_count }]] = await db.query('SELECT COUNT(*) as news_count FROM news');
    
    // 2. นับจำนวนกิจกรรม
    const [[{ events_count }]] = await db.query('SELECT COUNT(*) as events_count FROM events');
    
    // 3. นับจำนวน Q&A
    const [[{ qa_count }]] = await db.query('SELECT COUNT(*) as qa_count FROM qna');
    
    // 4. นับจำนวนการจองแยกสถานะ
    const [[{ total_bookings }]] = await db.query('SELECT COUNT(*) as total_bookings FROM bookings');
    const [[{ pending_count }]] = await db.query('SELECT COUNT(*) as pending_count FROM bookings WHERE status = "pending"');
    const [[{ approved_count }]] = await db.query('SELECT COUNT(*) as approved_count FROM bookings WHERE status = "approved"');
    const [[{ rejected_count }]] = await db.query('SELECT COUNT(*) as rejected_count FROM bookings WHERE status = "rejected"');

    // ✅ หัวใจสำคัญ: ส่งทุกอย่างออกไปในก้อน data เดียวกัน
    res.json({
      success: true,
      data: {
        news_count: news_count || 0,
        events_count: events_count || 0,
        qa_count: qa_count || 0,
        total_bookings: total_bookings || 0,
        pending_count: pending_count || 0,
        approved_count: approved_count || 0,
        rejected_count: rejected_count || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'ไม่สามารถโหลดข้อมูลสถิติได้' });
  }
};