import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, CalendarCheck } from "lucide-react";
import { notificationAPI } from "../../services/api";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ unreadCount: 0, items: [] });

  const refreshNoti = async () => {
    try {
      const summary = await notificationAPI.getSummary();
      setData(summary);
    } catch (err) {
      console.error("Fetch Noti Failed:", err);
    }
  };

  useEffect(() => {
    refreshNoti();
    const timer = setInterval(refreshNoti, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      {/* ปุ่มกระดิ่งพร้อมจุดแดง */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white border border-orange-100 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all shadow-sm group"
      >
        <Bell size={22} className={data.unreadCount > 0 ? "text-orange-500" : ""} />
        
        {/* ✅ จุดแดง (Notification Dot) */}
        {data.unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Dropdown Panel - สไตล์ตามรูปที่ส่งมา */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right p-2">
            
            <div className="p-6 pb-2 flex justify-between items-center">
              <h3 className="font-black text-gray-800 tracking-tight">การแจ้งเตือน</h3>
              <button onClick={refreshNoti} className="text-xs font-bold text-orange-500 hover:text-orange-600">รีเฟรช</button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {data.items.length > 0 ? (
                data.items.map((item) => (
                  <Link 
                    to={item.link} 
                    key={item.id}
                    onClick={() => setIsOpen(false)}
                    className="m-2 p-4 rounded-[1.8rem] hover:bg-orange-50/50 flex gap-4 transition-all group border border-transparent hover:border-orange-100"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${item.type === 'qna' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                      {item.type === 'qna' ? <MessageCircle size={20} /> : <CalendarCheck size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-black text-gray-800 truncate">{item.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1 font-medium">{item.desc}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell size={24} className="text-gray-200" />
                   </div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ไม่มีรายการใหม่</p>
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