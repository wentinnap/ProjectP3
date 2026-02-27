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

  // ✅ แก้ไข: ดึงข้อมูลสรุปจาก Backend เพียงจุดเดียว
  const fetchNoti = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationAPI.getSummary();
      setData({
        unreadCount: res.unreadCount,
        items: res.items,
      });
    } catch (err) {
      console.error("Dropdown Fetch Error:", err);
      setData({ unreadCount: 0, items: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ปิดเมื่อคลิกที่อื่น
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    fetchNoti();
    const interval = setInterval(fetchNoti, 60000); 
    return () => clearInterval(interval);
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
        className="relative p-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
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
          <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-800">การแจ้งเตือน</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                {user?.role === "admin" ? "ระบบผู้ดูแล" : "ข่าวสารสำหรับคุณ"}
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); fetchNoti(); }} 
              className={`p-2 hover:bg-gray-100 rounded-full transition-all ${loading ? "animate-spin" : ""}`}
            >
              <RefreshCw size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {data.items && data.items.length > 0 ? (
              data.items.map((item) => (
                <Link 
                  key={item.id} to={item.link} onClick={() => setIsOpen(false)}
                  className="flex gap-4 p-4 hover:bg-orange-50/40 transition-all border-b border-gray-50 last:border-0 group"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${getStyle(item.type).color}`}>
                    {getStyle(item.type).icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-800 group-hover:text-orange-600 transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[13px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold italic uppercase flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      {item.time_ago ? new Date(item.time_ago).toLocaleString("th-TH", {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }) : "เพิ่งเมื่อครู่"}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Bell size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-bold text-sm">ยังไม่มีรายการแจ้งเตือน</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;