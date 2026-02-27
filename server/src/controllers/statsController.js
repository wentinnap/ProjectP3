// controllers/statsController.js
const db = require('../config/database');

exports.getAdminStats = async (req, res) => {
  try {
    // ยิงพร้อมกันเพื่อลดเวลาโหลด
    const [
      [newsRes],
      [eventsRes],
      [qaRes],
      [bookingStats]
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM news'),
      db.query('SELECT COUNT(*) as count FROM events'),
      db.query('SELECT COUNT(*) as count FROM qna'),
      db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(status = 'pending') as pending,
          SUM(status = 'approved') as approved,
          SUM(status = 'rejected') as rejected,
          SUM(status = 'cancelled') as cancelled
        FROM bookings
      `)
    ]);

    const toNum = (val) => Number(val || 0);

    res.json({
      success: true,
      data: {
        news_count: toNum(newsRes[0]?.count),
        events_count: toNum(eventsRes[0]?.count),
        qa_count: toNum(qaRes[0]?.count),

        total_bookings: toNum(bookingStats[0]?.total),
        pending_count: toNum(bookingStats[0]?.pending),
        approved_count: toNum(bookingStats[0]?.approved),
        rejected_count: toNum(bookingStats[0]?.rejected),
        cancelled_count: toNum(bookingStats[0]?.cancelled)
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};