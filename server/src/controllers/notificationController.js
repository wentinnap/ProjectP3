const db = require('../config/database');

exports.getNotificationSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let notifications = [];

        if (userRole === 'admin') {
            const [bookingRes, qnaRes] = await Promise.all([
                // ✅ แก้ไข: ใช้ 'pending' (Single Quote) แทน "pending"
                db.query("SELECT id, full_name, created_at FROM bookings WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10"),
                
                // ✅ แก้ไข: ใช้ IS NULL หรือเช็คความยาวข้อความให้ชัวร์
                db.query("SELECT id, question, created_at FROM qna WHERE answer IS NULL OR TRIM(answer) = '' ORDER BY created_at DESC LIMIT 10")
            ]);

            const pendingBookings = bookingRes[0] || [];
            const pendingQna = qnaRes[0] || [];

            pendingBookings.forEach(b => {
                notifications.push({
                    id: `admin-bk-${b.id}`,
                    type: 'new_booking',
                    title: 'มีคำขอจองใหม่',
                    message: `คุณ ${b.full_name} ส่งคำขอจองใหม่`,
                    time_ago: b.created_at,
                    link: '/admin/bookings'
                });
            });

            pendingQna.forEach(q => {
                notifications.push({
                    id: `admin-qna-${q.id}`,
                    type: 'qna',
                    title: 'คำถามที่ยังไม่ได้ตอบ',
                    message: q.question ? (q.question.substring(0, 50) + '...') : 'มีคำถามใหม่',
                    time_ago: q.created_at,
                    link: '/admin/qna'
                });
            });

        } else {
            // ส่วนของ User (ถ้ามี)
            const [newsRes, myBookingRes] = await Promise.all([
                db.query("SELECT id, title, created_at FROM news WHERE is_visible = 1 ORDER BY created_at DESC LIMIT 5"),
                db.query("SELECT id, status, booking_date, updated_at FROM bookings WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10", [userId])
            ]);

            const newsItems = newsRes[0] || [];
            const userBookings = myBookingRes[0] || [];

            newsItems.forEach(n => {
                notifications.push({ id: `user-news-${n.id}`, type: 'news', title: 'ข่าวสารใหม่', message: n.title, time_ago: n.created_at, link: `/news/${n.id}` });
            });

            userBookings.forEach(b => {
                const statusMap = { 'approved': 'อนุมัติแล้ว', 'rejected': 'ปฏิเสธแล้ว', 'pending': 'รอตรวจสอบ', 'cancelled': 'ยกเลิกแล้ว' };
                notifications.push({
                    id: `user-bk-${b.id}`,
                    type: 'booking_status',
                    title: 'อัปเดตสถานะการจอง',
                    message: `รายการวันที่ ${new Date(b.booking_date).toLocaleDateString('th-TH')} สถานะ: ${statusMap[b.status] || b.status}`,
                    time_ago: b.updated_at,
                    link: '/profile'
                });
            });
        }

        notifications.sort((a, b) => new Date(b.time_ago) - new Date(a.time_ago));

        res.json({
            success: true,
            unreadCount: notifications.length,
            items: notifications
        });

    } catch (error) {
        console.error("Noti Error Details:", error); // ดู Error เต็มๆ ใน Render Log
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
            items: []
        });
    }
};