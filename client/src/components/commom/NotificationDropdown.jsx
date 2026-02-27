import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, CalendarCheck, Newspaper, Info, RefreshCw } from "lucide-react";
import { notificationAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ unreadCount: 0, items: [] });
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await notificationAPI.getSummary();
      // ดึงค่าตรงๆ จาก res (เพราะเราแก้ api.js ให้ return object ปกติแล้ว)
      setData({
        unreadCount: res.unreadCount || 0,
        items: res.items || []
      });
    } catch (err) {
      console.error("UI Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const getStyle = (type) => {
    const styles = {
      news: { icon: <Newspaper size={18} />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
      booking_status: { icon: <Info size={18} />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
      new_booking: { icon: <CalendarCheck size={18} />, color: 'bg-orange-50 text-orange-600 border-orange-100' },
      qna: { icon: <MessageCircle size={18} />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' }
    };
    return styles[type] || { icon: <Bell size={18} />, color: 'bg-gray-50 text-gray-600 border-gray-100' };
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white border border-gray-100 text-gray-500 hover:text-orange-500 rounded-2xl transition-all shadow-sm active:scale-95"
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
          <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            
            <div className="p-6 pb-4 flex justify-between items-center border-b border-gray-50">
              <div>
                <h3 className="font-black text-gray-800 text-lg tracking-tight">การแจ้งเตือน</h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  {data.unreadCount > 0 ? `คุณมี ${data.unreadCount} รายการใหม่` : 'ไม่มีรายการค้างอ่าน'}
                </p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); fetchNotifications(); }} 
                className={`p-2 rounded-xl hover:bg-gray-50 transition-colors ${loading ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2 scrollbar-hide">
              {data.items.length > 0 ? (
                data.items.map((item) => {
                  const style = getStyle(item.type);
                  return (
                    <Link 
                      to={item.link} 
                      key={item.id}
                      onClick={() => setIsOpen(false)}
                      className="flex gap-4 p-4 m-1 rounded-3xl transition-all border border-transparent hover:border-orange-100 hover:bg-orange-50/30 group"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${style.color}`}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-[14px] font-bold text-gray-800 mb-0.5 group-hover:text-orange-600 transition-colors">{item.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">{item.time_ago}</p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={24} className="text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold text-sm">ยังไม่มีการแจ้งเตือนในขณะนี้</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50/50">
              <Link 
                to={user?.role === 'admin' ? "/admin/bookings" : "/profile"} 
                className="flex items-center justify-center w-full py-3 bg-white rounded-2xl text-[11px] font-black text-gray-500 hover:text-orange-600 shadow-sm border border-gray-100 transition-all uppercase tracking-[0.15em]"
                onClick={() => setIsOpen(false)}
              >
                ดูประวัติทั้งหมด
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;