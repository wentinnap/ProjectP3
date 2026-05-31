import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { bookingAPI } from "../../services/api";
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  // ✨ 1. เพิ่ม State สำหรับจัดการ Loading เฉพาะปุ่มที่ถูกกดยกเลิก
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  /* =========================
     FETCH WHEN USER READY
  ========================= */
  useEffect(() => {
    if (!user) return;
    fetchUserBookings();
  }, [filter, user]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);

      const params = filter !== "all" ? { status: filter } : {};
      const response = await bookingAPI.getUserBookings(params);

      const rawBookings =
        response?.data?.data?.bookings ||
        response?.data?.bookings ||
        response?.data ||
        [];

      // ✨ 2. เอา filter('cancelled') ออก เพื่อให้แสดงสถานะยกเลิกได้
      setBookings(Array.isArray(rawBookings) ? rawBookings : []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HANDLE CANCEL BOOKING (เพิ่มใหม่)
  ========================= */
  const handleCancelBooking = async (bookingId) => {
    const isConfirm = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?");
    if (!isConfirm) return;

    try {
      setCancelLoadingId(bookingId);
      
      const response = await bookingAPI.cancelBooking(bookingId);
      
      if (response.data.success) {
        alert("ยกเลิกการจองสำเร็จ");
        fetchUserBookings(); // โหลดข้อมูลใหม่
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการยกเลิกการจอง");
    } finally {
      setCancelLoadingId(null);
    }
  };

  /* =========================
     LOADING AUTH FIRST
  ========================= */
  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  /* =========================
     IF NOT LOGIN
  ========================= */
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400 font-bold">
            กรุณาเข้าสู่ระบบก่อนใช้งาน
          </p>
        </div>
      </>
    );
  }

  const getStatusBadge = (status) => {
    const map = {
      pending: {
        bg: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: AlertCircle,
        label: "รอการตอบรับ",
      },
      approved: {
        bg: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
        label: "อนุมัติแล้ว",
      },
      rejected: {
        bg: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        label: "ถูกปฏิเสธ",
      },
      // ✨ 3. เพิ่มรูปแบบ Badge สำหรับสถานะยกเลิก
      cancelled: { 
        bg: "bg-gray-50 text-gray-500 border-gray-200",
        icon: XCircle,
        label: "ยกเลิกแล้ว",
      },
    };

    const config = map[status] || map.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg}`}
      >
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (time) => time?.slice(0, 5) || "00:00";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#FDFCFB] pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* ================= PROFILE HEADER ================= */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">

              {/* Avatar */}
              <div className="w-28 h-28 rounded-3xl bg-linear-to-br from-orange-100 to-amber-50 flex items-center justify-center text-5xl font-black text-orange-500 border">
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-black mb-3">
                  <Sparkles size={12} />
                  MEMBER
                </div>

                <h1 className="text-3xl font-black text-gray-800">
                  {user?.full_name}
                </h1>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                    <Mail size={16} />
                    {user?.email}
                  </div>

                  {user?.phone && (
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                      <Phone size={16} />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= BOOKING SECTION ================= */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">

            {/* Tabs */}
            <div className="flex gap-2 mb-8 flex-wrap">
              {[
                { id: "all", label: "ทั้งหมด" },
                { id: "pending", label: "รอตอบรับ" },
                { id: "approved", label: "อนุมัติแล้ว" },
                { id: "rejected", label: "ปฏิเสธ" },
                { id: "cancelled", label: "ยกเลิกแล้ว" }, // ✨ 4. เพิ่มแท็บยกเลิกแล้ว
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
                    filter === tab.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
              ) : bookings.length > 0 ? (
                <div className="grid gap-6">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between flex-wrap gap-4">
                        <div>
                          <h3 className="text-lg font-black mb-2">
                            {booking.booking_type_name}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="text-right text-sm">
                          <div>{formatDate(booking.booking_date)}</div>
                          <div className="text-orange-600 font-bold mt-1">
                            {formatTime(booking.booking_time)} น.
                          </div>
                        </div>
                      </div>

                      {booking.admin_response && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">
                          <span className="font-bold text-gray-700">หมายเหตุจากวัด:</span> {booking.admin_response}
                        </div>
                      )}

                      {/* ✨ 5. ปุ่มยกเลิกการจอง (แสดงเฉพาะตอนรอตอบรับ) */}
                      {booking.status === "pending" && (
                        <div className="flex justify-end border-t border-gray-50 pt-4 mt-4">
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancelLoadingId === booking.id}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            {cancelLoadingId === booking.id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                                กำลังยกเลิก...
                              </>
                            ) : (
                              "ยกเลิกการจอง"
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Calendar size={40} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-medium">
                    ไม่พบรายการจอง
                  </p>

                  <Link
                    to="/booking"
                    className="inline-block mt-6 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold transition hover:bg-orange-600 hover:shadow-md"
                  >
                    จองพิธีใหม่
                  </Link>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;