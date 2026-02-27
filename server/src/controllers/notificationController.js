const db = require('../config/database');

exports.getNotificationSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let notifications = [];

        // ==========================================
        // 1. กรณีเป็น ADMIN (จัดการคำขอจอง และ คำถาม QnA)
        // ==========================================
        if (userRole === 'admin') {
            const [bookingRes, qnaRes] = await Promise.all([
                // ตรวจสอบจากตาราง bookings
                db.query('SELECT id, full_name, created_at FROM bookings WHERE status = "pending" ORDER BY created_at DESC LIMIT 10'),
                // ตรวจสอบจากตาราง qna
                // ✅ แก้ไขเป็น answer IS NULL ตามโครงสร้างจริงของคุณ
                db.query('SELECT id, question, created_at FROM qna WHERE answer IS NULL OR answer = "" ORDER BY created_at DESC LIMIT 10')
            ]);

            const pendingBookings = bookingRes[0] || [];
            const pendingQna = qnaRes[0] || [];

            // เพิ่มรายการแจ้งเตือนการจองใหม่
            pendingBookings.forEach(b => {
                notifications.push({
                    id: `admin-bk-${b.id}`,
                    type: 'new_booking',
                    title: 'มีคำขอจองใหม่',
                    message: `คุณ ${b.full_name} ได้ส่งคำขอจองใหม่เข้ามา`,
                    time_ago: b.created_at,
                    link: '/admin/bookings'
                });
            });

            // เพิ่มรายการแจ้งเตือนคำถามใหม่
            pendingQna.forEach(q => {
                notifications.push({
                    id: `admin-qna-${q.id}`,
                    type: 'qna',
                    title: 'คำถามที่ยังไม่ได้ตอบ',
                    message: q.question ? (q.question.substring(0, 50) + (q.question.length > 50 ? '...' : '')) : 'มีคำถามใหม่',
                    time_ago: q.created_at,
                    link: '/admin/qna'
                });
            });

        // ==========================================
        // 2. กรณีเป็น USER (ดูสถานะการจอง และ ข่าวสาร)
        // ==========================================
        } else {
            const [newsRes, myBookingRes] = await Promise.all([
                // ตรวจสอบข่าวสาร
                db.query('SELECT id, title, created_at FROM news WHERE is_visible = 1 ORDER BY created_at DESC LIMIT 5'),
                // ตรวจสอบสถานะการจองของตนเอง
                db.query('SELECT id, status, booking_date, updated_at FROM bookings WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10', [userId])
            ]);

            const newsItems = newsRes[0] || [];
            const userBookings = myBookingRes[0] || [];

            // ข่าวสารใหม่
            newsItems.forEach(n => {
                notifications.push({
                    id: `user-news-${n.id}`,
                    type: 'news',
                    title: 'ข่าวสารใหม่',
                    message: n.title,
                    time_ago: n.created_at,
                    link: `/news/${n.id}`
                });
            });

            // สถานะการจองเปลี่ยนไป
            userBookings.forEach(b => {
                const statusMap = {
                    'approved': 'ได้รับการอนุมัติ',
                    'rejected': 'ถูกปฏิเสธ',
                    'pending': 'รอตรวจสอบ',
                    'cancelled': 'ถูกยกเลิก'
                };
                notifications.push({
                    id: `user-bk-${b.id}`,
                    type: 'booking_status',
                    title: 'อัปเดตสถานะการจอง',
                    message: `รายการวันที่ ${new Date(b.booking_date).toLocaleDateString('th-TH')} คือ "${statusMap[b.status] || b.status}"`,
                    time_ago: b.updated_at,
                    link: '/profile'
                });
            });
        }

        // เรียงลำดับตามวันเวลา (ใหม่สุดอยู่บน)
        notifications.sort((a, b) => new Date(b.time_ago) - new Date(a.time_ago));

        res.json({
            success: true,
            unreadCount: notifications.length,
            items: notifications
        });

    } catch (error) {
        console.error("Noti Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message, // ส่ง Error ออกไปดูว่าพังที่จุดไหน
            items: []
        });
    }
};