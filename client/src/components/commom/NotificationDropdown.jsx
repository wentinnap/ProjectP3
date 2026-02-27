import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Newspaper,
  Info,
  CalendarCheck,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { notificationAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const NotificationDropdown = () => {
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ unreadCount: 0, items: [] });
  const [loading, setLoading] = useState(false);

  const isMounted = useRef(true);

  // -----------------------------
  // Fetch Notification
  // -----------------------------
  const fetchNoti = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const res =
        user.role === "admin"
          ? await notificationAPI.getAdminSummary()
          : await notificationAPI.getUserSummary();

      if (!isMounted.current) return;

      setData({
        unreadCount: Number(res?.unreadCount) || 0,
        items: Array.isArray(res?.items) ? res.items : [],
      });
    } catch (err) {
      console.error("Notification Fetch Error:", err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [user?.id, user?.role]);

  // -----------------------------
  // Effect: Run when user ready
  // -----------------------------
  useEffect(() => {
    isMounted.current = true;

    if (!user?.id) return;

    fetchNoti();

    const timer = setInterval(fetchNoti, 60000);

    return () => {
      isMounted.current = false;
      clearInterval(timer);
    };
  }, [user?.id, fetchNoti]);

  // -----------------------------
  // Safe Date Formatter
  // -----------------------------
  const formatDate = (date) => {
    if (!date) return "เพิ่งเมื่อครู่";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "เพิ่งเมื่อครู่";
    return d.toLocaleString("th-TH");
  };

  // -----------------------------
  // Style Map
  // -----------------------------
  const getStyle = (type) => {
    const map = {
      news: {
        icon: <Newspaper size={18} />,
        color: "bg-blue-50 text-blue-600",
      },
      booking_status: {
        icon: <Info size={18} />,
        color: "bg-purple-50 text-purple-600",
      },
      new_booking: {
        icon: <CalendarCheck size={18} />,
        color: "bg-orange-50 text-orange-600",
      },
      qna: {
        icon: <MessageCircle size={18} />,
        color: "bg-cyan-50 text-cyan-600",
      },
    };

    return (
      map[type] || {
        icon: <Bell size={18} />,
        color: "bg-gray-50 text-gray-400",
      }
    );
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="relative font-sans">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:text-orange-500 transition-all active:scale-95"
      >
        <Bell
          size={22}
          className={
            data.unreadCount > 0 ? "text-orange-500" : "text-gray-400"
          }
        />

        {data.unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            {/* Header */}
            <div className="p-6 pb-4 flex justify-between items-center border-b border-gray-50">
              <div>
                <h3 className="font-black text-gray-800 text-lg">
                  การแจ้งเตือน
                </h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  {user?.role === "admin"
                    ? "โหมดผู้ดูแลระบบ"
                    : "ข่าวสารสำหรับคุณ"}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchNoti();
                }}
                className={`p-2 rounded-xl hover:bg-gray-50 ${
                  loading ? "animate-spin" : ""
                }`}
              >
                <RefreshCw size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[420px] overflow-y-auto p-2">
              {data.items.length > 0 ? (
                data.items.map((item) => {
                  const s = getStyle(item.type);

                  return (
                    <Link
                      to={item.link}
                      key={item.id}
                      onClick={() => setIsOpen(false)}
                      className="flex gap-4 p-4 m-1 rounded-3xl hover:bg-orange-50/30 transition-all group"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}
                      >
                        {s.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-gray-800 group-hover:text-orange-600 transition-colors truncate">
                          {item.title}
                        </p>

                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {item.message}
                        </p>

                        <p className="text-[10px] text-gray-400 mt-2 font-bold italic uppercase">
                          {formatDate(item.time_ago)}
                        </p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                    <Bell size={28} />
                  </div>
                  <p className="text-gray-400 font-bold text-sm">
                    ยังไม่มีรายการแจ้งเตือน
                  </p>
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