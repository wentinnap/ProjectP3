import React, { useEffect, useState, useCallback, useRef } from "react";
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

  // ดึงข้อมูลแจ้งเตือน
  const fetchNoti = useCallback(async () => {
    // เช็กทั้ง user และ ID (เผื่อ field ชื่อไม่ตรงกัน)
    const userId = user?.id || user?._id || user?.user_id;
    if (!userId) return;

    try {
      setLoading(true);
      const res = user.role === "admin" 
        ? await notificationAPI.getAdminSummary() 
        : await notificationAPI.getUserSummary();
      
      setData({
        unreadCount: res.unreadCount || 0,
        items: res.items || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNoti();
    const timer = setInterval(fetchNoti, 60000); // อัปเดตทุก 1 นาที
    return () => clearInterval(timer);
  }, [fetchNoti]);

  const getStyle = (type) => {
    const styles = {
      news: { icon: <Newspaper size={18} />, color: "bg-blue-50 text-blue-600" },
      booking_status: { icon: <Info size={18} />, color: "bg-purple-50 text-purple-600" },
      new_booking: { icon: <CalendarCheck size={18} />, color: "bg-orange-50 text-orange-600" },
      qna: { icon: <MessageCircle size={18} />, color: "bg-cyan-50 text-cyan-600" },
    };
    return styles[type] || { icon: <Bell size={18} />, color: "bg-gray-50 text-gray-400" };
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:text-orange-500 transition-all relative"
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
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">การแจ้งเตือน</h3>
            <button onClick={fetchNoti} className={loading ? "animate-spin" : ""}>
              <RefreshCw size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {data.items.length > 0 ? (
              data.items.map((item) => (
                <Link 
                  key={item.id} 
                  to={item.link} 
                  className="flex gap-4 p-4 hover:bg-orange-50/30 transition-all border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getStyle(item.type).color}`}>
                    {getStyle(item.type).icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">{new Date(item.time_ago).toLocaleString('th-TH')}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400 text-sm">ไม่มีรายการใหม่</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;