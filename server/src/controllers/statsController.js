// controllers/statsController.js
const db = require('../config/database');

exports.getAdminStats = async (req, res) => {
  try {
    // ใช้ [rows] แทนการเจาะจงลึก เพื่อป้องกัน error หากไม่มีข้อมูล
    const [newsRes] = await db.query('SELECT COUNT(*) as count FROM news');
    const [eventsRes] = await db.query('SELECT COUNT(*) as count FROM events');
    const [qaRes] = await db.query('SELECT COUNT(*) as count FROM qna');
    
    const [totalRes] = await db.query('SELECT COUNT(*) as count FROM bookings');
    const [pendingRes] = await db.query('SELECT COUNT(*) as count FROM bookings WHERE status = "pending"');
    const [approvedRes] = await db.query('SELECT COUNT(*) as count FROM bookings WHERE status = "approved"');
    const [rejectedRes] = await db.query('SELECT COUNT(*) as count FROM bookings WHERE status = "rejected"');

    res.json({
      success: true,
      data: {
        news_count: newsRes[0]?.count || 0,
        events_count: eventsRes[0]?.count || 0,
        qa_count: qaRes[0]?.count || 0,
        total_bookings: totalRes[0]?.count || 0,
        pending_count: pendingRes[0]?.count || 0,
        approved_count: approvedRes[0]?.count || 0,
        rejected_count: rejectedRes[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};