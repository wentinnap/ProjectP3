import { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, Search, Check, X, MoreHorizontal, Filter, Trash2, Settings, Plus, User
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals States
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  // Data States
  const [bookingTypes, setBookingTypes] = useState([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => { 
    fetchBookings(); 
    fetchTypes();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bookingAPI.getAllAdmin(params);
      setBookings(response.data.data.bookings || []);
    } catch (error) {
      toast.error('โหลดข้อมูลการจองล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching types');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ยืนยันการลบรายการจองถาวร?")) return;
    try {
      await bookingAPI.deleteBooking(id);
      toast.success('ลบเรียบร้อย');
      fetchBookings();
    } catch (error) { toast.error('ลบไม่สำเร็จ'); }
  };

  const handleAddType = async () => {
    if (!newTypeName.trim()) return;
    try {
      await bookingAPI.createType({ name: newTypeName });
      toast.success('เพิ่มประเภทพิธีแล้ว');
      setNewTypeName('');
      fetchTypes();
    } catch (error) { toast.error('เพิ่มไม่สำเร็จ'); }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm("ต้องการลบ/ปิดการใช้งานประเภทนี้?")) return;
    try {
      await bookingAPI.deleteType(id);
      toast.success('ดำเนินการเรียบร้อย');
      fetchTypes();
    } catch (error) { toast.error('ลบไม่สำเร็จ'); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, { status, admin_response: adminResponse });
      toast.success('อัปเดตเรียบร้อย');
      setAdminResponse('');
      setShowModal(false);
      fetchBookings();
    } catch (error) { toast.error('เกิดข้อผิดพลาด'); }
  };

  const filteredBookings = bookings.filter(b => 
    b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.booking_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Filter className="text-orange-500" size={28} />
            จัดการการจอง
          </h2>
          <p className="text-gray-500 text-sm">ตรวจสอบคำขอและตั้งค่าประเภทพิธี</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setShowTypeModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50">
            <Settings size={18} /> ตั้งค่าประเภทพิธี
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="ค้นหา..." className="pl-10 pr-4 py-2 border rounded-xl w-full outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {['pending', 'approved', 'all'].map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${filter === t ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}>
            {t === 'pending' ? 'รออนุมัติ' : t === 'approved' ? 'อนุมัติแล้ว' : 'ทั้งหมด'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">ผู้จอง</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">ประเภทพิธี</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">วันที่/เวลา</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{booking.full_name}</div>
                  <div className="text-xs text-gray-500">{booking.phone}</div>
                </td>
                <td className="p-4 text-sm">{booking.booking_type_name}</td>
                <td className="p-4 text-sm">
                  <div>{new Date(booking.booking_date).toLocaleDateString('th-TH')}</div>
                  <div className="text-xs text-gray-400">{booking.booking_time} น.</div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    {booking.status === 'pending' && (
                      <button onClick={() => {setSelectedBooking(booking); setShowModal(true)}} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><MoreHorizontal size={18}/></button>
                    )}
                    <button onClick={() => handleDelete(booking.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Management (Simple Version for stability) */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">พิจารณาการจอง: {selectedBooking.full_name}</h3>
            <textarea 
              className="w-full border rounded-xl p-3 text-sm mb-4 h-24 outline-none focus:border-orange-500" 
              placeholder="ข้อความตอบกลับไปยังผู้ใช้งาน..."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')} className="py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">ปฏิเสธ</button>
              <button onClick={() => handleUpdateStatus(selectedBooking.id, 'approved')} className="py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">อนุมัติการจอง</button>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-3 text-sm text-gray-400">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* Type Management Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">จัดการประเภทพิธี</h3>
              <X className="cursor-pointer" onClick={() => setShowTypeModal(false)} />
            </div>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} placeholder="ชื่อพิธีใหม่..." className="flex-1 px-4 py-2 border rounded-xl outline-none" />
              <button onClick={handleAddType} className="p-2 bg-orange-500 text-white rounded-xl"><Plus/></button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {bookingTypes.map(t => (
                <div key={t.id} className="flex justify-between p-3 border rounded-xl items-center">
                  <span className="text-sm font-medium">{t.name}</span>
                  <Trash2 size={16} className="text-red-400 cursor-pointer hover:text-red-600" onClick={() => handleDeleteType(t.id)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;