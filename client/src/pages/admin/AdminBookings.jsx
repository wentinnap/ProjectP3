import { useEffect, useState, useCallback } from 'react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, Search, Check, X, MoreHorizontal, Filter, 
  Trash2, Settings, Plus, User, Phone, Info, Edit3, Save, RotateCcw,
  ChevronRight, MapPin, MessageSquare, Loader2
} from 'lucide-react';

const AdminBookings = () => {
  // --- States ---
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals Control
  const [showModal, setShowModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  // Data States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [adminResponse, setAdminResponse] = useState('');
  
  // Form States (Create/Edit Types)
  const [newType, setNewType] = useState({ name: '', description: '', duration: 60 });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', duration: 60 });

  // --- Data Fetching ---
  const fetchBookings = useCallback(async () => {
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
  }, [filter]);

  const fetchTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data || []);
    } catch (error) { 
      console.error('Error fetching types'); 
    }
  };

  useEffect(() => { 
    fetchBookings(); 
    fetchTypes();
  }, [fetchBookings]);

  // --- Handlers: Bookings ---
  const openBookingDetail = (booking) => {
    setSelectedBooking(booking);
    setAdminResponse(booking.admin_response || '');
    setShowModal(true);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, { status, admin_response: adminResponse });
      toast.success(`เปลี่ยนสถานะเป็น ${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'} เรียบร้อย`);
      setShowModal(false); 
      fetchBookings();
    } catch (error) { 
      toast.error('การอัปเดตล้มเหลว'); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ยืนยันการลบรายการจองถาวร? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    try { 
      await bookingAPI.deleteBooking(id); 
      toast.success('ลบรายการจองเรียบร้อย'); 
      fetchBookings(); 
    } catch (error) { 
      toast.error('ลบไม่สำเร็จ'); 
    }
  };

  // --- Handlers: Booking Types ---
  const handleAddType = async () => {
    if (!newType.name.trim()) return toast.warning('กรุณาระบุชื่อพิธี');
    try {
      await bookingAPI.createType({ 
        name: newType.name, 
        description: newType.description, 
        duration_minutes: parseInt(newType.duration) 
      });
      toast.success('เพิ่มประเภทพิธีใหม่สำเร็จ');
      setNewType({ name: '', description: '', duration: 60 });
      fetchTypes();
    } catch (error) { 
      toast.error('เพิ่มไม่สำเร็จ'); 
    }
  };

  const startEditType = (t) => {
    setEditingId(t.id);
    setEditForm({ 
      name: t.name, 
      description: t.description || '', 
      duration: t.duration_minutes || 60 
    });
  };

  const handleUpdateType = async (id) => {
    if (!editForm.name.trim()) return toast.warning('กรุณาระบุชื่อพิธี');
    try {
      await bookingAPI.updateType(id, {
        name: editForm.name,
        description: editForm.description,
        duration_minutes: parseInt(editForm.duration)
      });
      toast.success('อัปเดตข้อมูลสำเร็จ');
      setEditingId(null);
      fetchTypes();
    } catch (error) { 
      toast.error('แก้ไขไม่สำเร็จ'); 
    }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm("ต้องการลบประเภทพิธีนี้ใช่หรือไม่?")) return;
    try { 
      await bookingAPI.deleteType(id); 
      toast.success('ลบประเภทพิธีสำเร็จ'); 
      fetchTypes(); 
    } catch (error) { 
      toast.error('ไม่สามารถลบได้ เนื่องจากมีการใช้งานอยู่'); 
    }
  };

  // --- Filter Logic ---
  const filteredBookings = bookings.filter(b => 
    b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.booking_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20 p-4 lg:p-8">
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 rounded-2xl text-orange-600 shadow-sm">
                <Calendar size={28} />
              </div>
              ระบบจัดการการจอง
            </h2>
            <p className="text-slate-500 mt-1.5 text-sm lg:text-base">ตรวจสอบคำขอ ตรวจสอบคิว และตั้งค่าพิธีการ</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button 
              onClick={() => setShowTypeModal(true)} 
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:border-orange-200 hover:bg-orange-50/30 transition-all"
            >
              <Settings size={18} className="text-slate-400" /> 
              ตั้งค่าประเภทพิธี
            </button>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อผู้จอง หรือชื่อพิธี..." 
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 shadow-sm transition-all"
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* --- STATUS TABS --- */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'pending', label: 'รอดำเนินการ', color: 'bg-amber-500' },
            { id: 'approved', label: 'อนุมัติแล้ว', color: 'bg-emerald-500' },
            { id: 'rejected', label: 'ปฏิเสธแล้ว', color: 'bg-red-500' },
            { id: 'all', label: 'ทั้งหมด', color: 'bg-slate-600' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border ${
                filter === tab.id 
                ? `${tab.color} text-white border-transparent shadow-lg shadow-black/5` 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              {filter === tab.id && <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-md text-xs">{filteredBookings.length}</span>}
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT --- */}
        {loading ? (
          <div className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <Loader2 size={40} className="animate-spin text-orange-400 mb-4" />
            <p className="font-medium animate-pulse">กำลังดึงข้อมูลล่าสุด...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-medium italic">ไม่พบรายการจองในหมวดหมู่นี้</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">ข้อมูลผู้จอง</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">ประเภทพิธี</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">กำหนดการ</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">สถานะ</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-orange-50/20 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-700">{booking.full_name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {booking.phone_number}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100">
                          {booking.booking_type_name}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm text-slate-600 font-bold">
                          {new Date(booking.booking_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </div>
                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock size={12} /> {booking.booking_time} น.
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                          booking.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {booking.status === 'pending' ? 'รอดำเนินการ' : booking.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openBookingDetail(booking)} className="p-2.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                            <Info size={20} />
                          </button>
                          <button onClick={() => handleDelete(booking.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-extrabold text-slate-800 text-lg">{booking.full_name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <Phone size={12} />
                        </div>
                        {booking.phone_number}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          booking.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">ประเภทพิธี</p>
                      <p className="text-sm font-bold text-orange-600">{booking.booking_type_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">วันและเวลา</p>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(booking.booking_date).toLocaleDateString('th-TH', {dateStyle: 'short'})}
                        <span className="ml-1.5 text-slate-400 font-normal">{booking.booking_time} น.</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => openBookingDetail(booking)}
                      className="flex-1 py-3.5 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                    >
                      <Info size={18} /> จัดการคำขอ
                    </button>
                    <button 
                      onClick={() => handleDelete(booking.id)}
                      className="px-5 py-3.5 text-red-400 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- MODAL: BOOKING DETAILS --- */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-100 p-0 sm:p-4">
          <div className="bg-white rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  selectedBooking.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                  selectedBooking.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}>
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 leading-tight">รายละเอียดการจอง</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Booking ID: #{selectedBooking.id.toString().slice(-6)}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-4xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400"><User size={20} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">ผู้จอง</p>
                    <p className="font-bold text-slate-700">{selectedBooking.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400"><Phone size={20} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">เบอร์ติดต่อ</p>
                    <p className="font-bold text-slate-700">{selectedBooking.phone_number}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-5 border border-slate-100 rounded-2xl">
                   <div className="flex items-center gap-3">
                     <Calendar className="text-orange-500" size={18} />
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ประเภทพิธี</span>
                   </div>
                   <span className="font-extrabold text-slate-800">{selectedBooking.booking_type_name}</span>
                </div>
                <div className="flex justify-between items-center p-5 border border-slate-100 rounded-2xl">
                   <div className="flex items-center gap-3">
                     <Clock className="text-orange-500" size={18} />
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">วันและเวลา</span>
                   </div>
                   <span className="font-extrabold text-slate-800">
                     {new Date(selectedBooking.booking_date).toLocaleDateString('th-TH', { dateStyle: 'long' })} | {selectedBooking.booking_time} น.
                   </span>
                </div>
                <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-3xl">
                  <p className="text-[10px] text-orange-600 font-black uppercase mb-2 tracking-widest">บันทึกเพิ่มเติมจากผู้ใช้</p>
                  <p className="text-sm text-slate-600 italic leading-relaxed">
                    {selectedBooking.note ? `"${selectedBooking.note}"` : '--- ไม่มีข้อมูลระบุเพิ่มเติม ---'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">ข้อความตอบกลับจากแอดมิน (จะถูกส่งไปยังผู้จอง)</label>
                <textarea 
                  className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-transparent outline-none focus:border-orange-500/20 focus:bg-white text-sm h-32 resize-none transition-all"
                  placeholder="เช่น: ยืนยันการจองครับ, หรือระบุเหตุผลหากปฏิเสธ..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                />
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedBooking.status === 'pending' ? (
                    <>
                      <button onClick={() => handleUpdateStatus(selectedBooking.id, 'approved')} className="flex-1 py-4.5 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 order-2 sm:order-1 hover:bg-emerald-600 transition-colors">
                        <Check size={20} /> อนุมัติการจอง
                      </button>
                      <button onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')} className="flex-1 py-4.5 bg-red-50 text-red-500 rounded-2xl font-bold order-1 sm:order-2 hover:bg-red-100 transition-colors">
                        <X size={20} /> ปฏิเสธคำขอ
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleUpdateStatus(selectedBooking.id, 'pending')} className="w-full py-4.5 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                      <RotateCcw size={20} /> ย้ายกลับไปที่รอดำเนินการ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: TYPE MANAGEMENT --- */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-100 p-0 sm:p-4">
          <div className="bg-white rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in duration-300 overflow-hidden">
            <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">ตั้งค่าประเภทพิธี</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Manage Ceremony Types</p>
              </div>
              <button onClick={() => { setShowTypeModal(false); setEditingId(null); }} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              {!editingId && (
                <div className="bg-orange-50/50 p-6 rounded-4xl border border-orange-100 mb-8">
                  <p className="text-[10px] font-black text-orange-600 uppercase mb-4 tracking-widest">เพิ่มประเภทพิธีใหม่</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      placeholder="ชื่อพิธี (เช่น ขึ้นบ้านใหม่, บวช)" 
                      className="px-5 py-3.5 rounded-2xl border border-orange-200 bg-white text-sm outline-none w-full focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={newType.name}
                      onChange={(e) => setNewType({...newType, name: e.target.value})}
                    />
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="ระยะเวลา" 
                        className="px-5 py-3.5 rounded-2xl border border-orange-200 bg-white text-sm outline-none w-full focus:ring-4 focus:ring-orange-500/10 transition-all"
                        value={newType.duration}
                        onChange={(e) => setNewType({...newType, duration: e.target.value})}
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] text-orange-400 font-black uppercase">นาที</span>
                    </div>
                    <textarea 
                      placeholder="คำอธิบายสั้นๆ เกี่ยวกับพิธี..."
                      className="sm:col-span-2 px-5 py-3.5 rounded-2xl border border-orange-200 bg-white text-sm outline-none h-24 resize-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={newType.description}
                      onChange={(e) => setNewType({...newType, description: e.target.value})}
                    />
                  </div>
                  <button onClick={handleAddType} className="w-full mt-4 py-4 bg-orange-500 text-white rounded-2xl font-extrabold shadow-lg shadow-orange-500/30 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Plus size={20} /> ยืนยันเพิ่มประเภทพิธี
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">รายการพิธีปัจจุบัน ({bookingTypes.length})</p>
                {bookingTypes.map(t => (
                  <div key={t.id} className={`p-5 rounded-3xl border transition-all ${editingId === t.id ? 'bg-white border-blue-500 ring-4 ring-blue-500/5 shadow-xl' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}>
                    {editingId === t.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input 
                            className="px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          />
                          <div className="relative">
                            <input 
                              type="number"
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                              value={editForm.duration}
                              onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black">นาที</span>
                          </div>
                        </div>
                        <textarea 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm h-20 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none transition-all"
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateType(t.id)}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                          >
                            <Save size={18} /> บันทึกการแก้ไข
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex-1 pr-4">
                          <h4 className="font-extrabold text-slate-700">{t.name}</h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-orange-100">
                              <Clock size={12} /> {t.duration_minutes} นาที
                            </span>
                            {t.description && <span className="text-xs text-slate-400 truncate max-w-[200px] font-medium">{t.description}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => startEditType(t)} 
                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Edit3 size={20}/>
                          </button>
                          <button 
                            onClick={() => handleDeleteType(t.id)} 
                            className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={20}/>
                          </button>
                        </div>
                      </div>
                    )}
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