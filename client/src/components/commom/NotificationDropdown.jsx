import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, Newspaper, Info, CalendarCheck, MessageCircle, RefreshCw, CheckCheck } from "lucide-react";
import { notificationAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ unreadCount: 0, items: [] });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // 1. ดึงข้อมูลแจ้งเตือน
  const fetchNoti = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationAPI.getSummary();
      setData({
        unreadCount: res.unreadCount || 0,
        items: res.items || [],
      });
    } catch (err) {
      console.error("Dropdown Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 2. ฟังก์ชันจัดการการคลิกอ่านรายตัว
  const handleItemClick = async (itemId) => {
    setIsOpen(false);
    
    // Optimistic Update: เอาออกทันที
    setData((prev) => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1),
      items: prev.items.filter((item) => item.id !== itemId),
    }));

    try {
      await notificationAPI.markAsRead(itemId);
    } catch (err) {
      console.error("Failed to mark as read:", err);
      fetchNoti(); // กรณี Error ให้ดึงข้อมูลใหม่เพื่อ Sync กับ Server
    }
  };

  // 3. ✅ ฟังก์ชันล้างการแจ้งเตือนทั้งหมด (Mark All as Read)
  const handleMarkAllAsRead = async () => {
    // เก็บข้อมูลเดิมไว้เผื่อกรณี API Error จะได้ Rollback ได้
    const previousData = data;

    // Optimistic Update: เคลียร์หน้าจอทันที
    setData({ unreadCount: 0, items: [] });

    try {
      await notificationAPI.markAllAsRead(); // ต้องมี endpoint นี้ใน service ของคุณ
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setData(previousData); // คืนค่าเดิมถ้าล้มเหลว
      alert("ไม่สามารถล้างรายการได้ในขณะนี้");
    }
  };

  // จัดการปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch ข้อมูลเมื่อโหลดหน้าและ Refresh ทุก 1 นาที
  useEffect(() => {
    fetchNoti();
    const interval = setInterval(fetchNoti, 60000);
    return () => clearInterval(interval);
  }, [fetchNoti]);

  // กำหนดสีและ Icon ตามประเภท
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
      {/* ปุ่มกระดิ่งแจ้งเตือน */}
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Section */}
          <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-800 text-base">การแจ้งเตือน</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                {user?.role === "admin" ? "Admin System" : "Personal Notifications"}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* ✅ ปุ่มล้างทั้งหมด */}
              {data.items.length > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-orange-500 hover:text-orange-600 px-3 py-1.5 hover:bg-orange-50 rounded-xl transition-all"
                >
                  <CheckCheck size={14} />
                  ล้างทั้งหมด
                </button>
              )}

              {/* ปุ่ม Refresh */}
              <button 
                onClick={(e) => { e.stopPropagation(); fetchNoti(); }} 
                className={`p-2 hover:bg-gray-100 rounded-full transition-all ${loading ? "animate-spin" : ""}`}
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* List Section */}
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {data.items && data.items.length > 0 ? (
              data.items.map((item) => (
                <Link 
                  key={item.id} 
                  to={item.link} 
                  onClick={() => handleItemClick(item.id)}
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
                      }) : "เมื่อครู่นี้"}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              // Empty State
              <div className="py-20 text-center px-10">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Bell size={24} className="text-gray-200" />
                </div>
                <p className="text-gray-400 font-bold text-sm">ไม่มีรายการแจ้งเตือน</p>
                <p className="text-gray-300 text-xs mt-1 font-medium">คุณได้อ่านข่าวสารครบถ้วนแล้ว</p>
              </div>
            )}
          </div>

          {/* Footer (Optional) */}
          {data.items.length > 0 && (
            <div className="p-3 bg-gray-50/30 text-center border-t border-gray-50">
               <span className="text-[10px] text-gray-400 font-medium">แสดงรายการล่าสุด {data.items.length} รายการ</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;