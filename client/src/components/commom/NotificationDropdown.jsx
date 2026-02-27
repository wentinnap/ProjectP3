import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, CalendarCheck, Circle } from "lucide-react";
import { notificationAPI } from "../../services/api";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ unreadCount: 0, items: [] });

  const refreshNoti = async () => {
    try {
      const summary = await notificationAPI.getSummary();
      setData(summary);
    } catch (err) {
      console.error("Cannot refresh notifications");
    }
  };

  useEffect(() => {
    refreshNoti();
    const timer = setInterval(refreshNoti, 60000); // เช็คทุก 1 นาที
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-gray-50 hover:bg-orange-50 rounded-2xl transition-all group"
      >
        <Bell size={22} className={data.unreadCount > 0 ? "text-orange-500 animate-bounce" : "text-gray-400"} />
        {data.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {data.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-80 bg-white rounded-4xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <span className="font-black text-gray-800 text-xs uppercase tracking-widest">การแจ้งเตือน</span>
              <button onClick={refreshNoti} className="text-[10px] font-bold text-orange-500 hover:underline">รีเฟรช</button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {data.items.length > 0 ? (
                data.items.map((item) => (
                  <Link 
                    to={item.link} 
                    key={item.id}
                    onClick={() => setIsOpen(false)}
                    className="p-4 border-b border-gray-50 hover:bg-orange-50/30 flex gap-4 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'qna' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                      {item.type === 'qna' ? <MessageCircle size={18} /> : <CalendarCheck size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.desc}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                  ไม่มีรายการค้างคา
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;