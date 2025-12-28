import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Ban, Phone, Mail, User, Sparkles, Filter, ChevronDown } from 'lucide-react';
import Navbar from "../../components/layout/Navbar";

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
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bookingAPI.getUserBookings(params);
      setBookings(response.data.data.bookings);
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
      },
      cancelled: { 
        bg: 'bg-gray-50', 
        text: 'text-gray-600', 
        border: 'border-gray-200',
        icon: Ban, 
        label: 'ยกเลิกแล้ว' 
      },
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
    return timeString.slice(0, 5);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 font-sans pb-20">
        
        {/* Profile Header - Luxury Gradient */}
        <div className="bg-white pb-6 pt-28 relative overflow-hidden shadow-sm">
            {/* Updated Gradient Syntax for Tailwind v4 */}
            <div className="absolute top-0 left-0 w-full h-48 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Profile Card */}
                    <div className="bg-white rounded-4xl shadow-xl p-6 md:p-8 mt-10 border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                        {/* Avatar */}
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-white p-1.5 shadow-lg -mt-16 md:-mt-20 relative z-20">
                            <div className="w-full h-full rounded-2xl bg-linear-to-br from-orange-100 to-amber-50 flex items-center justify-center text-5xl md:text-6xl font-bold text-orange-500 border border-orange-100">
                                {user?.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left space-y-2 pt-2">
                             <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold mb-1">
                                <Sparkles size={12} />
                                <span>สมาชิกทั่วไป</span>
                             </div>
                             <h1 className="text-3xl font-bold text-gray-800">{user?.full_name}</h1>
                             
                             <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 text-sm mt-2">
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Mail size={16} className="text-orange-400" />
                                    <span>{user?.email}</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                        <Phone size={16} className="text-orange-400" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Bookings Section */}
        {/* Changed -mt-4 to mt-8 to fix overlapping issue */}
        <div className="container mx-auto px-4 mt-8">
          <div className="max-w-5xl mx-auto">
             
            {/* Main Content Card */}
            <div className="bg-white rounded-4xl shadow-sm border border-gray-100 p-6 md:p-8">
                
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b border-gray-50 pb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <Calendar className="text-orange-600 w-6 h-6" />
                        </div>
                        ประวัติการจองพิธี
                    </h2>
                    
                    <div className="bg-gray-50 p-1 rounded-xl flex overflow-x-auto max-w-full no-scrollbar">
                        {[
                            { id: 'all', label: 'ทั้งหมด' },
                            { id: 'pending', label: 'รอตอบรับ' },
                            { id: 'approved', label: 'อนุมัติ' },
                            { id: 'rejected', label: 'ปฏิเสธ' },
                            { id: 'cancelled', label: 'ยกเลิก' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                    filter === tab.id
                                        ? 'bg-white text-orange-600 shadow-sm font-bold'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-400 text-sm">กำลังโหลดข้อมูล...</p>
                </div>
                ) : bookings.length > 0 ? (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="group bg-gray-50/50 hover:bg-white rounded-3xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                                    {booking.booking_type_name}
                                </h3>
                                {getStatusBadge(booking.status)}
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                                {booking.booking_type_description}
                            </p>
                        </div>
                        
                        {/* Date & Time Box */}
                        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-gray-200 group-hover:border-orange-100 shadow-sm">
                            <div className="text-center border-r border-gray-100 pr-4">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">วันที่</p>
                                <p className="text-gray-800 font-bold">{formatDate(booking.booking_date)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">เวลา</p>
                                <p className="text-orange-600 font-bold">{formatTime(booking.booking_time)} น.</p>
                            </div>
                        </div>
                        </div>

                        {/* Details Section */}
                        {booking.details && (
                        <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-600">
                                <span className="font-bold text-gray-700 mr-2">รายละเอียดเพิ่มเติม:</span> 
                                {booking.details}
                            </p>
                        </div>
                        )}

                        {/* Admin Response Section */}
                        {booking.admin_response && (
                        <div className={`mt-4 p-4 rounded-2xl border flex gap-3 animate-in fade-in slide-in-from-top-2 ${
                            booking.status === 'approved' 
                                ? 'bg-green-50 border-green-100' 
                                : 'bg-red-50 border-red-100'
                        }`}>
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                                booking.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                                {booking.status === 'approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            </div>
                            
                            <div className="flex-1">
                                <p className={`text-sm font-bold mb-0.5 ${
                                    booking.status === 'approved' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {booking.status === 'approved' ? 'อนุมัติการจอง' : 'ขออภัย คำขอถูกปฏิเสธ'}
                                </p>
                                <p className={`text-sm leading-relaxed ${
                                    booking.status === 'approved' ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    "{booking.admin_response}"
                                </p>
                                {booking.admin_name && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-white/50 flex items-center justify-center text-[8px] font-bold border border-black/5">
                                        {booking.admin_name.charAt(0)}
                                    </div>
                                    <span className="text-xs opacity-70 font-medium">ตอบโดย: {booking.admin_name}</span>
                                </div>
                                )}
                            </div>
                        </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-gray-200/50 flex justify-end">
                             <p className="text-xs text-gray-400 font-medium">
                                ทำรายการเมื่อ: {new Date(booking.created_at).toLocaleString('th-TH')}
                             </p>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                        <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {filter === 'all' ? 'ยังไม่มีประวัติการจอง' : 'ไม่พบรายการในสถานะนี้'}
                    </h3>
                    <p className="text-gray-500 mb-6 text-sm">
                        คุณสามารถจองพิธีกรรมใหม่ได้ที่หน้าจองพิธี
                    </p>
                    <Link to="/booking" className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 text-sm">
                        <Sparkles size={16} />
                        <span>จองพิธีใหม่</span>
                    </Link>
                </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;