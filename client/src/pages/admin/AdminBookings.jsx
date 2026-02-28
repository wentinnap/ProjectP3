import { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, Search, Check, X, MoreHorizontal, Filter, 
  Trash2, Settings, Plus, User, Phone, Info, Edit3, Save, RotateCcw,
  ChevronRight, MapPin, MessageSquare
} from 'lucide-react';

const AdminBookings = () => {
  // --- States (คงเดิมจากโค้ดคุณ) ---
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [adminResponse, setAdminResponse] = useState('');
  const [newType, setNewType] = useState({ name: '', description: '', duration: 60 });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', duration: 60 });

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
        toast.error('โหลดข้อมูลล้มเหลว'); 
    } finally { 
        setLoading(false); 
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data || []);
    } catch (error) { console.error('Error fetching types'); }
  };

  // --- Handlers (คงเดิม) ---
  const openBookingDetail = (booking) => {
    setSelectedBooking(booking);
    setAdminResponse(booking.admin_response || '');
    setShowModal(true);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, { status, admin_response: adminResponse });
      toast.success('อัปเดตสถานะเรียบร้อย');
      setAdminResponse(''); 
      setShowModal(false); 
      fetchBookings();
    } catch (error) { toast.error('เกิดข้อผิดพลาด'); }
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
    if (!newType.name.trim()) return toast.warning('กรุณาระบุชื่อพิธี');
    try {
      await bookingAPI.createType({ 
        name: newType.name, 
        description: newType.description, 
        duration_minutes: newType.duration 
      });
      toast.success('เพิ่มประเภทพิธีสำเร็จ');
      setNewType({ name: '', description: '', duration: 60 });
      fetchTypes();
    } catch (error) { toast.error('เพิ่มไม่สำเร็จ'); }
  };

  const handleUpdateType = async (id) => {
    try {
      await bookingAPI.updateType(id, {
        name: editForm.name,
        description: editForm.description,
        duration_minutes: editForm.duration
      });
      toast.success('แก้ไขข้อมูลสำเร็จ');
      setEditingId(null);
      fetchTypes();
    } catch (error) { toast.error('แก้ไขไม่สำเร็จ'); }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm("ต้องการลบ/ปิดการใช้งานประเภทนี้?")) return;
    try { 
        await bookingAPI.deleteType(id); 
        toast.success('ดำเนินการเรียบร้อย'); 
        fetchTypes(); 
    } catch (error) { toast.error('ลบไม่สำเร็จ'); }
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditForm({ name: t.name, description: t.description || '', duration: t.duration_minutes || 60 });
  };

  const filteredBookings = bookings.filter(b => 
    b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.booking_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20 p-4 lg:p-8">
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto mb-6 lg:mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl lg:rounded-2xl text-orange-600">
                <Calendar size={28} />
              </div>
              ระบบจัดการการจอง
            </h2>
            <p className="text-slate-500 mt-1 text-sm lg:text-base">จัดการคำขอและตั้งค่าประเภทพิธีทางศาสนา</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button 
              onClick={() => setShowTypeModal(true)} 
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all"
            >
              <Settings size={18} className="text-slate-400" /> 
              ตั้งค่าประเภทพิธี
            </button>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Filter Tabs - ทำให้เลื่อนได้ในมือถือ */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {['pending', 'approved', 'rejected', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-5 py-2 rounded-full text-xs lg:text-sm font-bold transition-all whitespace-nowrap border ${
                filter === t 
                ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              {t === 'pending' ? 'รอดำเนินการ' : t === 'approved' ? 'อนุมัติแล้ว' : t === 'rejected' ? 'ปฏิเสธ' : 'ทั้งหมด'}
            </button>
          ))}
        </div>

        {/* --- BOOKINGS CONTENT --- */}
        {loading ? (
            <div className="bg-white rounded-3xl p-10 text-center text-slate-400 border border-slate-100">กำลังโหลด...</div>
        ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center text-slate-400 border border-slate-100">ไม่พบข้อมูลการจอง</div>
        ) : (
          <>
            {/* Desktop View (Table) - ซ่อนในมือถือ */}
            <div className="hidden lg:block bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ผู้จอง</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ประเภทพิธี</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">วัน-เวลา</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">สถานะ</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{booking.full_name}</div>
                        <div className="text-xs text-slate-400">{booking.phone_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100">
                          {booking.booking_type_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {new Date(booking.booking_date).toLocaleDateString('th-TH')} <br/>
                        <span className="text-xs text-slate-400">{booking.booking_time} น.</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                          booking.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openBookingDetail(booking)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                            <Info size={18} />
                          </button>
                          <button onClick={() => handleDelete(booking.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Cards) - แสดงเฉพาะในมือถือ */}
            <div className="lg:hidden space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{booking.full_name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Phone size={14} /> {booking.phone_number}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          booking.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">พิธี</p>
                      <p className="text-sm font-bold text-orange-600">{booking.booking_type_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">วัน-เวลา</p>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(booking.booking_date).toLocaleDateString('th-TH', {dateStyle: 'short'})}
                        <span className="ml-1 text-slate-400 font-normal">{booking.booking_time} น.</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => openBookingDetail(booking)}
                      className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <Info size={16} /> รายละเอียด
                    </button>
                    <button 
                      onClick={() => handleDelete(booking.id)}
                      className="px-4 py-3 text-red-400 bg-red-50 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ✅ MODAL: BOOKING DETAILS (ปรับปรุง Responsive) */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-110 p-0 sm:p-4">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  selectedBooking.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                  selectedBooking.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}>
                  <Info size={20} />
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">รายละเอียดการจอง</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* ข้อมูลผู้จอง */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400"><User size={18} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">ชื่อ-นามสกุล</p>
                    <p className="font-bold text-slate-700 text-sm sm:text-base">{selectedBooking.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400"><Phone size={18} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">เบอร์โทรศัพท์</p>
                    <p className="font-bold text-slate-700 text-sm sm:text-base">{selectedBooking.phone_number}</p>
                  </div>
                </div>
              </div>

              {/* รายละเอียดพิธี */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl">
                   <div className="flex items-center gap-3">
                     <Calendar className="text-orange-500" size={16} />
                     <span className="text-xs font-bold text-slate-500 uppercase">ประเภท</span>
                   </div>
                   <span className="font-bold text-slate-800 text-sm">{selectedBooking.booking_type_name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border border-slate-100 rounded-2xl gap-2">
                   <div className="flex items-center gap-3">
                     <Clock className="text-orange-500" size={16} />
                     <span className="text-xs font-bold text-slate-500 uppercase">วันและเวลา</span>
                   </div>
                   <span className="font-bold text-slate-800 text-sm">
                     {new Date(selectedBooking.booking_date).toLocaleDateString('th-TH', { dateStyle: 'long' })} | {selectedBooking.booking_time} น.
                   </span>
                </div>
                <div className="p-5 bg-orange-50/30 border border-orange-100 rounded-2xl">
                  <p className="text-[10px] text-orange-600 font-black uppercase mb-2">หมายเหตุจากผู้จอง</p>
                  <p className="text-sm text-slate-600 italic">"{selectedBooking.note || 'ไม่มีระบุเพิ่มเติม'}"</p>
                </div>
              </div>

              {/* Admin Response */}
              <div className="pt-4">
                <textarea 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500/20 text-sm h-24 mb-4"
                  placeholder="เขียนข้อความตอบกลับถึงผู้จอง..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row gap-3 pb-4">
                  {selectedBooking.status === 'pending' ? (
                    <>
                      <button onClick={() => handleUpdateStatus(selectedBooking.id, 'approved')} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 order-2 sm:order-1">
                        <Check size={18} /> อนุมัติ
                      </button>
                      <button onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')} className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold order-1 sm:order-2">
                        <X size={18} /> ปฏิเสธ
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleUpdateStatus(selectedBooking.id, 'pending')} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2">
                      <RotateCcw size={18} /> ย้ายกลับไปที่รอดำเนินการ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TYPE MANAGEMENT (ย่อส่วนการแสดงผลในมือถือ) */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-110 p-0 sm:p-4">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in duration-300 overflow-hidden">
            <div className="p-6 sm:p-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <h3 className="text-lg font-extrabold text-slate-800">ตั้งค่าประเภทพิธี</h3>
              <button onClick={() => setShowTypeModal(false)} className="p-2"><X className="text-slate-400" /></button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto">
              {/* Form เพิ่มใหม่ */}
              <div className="bg-orange-50/50 p-5 rounded-3xl border border-orange-100 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input 
                    placeholder="ชื่อพิธี" 
                    className="px-4 py-3 rounded-xl border-none text-sm outline-none w-full"
                    value={newType.name}
                    onChange={(e) => setNewType({...newType, name: e.target.value})}
                  />
                  <input 
                    type="number" 
                    placeholder="นาที" 
                    className="px-4 py-3 rounded-xl border-none text-sm outline-none w-full"
                    value={newType.duration}
                    onChange={(e) => setNewType({...newType, duration: e.target.value})}
                  />
                  <textarea 
                    placeholder="รายละเอียด"
                    className="sm:col-span-2 px-4 py-3 rounded-xl border-none text-sm outline-none h-20 resize-none"
                    value={newType.description}
                    onChange={(e) => setNewType({...newType, description: e.target.value})}
                  />
                </div>
                <button onClick={handleAddType} className="w-full mt-4 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-md hover:bg-orange-600 transition-all">
                  เพิ่มประเภทพิธี
                </button>
              </div>

              {/* รายการที่มีอยู่ */}
              <div className="space-y-3">
                {bookingTypes.map(t => (
                  <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm">{t.name}</h4>
                      <p className="text-xs text-slate-400">{t.duration_minutes} นาที</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(t)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit3 size={16}/></button>
                      <button onClick={() => handleDeleteType(t.id)} className="p-2 text-red-400 hover:bg-red-100 rounded-lg"><Trash2 size={16}/></button>
                    </div>
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