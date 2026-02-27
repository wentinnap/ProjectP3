import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, CalendarCheck, Newspaper, Info, RefreshCw } from "lucide-react";
import { notificationAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext"; //

const NotificationDropdown = () => {
  const { user } = useAuth(); // ดึงข้อมูล user เพื่อระบุตัวตน
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ unreadCount: 0, items: [] });
  const [loading, setLoading] = useState(false);

  const refreshNoti = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // ส่ง userId ไปที่ API เพื่อดึงเฉพาะแจ้งเตือนของคนนี้เท่านั้น
      const response = await notificationAPI.getSummary({ userId: user.id });
      setData(response.data || { unreadCount: 0, items: [] });
    } catch (err) {
      console.error("Fetch Noti Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNoti();
    const timer = setInterval(refreshNoti, 60000); // อัปเดตทุก 1 นาที
    return () => clearInterval(timer);
  }, [user]);

  // ฟังก์ชันเลือกสีและไอคอนตามประเภท (ข่าวสารคนเดียว / สถานะจอง)
  const getStyle = (type) => {
    switch (type) {
      case 'news': // ข่าวสารใหม่เฉพาะคุณ
        return { icon: <Newspaper size={20} />, color: 'bg-blue-100 text-blue-600' };
      case 'booking_status': // แจ้งสถานะการจอง (อนุมัติ/ปฏิเสธ)
        return { icon: <Info size={20} />, color: 'bg-purple-100 text-purple-600' };
      case 'new_booking': // สำหรับ Admin (มีรายการจองเข้า)
        return { icon: <CalendarCheck size={20} />, color: 'bg-orange-100 text-orange-600' };
      case 'qna': // สำหรับ Admin (มีคำถามใหม่)
        return { icon: <MessageCircle size={20} />, color: 'bg-cyan-100 text-cyan-600' };
      default:
        return { icon: <Bell size={20} />, color: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <div className="relative font-sans">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-orange-500 rounded-2xl transition-all shadow-sm"
      >
        <Bell size={22} className={data.unreadCount > 0 ? "text-orange-500" : ""} />
        {data.unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-4xl shadow-2xl border border-gray-50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            
            <div className="p-6 pb-4 flex justify-between items-center border-b border-gray-50">
              <div>
                <h3 className="font-black text-gray-800 tracking-tight text-lg">การแจ้งเตือน</h3>
                <p className="text-xs text-gray-400 font-medium">คุณมี {data.unreadCount} รายการที่ยังไม่ได้อ่าน</p>
              </div>
              <button 
                onClick={refreshNoti} 
                className={`p-2 rounded-xl hover:bg-gray-50 transition-colors ${loading ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
              {data.items && data.items.length > 0 ? (
                data.items.map((item) => {
                  const style = getStyle(item.type);
                  return (
                    <Link 
                      to={item.link || "#"} 
                      key={item.id}
                      onClick={() => setIsOpen(false)}
                      className={`flex gap-4 p-4 m-1 rounded-3xl transition-all border border-transparent hover:border-orange-100 hover:bg-orange-50/30 group ${item.is_read ? 'opacity-70' : ''}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${style.color}`}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[14px] font-black text-gray-800 truncate leading-none pt-1">{item.title}</p>
                          {!item.is_read && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 font-medium leading-relaxed">{item.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">{item.time_ago || "เมื่อสักครู่"}</p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                    <Bell size={32} />
                  </div>
                  <p className="text-gray-400 font-bold text-sm">ไม่มีการแจ้งเตือนใหม่</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50/50">
              <Link 
                to={user?.role === 'admin' ? "/admin/dashboard" : "/profile"} 
                className="flex items-center justify-center w-full py-3 bg-white rounded-xl text-xs font-black text-gray-500 hover:text-orange-600 shadow-sm border border-gray-100 transition-all uppercase tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                ดูทั้งหมด
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;