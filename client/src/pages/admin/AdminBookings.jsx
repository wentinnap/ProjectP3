import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, User, FileText, ChevronRight, 
  Search, Check, X, ArrowLeft, MoreHorizontal
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState(''); // เพิ่มระบบค้นหา
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseData, setResponseData] = useState({ status: 'approved', admin_response: '' });

  useEffect(() => { fetchBookings(); }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bookingAPI.getAllAdmin(params);
      setBookings(response.data.data.bookings);
    } catch (error) {
      toast.error('โหลดข้อมูลล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  // กรองข้อมูลด้วยชื่อ
  const filteredBookings = bookings.filter(b => 
    b.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.booking_type_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (id, status, message = '') => {
    try {
      await bookingAPI.updateStatus(id, { status, admin_response: message });
      toast.success('อัปเดตสถานะเรียบร้อย');
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      {/* Top Header & Search */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold text-slate-800">จัดการการจอง</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อหรือประเภท..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none w-full sm:w-64"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {['pending', 'approved', 'all'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${filter === t ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
                  >
                    {t === 'pending' ? 'รออนุมัติ' : t === 'approved' ? 'อนุมัติแล้ว' : 'ทั้งหมด'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">ผู้จอง / ประเภท</th>
                    <th className="px-6 py-4">วัน-เวลา</th>
                    <th className="px-6 py-4">สถานะ</th>
                    <th className="px-6 py-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{booking.full_name}</div>
                        <div className="text-xs text-gray-500">{booking.booking_type_name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1"><Calendar size={14}/> {booking.booking_date}</div>
                        <div className="flex items-center gap-1 text-gray-500"><Clock size={14}/> {booking.booking_time} น.</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          booking.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                          booking.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {booking.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'approved')}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                              title="อนุมัติทันที"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => { setSelectedBooking(booking); setShowModal(true); }}
                              className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-200"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">ดำเนินการแล้ว</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (Keep it simple) */}
            <div className="md:hidden divide-y">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-4 active:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-gray-800">{booking.full_name}</div>
                      <div className="text-xs text-orange-600 font-medium">{booking.booking_type_name}</div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{booking.booking_date}</span>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleUpdateStatus(booking.id, 'approved')} className="flex-1 py-2 bg-green-500 text-white rounded-lg text-xs font-bold">อนุมัติ</button>
                      <button onClick={() => { setSelectedBooking(booking); setShowModal(true); }} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">เพิ่มเติม</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Simplified Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">รายละเอียดการจัดการ</h3>
            <textarea 
              className="w-full p-3 border rounded-xl text-sm mb-4 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="ระบุเหตุผลหรือข้อความตอบกลับ..."
              rows="4"
              onChange={(e) => setResponseData({...responseData, admin_response: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected', responseData.admin_response)} className="py-2.5 border-2 border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-50">ปฏิเสธ</button>
              <button onClick={() => handleUpdateStatus(selectedBooking.id, 'approved', responseData.admin_response)} className="py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600">อนุมัติ</button>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-3 text-gray-400 text-sm py-2">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;