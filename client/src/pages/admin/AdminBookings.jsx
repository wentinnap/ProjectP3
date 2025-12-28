import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, User, Phone, CheckCircle, XCircle, 
  AlertCircle, X, CheckCircle2, FileText, ChevronRight, 
  Filter, ArrowLeft // Import ArrowLeft
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseData, setResponseData] = useState({
    status: 'approved',
    admin_response: '',
  });

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bookingAPI.getAllAdmin(params);
      setBookings(response.data.data.bookings);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (booking) => {
    setSelectedBooking(booking);
    setResponseData({
      status: 'approved',
      admin_response: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setResponseData({
      status: 'approved',
      admin_response: '',
    });
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();

    try {
      await bookingAPI.updateStatus(selectedBooking.id, responseData);
      toast.success(
        responseData.status === 'approved' 
          ? 'อนุมัติการจองสำเร็จ' 
          : 'ปฏิเสธการจองสำเร็จ'
      );
      handleCloseModal();
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { 
        bg: 'bg-orange-50', 
        text: 'text-orange-600', 
        border: 'border-orange-200',
        icon: AlertCircle, 
        label: 'รอการตอบรับ' 
      },
      approved: { 
        bg: 'bg-green-50', 
        text: 'text-green-600', 
        border: 'border-green-200',
        icon: CheckCircle2, 
        label: 'อนุมัติแล้ว' 
      },
      rejected: { 
        bg: 'bg-red-50', 
        text: 'text-red-600', 
        border: 'border-red-200',
        icon: XCircle, 
        label: 'ถูกปฏิเสธ' 
      },
      cancelled: { 
        bg: 'bg-gray-50', 
        text: 'text-gray-500', 
        border: 'border-gray-200',
        icon: XCircle, 
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
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="container mx-auto px-4 py-4 md:py-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  {/* Title & Back Button */}
                  <div className="flex items-center gap-4">
                      <Link 
                          to="/admin" 
                          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all active:scale-95"
                          title="กลับไปหน้าแดชบอร์ด"
                      >
                          <ArrowLeft size={20} />
                      </Link>
                      <div>
                          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                              <FileText className="text-orange-500" />
                              จัดการการจอง
                          </h1>
                          <p className="text-gray-500 text-sm mt-0.5">ตรวจสอบ อนุมัติ และปฏิเสธคำขอจองพิธี</p>
                      </div>
                  </div>
                  
                  {/* Filter Tabs */}
                  <div className="bg-gray-100 p-1 rounded-xl flex overflow-x-auto max-w-full no-scrollbar ml-auto md:ml-0 w-full md:w-auto">
                        {[
                            { id: 'pending', label: 'รอตอบรับ' },
                            { id: 'approved', label: 'อนุมัติ' },
                            { id: 'rejected', label: 'ปฏิเสธ' },
                            { id: 'cancelled', label: 'ยกเลิก' },
                            { id: 'all', label: 'ทั้งหมด' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 md:flex-none ${
                                    filter === tab.id
                                        ? 'bg-white text-orange-600 shadow-sm font-bold'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                  </div>
              </div>
          </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Bookings List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid gap-6 max-w-5xl mx-auto">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              >
                {/* Status Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    booking.status === 'approved' ? 'bg-green-500' : 
                    booking.status === 'rejected' ? 'bg-red-500' :
                    booking.status === 'cancelled' ? 'bg-gray-300' : 'bg-orange-500'
                }`}></div>

                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Main Info */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{booking.booking_type_name}</h3>
                            {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold text-gray-800">{formatDate(booking.booking_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold text-gray-800">{formatTime(booking.booking_time)} น.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{booking.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{booking.phone}</span>
                            </div>
                        </div>

                        {booking.details && (
                            <p className="text-sm text-gray-500 mb-4 bg-white p-3 rounded-xl border border-gray-100">
                                <span className="font-bold text-gray-700 mr-1">รายละเอียดเพิ่มเติม:</span>
                                {booking.details}
                            </p>
                        )}

                        {booking.admin_response && (
                            <div className={`p-4 rounded-xl text-sm ${
                                booking.status === 'approved' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'
                            }`}>
                                <p className="font-bold mb-1">
                                    {booking.status === 'approved' ? 'ข้อความตอบกลับ:' : 'เหตุผลที่ปฏิเสธ:'}
                                </p>
                                <p>{booking.admin_response}</p>
                                {booking.admin_name && (
                                    <p className="text-xs mt-2 opacity-70 border-t border-black/5 pt-2">ดำเนินการโดย: {booking.admin_name}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-between items-end border-l border-gray-100 pl-6 min-w-[150px]">
                        <div className="text-xs text-gray-400 mb-4 text-right">
                            จองเมื่อ<br/>{new Date(booking.created_at).toLocaleString('th-TH')}
                        </div>
                        
                        {booking.status === 'pending' ? (
                            <button
                                onClick={() => handleOpenModal(booking)}
                                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>จัดการ</span>
                                <ChevronRight size={16} />
                            </button>
                        ) : (
                            <div className="w-full py-2 text-center text-gray-400 bg-gray-50 rounded-xl text-sm font-medium border border-gray-100 cursor-not-allowed">
                                ดำเนินการแล้ว
                            </div>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                <Filter className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบรายการจอง</h3>
            <p className="text-gray-500">ไม่มีรายการจองในสถานะ "{filter}" ในขณะนี้</p>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle2 className="text-orange-500" />
                  จัดการการจอง
              </h2>
              <button onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              {/* Booking Summary */}
              <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100 mb-6">
                <h3 className="font-bold text-gray-800 mb-2 text-lg">{selectedBooking.booking_type_name}</h3>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><User size={14} className="text-orange-400"/> {selectedBooking.full_name}</p>
                  <p className="flex items-center gap-2"><Calendar size={14} className="text-orange-400"/> {formatDate(selectedBooking.booking_date)} เวลา {formatTime(selectedBooking.booking_time)} น.</p>
                </div>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-6">
                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">เลือกสถานะการดำเนินการ</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${
                        responseData.status === 'approved' 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-100 hover:border-gray-200 text-gray-500'
                    }`}>
                      <input
                        type="radio"
                        value="approved"
                        checked={responseData.status === 'approved'}
                        onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
                        className="hidden"
                      />
                      <CheckCircle2 size={24} className={responseData.status === 'approved' ? 'text-green-600' : 'text-gray-300'} />
                      <span className="font-bold text-sm">อนุมัติ</span>
                    </label>

                    <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${
                        responseData.status === 'rejected' 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-gray-100 hover:border-gray-200 text-gray-500'
                    }`}>
                      <input
                        type="radio"
                        value="rejected"
                        checked={responseData.status === 'rejected'}
                        onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
                        className="hidden"
                      />
                      <XCircle size={24} className={responseData.status === 'rejected' ? 'text-red-600' : 'text-gray-300'} />
                      <span className="font-bold text-sm">ปฏิเสธ</span>
                    </label>
                  </div>
                </div>

                {/* Response Message */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {responseData.status === 'approved' ? 'ข้อความถึงผู้จอง (Optional)' : 'เหตุผลที่ปฏิเสธ (Required) *'}
                  </label>
                  <textarea
                    value={responseData.admin_response}
                    onChange={(e) => setResponseData({ ...responseData, admin_response: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none text-sm"
                    placeholder={
                      responseData.status === 'approved'
                        ? 'เช่น: ได้รับการอนุมัติแล้ว กรุณามาถึงก่อนเวลา 15 นาที เพื่อเตรียมตัว...'
                        : 'เช่น: ขออภัย วันและเวลาดังกล่าวทางวัดติดภารกิจสำคัญ...'
                    }
                    required={responseData.status === 'rejected'}
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleCloseModal} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 ${
                      responseData.status === 'rejected' 
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                        : 'bg-green-500 hover:bg-green-600 shadow-green-200'
                    }`}
                  >
                    ยืนยันการ{responseData.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;