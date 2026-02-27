import { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, Search, Check, X, MoreHorizontal, Filter, Trash2, Settings, Plus
} from 'lucide-react';

const AdminBookings = () => {
  // --- States สำหรับการจอง ---
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseData, setResponseData] = useState({ status: 'approved', admin_response: '' });

  // --- States สำหรับประเภทพิธี (เพิ่มใหม่) ---
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [newTypeName, setNewTypeName] = useState('');

  useEffect(() => { 
    fetchBookings(); 
    fetchTypes();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bookingAPI.getAllAdmin(params);
      setBookings(response.data.data.bookings);
    } catch (error) {
      toast.error('โหลดข้อมูลการจองล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data);
    } catch (error) {
      console.error('Error fetching types');
    }
  };

  // ✅ ฟังก์ชันจัดการการจอง
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ยืนยันการลบรายการจองถาวร?")) return;
    try {
      await bookingAPI.deleteBooking(id);
      toast.success('ลบเรียบร้อย');
      fetchBookings();
    } catch (error) { toast.error('ลบไม่สำเร็จ'); }
  };

  // ✅ ฟังก์ชันจัดการประเภทพิธี (เพิ่ม/ลบ)
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

  // Filter logic
  const filteredBookings = bookings.filter(b => 
    b.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.booking_type_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (id, status, message = '') => {
    try {
      await bookingAPI.updateStatus(id, { status, admin_response: message });
      toast.success('อัปเดตเรียบร้อย');
      fetchBookings();
      setShowModal(false);
    } catch (error) { toast.error('เกิดข้อผิดพลาด'); }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Filter className="text-cyan-500" size={28} />
            จัดการการจอง
          </h2>
          <p className="text-gray-500 text-sm">ตรวจสอบคำขอและตั้งค่าประเภทพิธี</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* ✅ ปุ่มเปิดจัดการประเภทพิธี */}
          <button 
            onClick={() => setShowTypeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <Settings size={18} className="text-gray-400" />
            ตั้งค่าประเภทพิธี
          </button>

          <div className="relative grow md:grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหา..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-100 outline-none w-full"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- Tab Filter --- */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {['pending', 'approved', 'all'].map((t) => (
          <button 
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${filter === t ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'pending' ? 'รออนุมัติ' : t === 'approved' ? 'อนุมัติแล้ว' : 'ทั้งหมด'}
          </button>
        ))}
      </div>

      {/* --- Main Content (Table) --- */}
      {/* ... โค้ด Table เดิมของคุณ (ที่ผมใส่ handleDelete ไว้ในเวอร์ชันก่อนหน้า) ... */}
      {/* หมายเหตุ: ใส่ตารางเดิมตรงนี้ โดยเรียกใช้ handleDelete(booking.id) ที่สร้างไว้ด้านบน */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         {/* เนื้อหาตารางที่คุณมีอยู่แล้ว */}
         {/* อย่าลืมใส่ปุ่ม Trash2 ที่เรียก handleDelete(booking.id) นะครับ */}
      </div>

      {/* --- Modal 1: จัดการคำขอ (เดิม) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-110 p-4">
           {/* ... โค้ด Modal จัดการคำขอจองเดิมของคุณ ... */}
        </div>
      )}

      {/* ✅ Modal 2: จัดการประเภทพิธี (เพิ่มใหม่) */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">จัดการประเภทพิธี</h3>
              <button onClick={() => setShowTypeModal(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
            </div>

            <div className="p-6">
              {/* Input เพิ่มประเภทใหม่ */}
              <div className="flex gap-2 mb-6">
                <input 
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="ชื่อพิธีใหม่..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button 
                  onClick={handleAddType}
                  className="p-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* รายการประเภทที่มีอยู่ */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">รายการปัจจุบัน</label>
                {bookingTypes.map((type) => (
                  <div key={type.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl hover:border-cyan-100 transition-all group">
                    <span className="text-sm font-medium text-gray-700">{type.name}</span>
                    <button 
                      onClick={() => handleDeleteType(type.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;