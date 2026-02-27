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

      const safeBookings = Array.isArray(rawBookings)
        ? rawBookings.filter((b) => b.status !== "cancelled")
        : [];

      setBookings(safeBookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
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
                          <h3 className="text-lg font-black">
                            {booking.booking_type_name}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="text-right text-sm">
                          <div>{formatDate(booking.booking_date)}</div>
                          <div className="text-orange-600 font-bold">
                            {formatTime(booking.booking_time)} น.
                          </div>
                        </div>
                      </div>

                      {booking.admin_response && (
                        <div className="mt-4 text-sm text-gray-600">
                          "{booking.admin_response}"
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
                    className="inline-block mt-6 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold"
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