const db = require('../config/database');

exports.getNotificationSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let notifications = [];

        if (userRole === 'admin') {
            // สำหรับ Admin: ดึงข้อมูลการจองที่รออนุมัติ และคำถามที่ยังไม่ได้ตอบ
            const [bookingRes, qnaRes] = await Promise.all([
                db.query('SELECT id, full_name, created_at FROM bookings WHERE status = "pending" ORDER BY created_at DESC LIMIT 10'),
                // ✅ แก้ไขเป็น answer ตามโครงสร้างตาราง qna ของคุณ
                db.query('SELECT id, question, created_at FROM qna WHERE answer IS NULL OR answer = "" ORDER BY created_at DESC LIMIT 10')
            ]);

            const pendingBookings = bookingRes[0] || [];
            const pendingQna = qnaRes[0] || [];

            // จัดใส่ Array การแจ้งเตือนของ Admin
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
                title: 'มีคำถามใหม่ที่ยังไม่ได้ตอบ',
                message: q.question?.substring(0, 50) + (q.question?.length > 50 ? '...' : ''),
                time_ago: q.created_at,
                link: '/admin/qna'
            }));

        } else {
            // สำหรับ User: ดึงข่าวสาร และสถานะการจองของตัวเอง
            const [newsRes, bookingRes] = await Promise.all([
                db.query('SELECT id, title, created_at FROM news WHERE is_visible = 1 ORDER BY created_at DESC LIMIT 5'),
                db.query('SELECT id, status, booking_date, updated_at FROM bookings WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10', [userId])
            ]);

            const news = newsRes[0] || [];
            const myBookings = bookingRes[0] || [];

            news.forEach(n => notifications.push({
                id: `user-news-${n.id}`,
                type: 'news',
                title: 'ข่าวสารใหม่จากวัด',
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
                    message: `รายการวันที่ ${new Date(b.booking_date).toLocaleDateString('th-TH')} สถานะ: ${statusMap[b.status] || b.status}`,
                    time_ago: b.updated_at,
                    link: '/profile'
                });
            });
        }

        // เรียงลำดับจากล่าสุดไปเก่าสุด (Latest First)
        notifications.sort((a, b) => new Date(b.time_ago || 0) - new Date(a.time_ago || 0));

        // ส่งข้อมูลกลับไปที่ Frontend
        res.json({
            unreadCount: notifications.length,
            items: notifications
        });

    } catch (error) {
        // พ่น Error ออกมาดูที่ Render Logs หากเกิดปัญหา
        console.error("Noti Error Details:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message,
            items: [] 
        });
    }
};