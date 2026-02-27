import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, Newspaper, Info, CalendarCheck, MessageCircle, RefreshCw } from "lucide-react";
import { notificationAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ unreadCount: 0, items: [] });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNoti = useCallback(async () => {
    // เช็ก ID ของ user ให้ครอบคลุมทุกชื่อ field
    const userId = user?.id || user?._id || user?.user_id;
    if (!userId) return;

    try {
      setLoading(true);
      const res = user.role === "admin" 
        ? await notificationAPI.getAdminSummary() 
        : await notificationAPI.getUserSummary();
      
      setData({
        unreadCount: res?.unreadCount || 0,
        items: Array.isArray(res?.items) ? res.items : [],
      });
    } catch (err) {
      console.error("Fetch Noti Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ปิดเมื่อคลิกข้างนอก
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    fetchNoti();
    const timer = setInterval(fetchNoti, 60000);
    return () => clearInterval(timer);
  }, [fetchNoti]);

  const getStyle = (type) => {
    const map = {
      news: { icon: <Newspaper size={18} />, color: "bg-blue-50 text-blue-600" },
      booking_status: { icon: <Info size={18} />, color: "bg-purple-50 text-purple-600" },
      new_booking: { icon: <CalendarCheck size={18} />, color: "bg-orange-50 text-orange-600" },
      qna: { icon: <MessageCircle size={18} />, color: "bg-cyan-50 text-cyan-600" },
    };
    return map[type] || { icon: <Bell size={18} />, color: "bg-gray-50 text-gray-400" };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:text-orange-500 transition-all active:scale-95"
      >
        <Bell size={22} className={data.unreadCount > 0 ? "text-orange-500" : "text-gray-400"} />
        {data.unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative rounded-full h-3 w-3 bg-red-600 border-2 border-white"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 pb-4 flex justify-between items-center border-b border-gray-50 bg-gray-50/30">
            <div>
              <h3 className="font-black text-gray-800 text-lg">การแจ้งเตือน</h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                {user?.role === "admin" ? "โหมดผู้ดูแลระบบ" : "ข่าวสารสำหรับคุณ"}
              </p>
            </div>
            <button onClick={fetchNoti} className={loading ? "animate-spin" : ""}>
              <RefreshCw size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {data.items.length > 0 ? (
              data.items.map((item) => (
                <Link 
                  key={item.id} to={item.link} onClick={() => setIsOpen(false)}
                  className="flex gap-4 p-4 m-1 rounded-3xl hover:bg-orange-50/30 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getStyle(item.type).color}`}>
                    {getStyle(item.type).icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-800 group-hover:text-orange-600 transition-colors truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold italic uppercase">
                      {item.time_ago ? new Date(item.time_ago).toLocaleString("th-TH") : "เพิ่งเมื่อครู่"}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-20 text-center text-gray-400 font-bold text-sm">ยังไม่มีรายการแจ้งเตือน</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;