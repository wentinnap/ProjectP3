const db = require('../config/database');

exports.getNotificationSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let notifications = [];

        // ==========================================
        // 1. กรณีเป็น ADMIN (ตรวจสอบการจอง และ คำถาม)
        // ==========================================
        if (userRole === 'admin') {
            const [bookingRes, qnaRes] = await Promise.all([
                // ตรวจสอบจากตาราง bookings
                db.query('SELECT id, full_name, created_at FROM bookings WHERE status = "pending" ORDER BY created_at DESC LIMIT 10'),
                
                // ✅ แก้ไข SQL: ใช้ LENGTH และ TRIM แทนการใช้ "" เพื่อป้องกัน Error Unknown column
                db.query('SELECT id, question, created_at FROM qna WHERE answer IS NULL OR LENGTH(TRIM(answer)) = 0 ORDER BY created_at DESC LIMIT 10')
            ]);

            const pendingBookings = bookingRes[0] || [];
            const pendingQna = qnaRes[0] || [];

            // จัดรูปแบบแจ้งเตือนการจอง (Admin)
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

            // จัดรูปแบบแจ้งเตือนคำถาม (Admin)
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
        // 2. กรณีเป็น USER (ตรวจสอบข่าวสาร และ สถานะการจองตัวเอง)
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

            // แจ้งข่าวสารใหม่
            newsItems.forEach(n => {
                notifications.push({
                    id: `user-news-${n.id}`,
                    type: 'news',
                    title: 'ข่าวสารใหม่จากวัด',
                    message: n.title,
                    time_ago: n.created_at,
                    link: `/news/${n.id}`
                });
            });

            // แจ้งสถานะการจอง (User)
            userBookings.forEach(b => {
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
                    message: `รายการวันที่ ${new Date(b.booking_date).toLocaleDateString('th-TH')} สถานะ: ${statusMap[b.status] || b.status}`,
                    time_ago: b.updated_at,
                    link: '/profile'
                });
            });
        }

        // เรียงลำดับแจ้งเตือนล่าสุดขึ้นก่อนเสมอ
        notifications.sort((a, b) => new Date(b.time_ago) - new Date(a.time_ago));

        res.json({
            success: true,
            unreadCount: notifications.length,
            items: notifications
        });

    } catch (error) {
        // บันทึก Error ลง Log ของ Render เพื่อการตรวจสอบ
        console.error("Noti Error Details:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลแจ้งเตือน",
            error: error.message,
            items: []
        });
    }
};