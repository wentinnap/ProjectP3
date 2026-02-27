const db = require('../config/database');

exports.getNotificationSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let notifications = [];

        if (userRole === 'admin') {
            // ดึงข้อมูลพร้อมกัน (Parallel) เพื่อความเร็ว
            const [bookingRes, qnaRes] = await Promise.all([
                db.query('SELECT id, full_name, created_at FROM bookings WHERE status = "pending" ORDER BY created_at DESC LIMIT 10'),
                db.query('SELECT id, question, created_at FROM qna WHERE admin_response IS NULL OR admin_response = "" ORDER BY created_at DESC LIMIT 10')
            ]);

            const pendingBookings = bookingRes[0] || [];
            const pendingQna = qnaRes[0] || [];

            pendingBookings.forEach(b => notifications.push({
                id: `admin-bk-${b.id}`,
                type: 'new_booking',
                title: 'มีคำขอจองใหม่',
                message: `จากคุณ ${b.full_name}`,
                time_ago: b.created_at,
                link: '/admin/bookings'
            }));

            pendingQna.forEach(q => notifications.push({
                id: `admin-qna-${q.id}`,
                type: 'qna',
                title: 'มีคำถามใหม่',
                message: q.question?.substring(0, 50) + (q.question?.length > 50 ? '...' : ''),
                time_ago: q.created_at,
                link: '/admin/qna'
            }));

        } else {
            // สำหรับ User: ข่าว + สถานะการจอง
            const [newsRes, bookingRes] = await Promise.all([
                db.query('SELECT id, title, created_at FROM news WHERE is_visible = 1 ORDER BY created_at DESC LIMIT 5'),
                db.query('SELECT id, status, booking_date, updated_at FROM bookings WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10', [userId])
            ]);

            const news = newsRes[0] || [];
            const myBookings = bookingRes[0] || [];

            news.forEach(n => notifications.push({
                id: `user-news-${n.id}`,
                type: 'news',
                title: 'ข่าวสารใหม่',
                message: n.title,
                time_ago: n.created_at,
                link: `/news/${n.id}`
            }));

            myBookings.forEach(b => {
                const statusMap = {
                    'approved': 'อนุมัติแล้ว',
                    'rejected': 'ปฏิเสธแล้ว',
                    'pending': 'รอตรวจสอบ',
                    'cancelled': 'ยกเลิกแล้ว'
                };
                notifications.push({
                    id: `user-bk-${b.id}`,
                    type: 'booking_status',
                    title: 'อัปเดตสถานะการจอง',
                    message: `รายการวันที่ ${new Date(b.booking_date).toLocaleDateString('th-TH')} ${statusMap[b.status] || b.status}`,
                    time_ago: b.updated_at,
                    link: '/profile'
                });
            });
        }

        // เรียงลำดับ (ล่าสุดไปเก่าสุด) และป้องกันค่า null
        notifications.sort((a, b) => new Date(b.time_ago || 0) - new Date(a.time_ago || 0));

        res.json({
            unreadCount: notifications.length,
            items: notifications
        });

    } catch (error) {
        console.error("Noti Error:", error);
        res.status(500).json({ message: "Internal Server Error", items: [] });
    }
};