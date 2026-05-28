import { useEffect, useState, useCallback, useMemo } from 'react';
import { bookingAPI, monkAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, Search, Check, X, Filter, Trash2, Settings, 
  Plus, User, Phone, Info, Edit3, Save, RotateCcw, ChevronRight, 
  MapPin, Loader2, CalendarRange, Users, Hash, FileText, Sun, Sunrise 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBookings = () => {
  // --- States ---
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showMonkModal, setShowMonkModal] = useState(false);
  const [newMonkName, setNewMonkName] = useState('');
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [adminResponse, setAdminResponse] = useState('');
  
  const [allMonks, setAllMonks] = useState([]); 
  const [selectedMonkIds, setSelectedMonkIds] = useState([]); // เก็บเป็น Array ของ String ID

  const [newType, setNewType] = useState({ name: '', description: '', duration: 60 });

  // เก็บ ID พระที่ติดงาน (เก็บเป็น String ID เพื่อความแม่นยำในการเปรียบเทียบ)
  const [busyMonkIds, setBusyMonkIds] = useState([]);

  // ฟังก์ชันช่วยแปลงเวลาเป็นชื่อรอบ
  const getTimeLabel = (time) => {
    if (!time) return { label: "ไม่ระบุเวลา", icon: <Clock size={14} className="text-slate-400" /> };
    if (time.startsWith("07")) return { label: "รอบเช้า", icon: <Sunrise size={14} className="text-orange-500" /> };
    if (time.startsWith("11")) return { label: "รอบเพล/บ่าย", icon: <Sun size={14} className="text-amber-500" /> };
    return { label: time + " น.", icon: <Clock size={14} className="text-slate-400" /> };
  };

  // --- Data Fetching ---
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bookingAPI.getAllAdmin(params);
      setBookings(response.data.data.bookings || []);
    } catch (error) { 
      const errorMsg = error.response?.data?.message || 'โหลดข้อมูลการจองล้มเหลว';
      toast.error(errorMsg); 
    } finally { 
      setLoading(false); 
    }
  }, [filter]);

  const fetchTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data || []);
    } catch (error) { 
      console.error('Error fetching types:', error); 
    }
  };

  const fetchMonks = async () => {
    try {
      const response = await monkAPI.getAll(); 
      setAllMonks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching monks:', error);
    }
  };

  useEffect(() => { 
    fetchBookings(); 
    fetchTypes();
    fetchMonks(); 
  }, [fetchBookings]);

  // --- Handlers ---
  const handleAddMonk = async () => {
    if (!newMonkName.trim()) return toast.warning('กรุณาระบุชื่อพระสงฆ์');
    try {
      await monkAPI.create({ name: newMonkName });
      toast.success('เพิ่มรายชื่อพระสงฆ์สำเร็จ');
      setNewMonkName('');
      fetchMonks();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'เพิ่มรายชื่อพระสงฆ์ล้มเหลว';
      toast.error(errorMsg);
    }
  };

  const handleDeleteMonk = async (id) => {
    if (!window.confirm("⚠️ ต้องการลบรายชื่อพระสงฆ์รูปนี้ออกจากระบบฐานข้อมูล?")) return;
    try {
      await monkAPI.delete(id);
      toast.success('ลบรายชื่อพระสงฆ์เรียบร้อย');
      fetchMonks();
    } catch (error) {
      toast.error('ไม่สามารถลบได้ เนื่องจากข้อมูลถูกใช้งานอยู่ในระบบ');
    }
  };

  // 🔥 จุดแก้ไขหลักที่ 1: ปรับปรุงการล้างฟอร์แมต Date และการเช็คค่าอย่างปลอดภัยสูงสุด
  const openBookingDetail = async (booking) => {
    setSelectedBooking(booking);
    setAdminResponse(booking.admin_response || '');
    
    // แปลงข้อมูลตั้งต้นให้เป็น String ID ทั้งหมดเพื่อป้องกัน Type Mismatch
    const initialSelectedIds = (booking.monk_ids || []).map(id => String(id));
    setSelectedMonkIds(initialSelectedIds); 
    setShowModal(true);

    if (booking.booking_date) {
      try {
        // ป้องกันปัญหา Date ISO String: ตัดเอาเฉพาะ YYYY-MM-DD
        const cleanDate = booking.booking_date.split('T')[0];
        const response = await monkAPI.getAvailableMonks(cleanDate);
        
        let resData = response.data?.data || response.data;
        
        // รองรับกรณีห่อ Object ซ้อนมาอีกชั้น
        if (resData && typeof resData === 'object' && !Array.isArray(resData)) {
          if (Array.isArray(resData.availableMonks)) resData = resData.availableMonks;
          else if (Array.isArray(resData.monks)) resData = resData.monks;
        }

        if (Array.isArray(resData)) {
          // ตรวจสอบโครงสร้างว่าส่งมาพร้อม flag บอกสถานะงานตรงๆ หรือไม่
          const hasStatusFlag = resData.length > 0 && typeof resData[0] === 'object' && (
            'is_busy' in resData[0] || 'isBusy' in resData[0] || 'available' in resData[0]
          );

          if (hasStatusFlag) {
            // แบบที่ 1: ดึง ID ของคนที่ไม่ว่างออกมา (แปลงเป็น String)
            const busyIds = resData
              .filter(monk => monk.is_busy === true || monk.isBusy === true || monk.available === false)
              .map(monk => String(monk.id || monk.monk_id || monk.monkId));
            setBusyMonkIds(busyIds);
          } else {
            // แบบที่ 2: API ส่งเฉพาะ "คนว่าง" -> คนไหนไม่มีชื่อในลิสต์นี้ แปลว่า "ติดงาน"
            const availableIds = resData.map(monk => {
              if (typeof monk === 'object' && monk !== null) {
                return String(monk.id ?? monk.monk_id ?? monk.monkId);
              }
              return String(monk);
            });

            const busyIds = allMonks
              .filter(monk => {
                const currentId = String(monk.id ?? monk.monk_id ?? monk.monkId);
                return !availableIds.includes(currentId);
              })
              .map(monk => String(monk.id ?? monk.monk_id ?? monk.monkId));
            
            setBusyMonkIds(busyIds);
          }
        }
      } catch (error) {
        console.error('Error fetching monk availability:', error);
        setBusyMonkIds([]);
      }
    } else {
      setBusyMonkIds([]);
    }
  };

  // 🔥 จุดแก้ไขหลักที่ 2: ปรับฟังก์ชันการเลือกให้ใช้ String เปรียบเทียบ
  const handleToggleMonk = (monkId) => {
    const requiredMonks = selectedBooking?.monks_count ?? selectedBooking?.monksCount ?? 0;
    const monkIdStr = String(monkId);

    if (busyMonkIds.includes(monkIdStr) && !selectedMonkIds.includes(monkIdStr)) {
      toast.error('พระสงฆ์รูปนี้ติดคิวงานนิมนต์อื่นในวันดังกล่าวแล้ว');
      return;
    }

    setSelectedMonkIds(prev => {
      if (prev.includes(monkIdStr)) {
        return prev.filter(id => id !== monkIdStr); 
      } else {
        if (prev.length >= requiredMonks) {
          toast.warning(`ไม่สามารถเลือกเพิ่มได้เนื่องจากสล็อตเต็มที่ ${requiredMonks} รูปแล้ว`);
          return prev;
        }
        return [...prev, monkIdStr]; 
      }
    });
  };

  const handleUpdateStatus = async (id, status) => {
    const requiredMonks = selectedBooking?.monks_count ?? selectedBooking?.monksCount ?? 0;

    try {
      if (status === 'approved' && selectedMonkIds.length !== requiredMonks) {
        return toast.warning(`กรุณาเลือกพระสงฆ์ให้ครบตามจำนวนที่นิมนต์ไว้ (${requiredMonks} รูป / เลือกแล้ว ${selectedMonkIds.length} รูป)`);
      }

      // 🔥 จุดแก้ไขหลักที่ 3: แปลงกลับเป็น Number ก่อนยิงเข้าหลังบ้าน ป้องกันหลังบ้านฟ้อง Error ชนิดข้อมูล
      const finalMonkIds = status === 'approved' 
        ? selectedMonkIds.map(id => isNaN(id) ? id : Number(id)) 
        : [];

      await bookingAPI.updateStatus(id, { 
        status, 
        admin_response: adminResponse,
        monk_ids: finalMonkIds
      });

      toast.success(`อัปเดตสถานะและส่งแจ้งเตือนกลุ่มเรียบร้อย`);
      setShowModal(false); 
      fetchBookings();
    } catch (error) { 
      const errorMsg = error.response?.data?.message || 'การอัปเดตล้มเหลว';
      toast.error(errorMsg); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ยืนยันการลบรายการจองถาวร?")) return;
    try { 
      await bookingAPI.deleteBooking(id); 
      toast.success('ลบรายการจองเรียบร้อย'); 
      fetchBookings(); 
    } catch (error) { 
      const errorMsg = error.response?.data?.message || 'ลบไม่สำเร็จ';
      toast.error(errorMsg); 
    }
  };

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
      const errorMsg = error.response?.data?.message || 'เพิ่มไม่สำเร็จ';
      toast.error(errorMsg); 
    }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm("ต้องการลบประเภทพิธีนี้? หากมีคิวจองที่ใช้ประเภทนี้อยู่อาจลบไม่ได้")) return;
    try { 
      await bookingAPI.deleteType(id); 
      toast.success('ลบประเภทพิธีสำเร็จ'); 
      fetchTypes(); 
    } catch (error) { 
      toast.error('ไม่สามารถลบได้เนื่องจากมีการใช้งานอยู่ในระบบ'); 
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.booking_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-24">
      {/* --- HEADER --- */}
      <div className="bg-slate-900 pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-4">
              <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
                <CalendarRange size={32} />
              </div>
              จัดการคิวการจอง
            </h1>
            <p className="text-slate-400 mt-2 font-medium">ระบบบริหารจัดการสำหรับแอดมิน</p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowMonkModal(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-orange-500/20"
            >
              <Plus size={20} />
              จัดการรายชื่อพระสงฆ์
            </button>
            <button 
              onClick={() => setShowTypeModal(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-bold transition-all border border-white/20 active:scale-95"
            >
              <Settings size={20} />
              ตั้งค่าประเภทพิธี
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        {/* --- FILTERS --- */}
        <div className="bg-white rounded-4xl shadow-xl shadow-slate-200/50 p-4 mb-10 flex flex-col lg:flex-row gap-4 items-center border border-slate-100">
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อผู้จอง หรือพิธี..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto">
            {[
              { id: 'pending', label: 'รอดำเนินการ', color: 'text-amber-600 bg-white shadow-sm' },
              { id: 'approved', label: 'อนุมัติแล้ว', color: 'text-emerald-600 bg-white shadow-sm' },
              { id: 'rejected', label: 'ปฏิเสธ', color: 'text-red-600 bg-white shadow-sm' },
              { id: 'all', label: 'ทั้งหมด', color: 'text-slate-600 bg-white shadow-sm' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                  filter === t.id ? t.color : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- BOOKING CARDS --- */}
        {loading ? (
          <div className="bg-white rounded-[40px] p-32 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
            <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Data...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border border-slate-100">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Search size={40} />
             </div>
             <p className="text-slate-400 font-bold italic">ไม่พบข้อมูลในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => {
              const timeInfo = getTimeLabel(booking.booking_time);
              const cardPhone = booking.phone || booking.phone_number || 'ไม่ระบุเบอร์โทร';

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={booking.id}
                  className="group bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-900/5 transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-2 ${
                    booking.status === 'approved' ? 'bg-emerald-500' : 
                    booking.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />

                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-slate-50 group-hover:bg-orange-50 transition-colors rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-500">
                      <User size={28} />
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                       booking.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                       booking.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {booking.status === 'pending' ? 'รอดำเนินการ' : booking.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-black text-slate-800 line-clamp-1">{booking.full_name}</h4>
                      <p className="text-slate-400 text-sm font-medium flex items-center gap-1.5 mt-1">
                        <Phone size={14} /> {cardPhone}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600">
                        <Calendar size={16} className="text-orange-500" />
                        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600">
                        {timeInfo.icon}
                        {timeInfo.label} {booking.booking_time ? `(${booking.booking_time.substring(0, 5)} น.)` : ''}
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-2xl text-sm font-bold text-orange-600">
                        <Info size={16} />
                        {booking.booking_type_name || 'ไม่ระบุประเภทพิธี'}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => openBookingDetail(booking)}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        จัดการคำขอ <ChevronRight size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(booking.id)}
                        className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL: BOOKING DETAIL --- */}
      <AnimatePresence>
        {showModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500"><FileText size={28} /></div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">รายละเอียด</h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: #{selectedBooking.id.toString().slice(-6)}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-50 rounded-full transition-colors"><X size={28} /></button>
              </div>

              <div className="p-8 overflow-y-auto space-y-6 no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-4xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ผู้จอง</p>
                    <p className="text-lg font-bold text-slate-800">{selectedBooking.full_name}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-4xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">เบอร์ติดต่อ</p>
                    <p className="text-lg font-bold text-slate-800">{selectedBooking.phone ?? selectedBooking.phone_number ?? '-'}</p>
                  </div>
                </div>

                <div className="p-8 border border-slate-100 rounded-4xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold text-xs uppercase">พิธีการ</span>
                    <span className="font-black text-orange-600 text-lg">{selectedBooking.booking_type_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                    <span className="text-slate-400 font-bold text-xs uppercase">จำนวนพระ</span>
                    <span className="font-black text-slate-800 text-lg">
                      {selectedBooking.monks_count ?? selectedBooking.monksCount ?? 0} รูป
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                    <span className="text-slate-400 font-bold text-xs uppercase">วัน-เวลา</span>
                    <span className="font-black text-slate-800 text-right">
                      {selectedBooking.booking_date ? new Date(selectedBooking.booking_date).toLocaleDateString('th-TH', {dateStyle: 'long'}) : '-'} <br/> 
                      <span className="text-orange-500">{getTimeLabel(selectedBooking.booking_time).label} ({selectedBooking.booking_time?.substring(0, 5)} น.)</span>
                    </span>
                  </div>
                </div>

                {selectedBooking.note && (
                  <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100/50 italic text-slate-600 text-sm">
                    "{selectedBooking.note}"
                  </div>
                )}

                {/* รายชื่อพระสงฆ์ */}
                {selectedBooking.status === 'pending' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-end px-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Users size={12} /> จัดรายชื่อพระสงฆ์ไปปฏิบัติงาน
                      </label>
                      <span className={`text-xs font-black ${selectedMonkIds.length === (selectedBooking.monks_count ?? selectedBooking.monksCount ?? 0) ? 'text-emerald-500' : 'text-slate-400'}`}>
                        เลือกแล้ว {selectedMonkIds.length} จาก {selectedBooking.monks_count ?? selectedBooking.monksCount ?? 0} รูป
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-4xl border border-slate-100 max-h-48 overflow-y-auto no-scrollbar">
                      {allMonks.map((monk) => {
                        // 🔥 จุดแก้ไขหลักที่ 4: เปลี่ยนมาเช็คด้วย String ID
                        const monkIdStr = String(monk.id);
                        const isSelected = selectedMonkIds.includes(monkIdStr);
                        const isBusy = busyMonkIds.includes(monkIdStr);
                        
                        return (
                          <button
                            key={monk.id}
                            type="button"
                            disabled={isBusy} 
                            onClick={() => handleToggleMonk(monk.id)}
                            className={`p-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-between border ${
                              isBusy
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' 
                                : isSelected 
                                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 active:scale-95' 
                                  : 'bg-white text-slate-700 border-slate-200/60 hover:border-orange-300'
                            }`}
                          >
                            <span className="truncate">{monk.name} {isBusy && '(ติดคิว)'}</span>
                            {isSelected && !isBusy && <Check size={16} className="shrink-0 ml-1 text-white" />}
                            {isBusy && <X size={14} className="shrink-0 ml-1 text-slate-400" />}
                          </button>
                        );
                      })}
                      {allMonks.length === 0 && (
                        <p className="col-span-full text-center text-slate-400 py-6 font-medium italic text-sm">ไม่พบข้อมูลรายชื่อพระสงฆ์ในระบบ</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">ข้อความตอบกลับแอดมิน</label>
                  <textarea 
                    className="w-full p-6 bg-slate-50 rounded-4xl border-none outline-none focus:ring-2 focus:ring-orange-500/20 h-32 resize-none transition-all font-medium"
                    placeholder="พิมพ์ข้อความตอบกลับโยมผู้จองที่นี่..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex flex-col sm:flex-row gap-3">
                {selectedBooking.status === 'pending' ? (
                  <>
                    <button onClick={() => handleUpdateStatus(selectedBooking.id, 'approved')} className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                      <Check size={24} /> อนุมัติการจอง
                    </button>
                    <button onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')} className="flex-1 py-5 bg-red-50 text-red-500 rounded-2xl font-black text-lg hover:bg-red-100 transition-all">
                      <X size={24} className="inline mr-2" /> ปฏิเสธ
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleUpdateStatus(selectedBooking.id, 'pending')} className="w-full py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                    <RotateCcw size={24} /> ย้ายกลับไปรอดำเนินการ
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: MONK MANAGEMENT --- */}
      <AnimatePresence>
        {showMonkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMonkModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <Users className="text-orange-500" size={26} /> จัดการรายชื่อพระสงฆ์
                </h3>
                <button onClick={() => setShowMonkModal(false)} className="p-3 hover:bg-slate-50 rounded-full transition-colors"><X size={28} /></button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 no-scrollbar">
                <div className="bg-orange-50 p-8 rounded-[40px] border border-orange-100">
                  <h4 className="text-orange-600 font-black text-xs uppercase tracking-widest mb-4">เพิ่มรายชื่อพระสงฆ์ใหม่</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      placeholder="ระบุชื่อพระสงฆ์ (เช่น พระสมชาย ชินวํโส)" 
                      className="flex-1 px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-orange-500/20 font-bold shadow-sm"
                      value={newMonkName}
                      onChange={(e) => setNewMonkName(e.target.value)}
                    />
                    <button onClick={handleAddMonk} className="py-4 px-8 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                      <Plus size={20} /> เพิ่มรายชื่อ
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-slate-400 font-black text-xs uppercase tracking-widest ml-2">พระสงฆ์ทั้งหมดในระบบ</h4>
                  {allMonks.length === 0 ? (
                    <p className="text-center py-4 text-slate-300 italic">ไม่มีข้อมูลรายชื่อพระสงฆ์</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allMonks.map(monk => (
                        <div key={monk.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex justify-between items-center group">
                          <span className="font-bold text-slate-800 text-base truncate pr-2">{monk.name}</span>
                          <button onClick={() => handleDeleteMonk(monk.id)} className="w-10 h-10 shrink-0 flex items-center justify-center bg-white text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: TYPE SETTINGS --- */}
      <AnimatePresence>
        {showTypeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTypeModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800">ตั้งค่าประเภทพิธี</h3>
                <button onClick={() => setShowTypeModal(false)} className="p-3 hover:bg-slate-50 rounded-full transition-colors"><X size={28} /></button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 no-scrollbar">
                <div className="bg-orange-50 p-8 rounded-[40px] border border-orange-100">
                  <h4 className="text-orange-600 font-black text-xs uppercase tracking-widest mb-6">เพิ่มประเภทพิธี</h4>
                  <div className="space-y-4">
                    <input 
                      placeholder="ชื่อพิธี (เช่น ขึ้นบ้านใหม่)" 
                      className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-orange-500/20 font-bold shadow-sm"
                      value={newType.name}
                      onChange={(e) => setNewType({...newType, name: e.target.value})}
                    />
                    <div className="relative">
                      <input 
                        type="number" placeholder="ระยะเวลา" 
                        className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-orange-500/20 font-bold shadow-sm"
                        value={newType.duration}
                        onChange={(e) => setNewType({...newType, duration: e.target.value})}
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-300 uppercase tracking-tighter">นาที</span>
                    </div>
                    <textarea 
                      placeholder="คำอธิบาย..." 
                      className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-orange-500/20 font-medium shadow-sm h-24 resize-none"
                      value={newType.description}
                      onChange={(e) => setNewType({...newType, description: e.target.value})}
                    />
                    <button onClick={handleAddType} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all">
                      เพิ่มประเภทพิธี
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-slate-400 font-black text-xs uppercase tracking-widest ml-2">รายการปัจจุบัน</h4>
                  {bookingTypes.length === 0 ? (
                    <p className="text-center py-4 text-slate-300 italic">ไม่มีข้อมูลประเภทพิธี</p>
                  ) : (
                    bookingTypes.map(t => (
                      <div key={t.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex justify-between items-center group">
                        <div className="flex-1">
                           <h5 className="font-bold text-slate-800 text-base">{t.name}</h5>
                           <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1"><Clock size={12}/> {t.duration_minutes || 60} นาที</p>
                        </div>
                        <button onClick={() => handleDeleteType(t.id)} className="w-10 h-10 shrink-0 flex items-center justify-center bg-white text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100 ml-4">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBookings;