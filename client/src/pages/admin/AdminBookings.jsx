import { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, Search, Check, X, MoreHorizontal, Filter
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
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
    <div className="animate-in fade-in duration-500">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Filter className="text-cyan-500" size={28} />
            จัดการการจอง
          </h2>
          <p className="text-gray-500 text-sm">ตรวจสอบและอนุมัติรายการคำขอใช้งานสถานที่/พิธีกรรม</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อผู้จอง..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-100 outline-none w-full sm:w-64 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['pending', 'approved', 'all'].map((t) => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === t ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'pending' ? 'รออนุมัติ' : t === 'approved' ? 'อนุมัติแล้ว' : 'ทั้งหมด'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">กำลังดึงข้อมูล...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4 border-b">ผู้จอง / ประเภท</th>
                  <th className="px-6 py-4 border-b">กำหนดการ</th>
                  <th className="px-6 py-4 border-b">สถานะ</th>
                  <th className="px-6 py-4 border-b text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-700 group-hover:text-cyan-600 transition-colors">{booking.full_name}</div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase">{booking.booking_type_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Calendar size={14} className="text-gray-400"/> {booking.booking_date}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={14}/> {booking.booking_time} น.
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                        booking.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'approved')}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="อนุมัติทันที"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => { setSelectedBooking(booking); setShowModal(true); }}
                            className="p-2 bg-[#343d52] text-white rounded-lg hover:bg-[#3e485f] shadow-sm transition-all"
                            title="จัดการเพิ่มเติม"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-300 uppercase italic">Checked</span>
                      )}
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan="4" className="px-6 py-20 text-center text-gray-400">ไม่พบรายการการจอง</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="p-5 active:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-gray-700">{booking.full_name}</div>
                    <div className="text-[10px] text-cyan-600 font-bold uppercase">{booking.booking_type_name}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {booking.booking_date}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {booking.booking_time} น.</span>
                </div>
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(booking.id, 'approved')} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100">อนุมัติ</button>
                    <button onClick={() => { setSelectedBooking(booking); setShowModal(true); }} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold">เพิ่มเติม</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Action Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-[#343d52]/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">จัดการคำขอจอง</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20}/></button>
            </div>
            
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">ข้อความตอบกลับไปยังผู้ใช้งาน</label>
            <textarea 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm mb-6 outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
              placeholder="ระบุเหตุผลในการปฏิเสธ หรือข้อมูลเพิ่มเติมสำหรับการนัดหมาย..."
              rows="4"
              onChange={(e) => setResponseData({...responseData, admin_response: e.target.value})}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected', responseData.admin_response)} 
                className="py-3 border-2 border-red-50 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:border-red-100 transition-all text-sm"
              >
                ปฏิเสธคำขอ
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedBooking.id, 'approved', responseData.admin_response)} 
                className="py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 shadow-lg shadow-cyan-100 transition-all text-sm"
              >
                ยืนยันการอนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;