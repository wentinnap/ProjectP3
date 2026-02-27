import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  Phone, Mail, User, Sparkles, ChevronRight 
} from 'lucide-react';
import Navbar from "../../components/layout/Navbar";
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUserBookings();
  }, [filter]);

  const fetchUserBookings = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลตาม Filter ที่เลือก
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bookingAPI.getUserBookings(params);
      
      // ✅ กรองออก: ไม่แสดงรายการที่มีสถานะเป็น 'cancelled' ในหน้า UI นี้เลย
      const allBookings = response.data.data.bookings;
      const filteredBookings = allBookings.filter(b => b.status !== 'cancelled');
      
      setBookings(filteredBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-700', 
        border: 'border-yellow-200',
        icon: AlertCircle, 
        label: 'รอการตอบรับ' 
      },
      approved: { 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        border: 'border-green-200',
        icon: CheckCircle, 
        label: 'อนุมัติแล้ว' 
      },
      rejected: { 
        bg: 'bg-red-50', 
        text: 'text-red-700', 
        border: 'border-red-200',
        icon: XCircle, 
        label: 'ถูกปฏิเสธ' 
      }
      // ✅ สถานะ cancelled ถูกนำออกถาวร
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
        <Icon size={14} />
        <span>{badge.label}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return timeString?.slice(0, 5) || "00:00";
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFCFB] font-sans pb-20">
        
        {/* --- Profile Header Section --- */}
        <div className="bg-white pb-6 pt-28 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-48 bg-linear-to-r from-orange-600 via-amber-500 to-yellow-500">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-4xl shadow-xl p-6 md:p-8 mt-10 border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative"
                    >
                        {/* Avatar */}
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-white p-1.5 shadow-lg -mt-16 md:-mt-20 relative z-20">
                            <div className="w-full h-full rounded-2xl bg-linear-to-br from-orange-100 to-amber-50 flex items-center justify-center text-5xl md:text-6xl font-black text-orange-500 border border-orange-50">
                                {user?.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left space-y-2 pt-2">
                             <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1 border border-orange-100">
                                <Sparkles size={12} />
                                <span>MEMBER</span>
                             </div>
                             <h1 className="text-3xl font-black text-gray-800 tracking-tight">{user?.full_name}</h1>
                             
                             <div className="flex flex-wrap justify-center md:justify-start gap-3 text-gray-500 text-sm mt-3">
                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                    <Mail size={16} className="text-orange-400" />
                                    <span className="font-medium text-gray-600">{user?.email}</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                        <Phone size={16} className="text-orange-400" />
                                        <span className="font-medium text-gray-600">{user.phone}</span>
                                    </div>
                                )}
                             </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>

        {/* --- Bookings History Section --- */}
        <div className="container mx-auto px-4 mt-12">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-100/50 p-6 md:p-10">
                
                {/* Header & Tabs */}
                <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">ประวัติการจอง</h2>
                            <p className="text-sm text-gray-400 font-medium">จัดการและตรวจสอบรายการจองของคุณ</p>
                        </div>
                    </div>
                    
                    {/* Tab Navigation (เอา 'ยกเลิก' ออกแล้ว) */}
                    <div className="bg-gray-100/80 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
                        {[
                            { id: 'all', label: 'ทั้งหมด' },
                            { id: 'pending', label: 'รอตอบรับ' },
                            { id: 'approved', label: 'อนุมัติแล้ว' },
                            { id: 'rejected', label: 'ปฏิเสธ' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                    filter === tab.id
                                        ? 'bg-white text-orange-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Content */}
                <AnimatePresence mode='wait'>
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">กำลังดึงข้อมูล</p>
                        </motion.div>
                    ) : bookings.length > 0 ? (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="grid gap-6"
                        >
                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500 relative overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <h3 className="text-xl font-black text-gray-800 group-hover:text-orange-600 transition-colors">
                                                    {booking.booking_type_name}
                                                </h3>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <p className="text-gray-500 text-[15px] leading-relaxed font-medium line-clamp-2">
                                                {booking.booking_type_description || 'รายละเอียดพิธีกรรมสำหรับพุทธศาสนิกชน'}
                                            </p>
                                        </div>
                                        
                                        {/* DateTime Badge */}
                                        <div className="flex items-center gap-4 bg-orange-50/50 px-6 py-4 rounded-3xl border border-orange-100 group-hover:bg-orange-50 transition-colors">
                                            <div className="text-center pr-4 border-r border-orange-100">
                                                <p className="text-[10px] text-orange-400 font-black uppercase tracking-tighter mb-1">วัน/เดือน/ปี</p>
                                                <p className="text-gray-800 font-black whitespace-nowrap">{formatDate(booking.booking_date)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-orange-400 font-black uppercase tracking-tighter mb-1">เวลาเริ่ม</p>
                                                <p className="text-orange-600 font-black">{formatTime(booking.booking_time)} น.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Response Area */}
                                    {booking.admin_response && (
                                        <div className={`mt-6 p-5 rounded-2xl border ${
                                            booking.status === 'approved' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                                        }`}>
                                            <div className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                                    booking.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {booking.status === 'approved' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                                </div>
                                                <div>
                                                    <p className={`font-black text-sm mb-1 ${
                                                        booking.status === 'approved' ? 'text-green-800' : 'text-red-800'
                                                    }`}>
                                                        {booking.status === 'approved' ? 'ข้อความจากเจ้าหน้าที่' : 'สาเหตุที่ปฏิเสธ'}
                                                    </p>
                                                    <p className={`text-sm font-medium leading-relaxed opacity-80 ${
                                                        booking.status === 'approved' ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        "{booking.admin_response}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                            ID: #{String(booking.id).padStart(5, '0')}
                                        </span>
                                        <p className="text-[11px] text-gray-400 font-medium">
                                            ทำรายการเมื่อ: {new Date(booking.created_at).toLocaleString('th-TH')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar size={40} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">ไม่พบรายการจอง</h3>
                            <p className="text-gray-400 mb-8 max-w-xs mx-auto font-medium">คุณยังไม่ได้จองพิธีใดๆ หรือไม่มีรายการในหมวดหมู่ที่เลือก</p>
                            <Link to="/booking" className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-1">
                                <Sparkles size={20} />
                                <span>จองพิธีใหม่ตอนนี้</span>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;