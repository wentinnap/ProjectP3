import { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, Search, Check, X, MoreHorizontal, Filter, 
  Trash2, Settings, Plus, User, Phone, Info, Edit3, Save, RotateCcw
} from 'lucide-react';

const AdminBookings = () => {
  // --- States เดิม ---
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [adminResponse, setAdminResponse] = useState('');

  // --- States เพิ่มใหม่สำหรับจัดการ Type ---
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
    } catch (error) { toast.error('โหลดข้อมูลล้มเหลว'); } 
    finally { setLoading(false); }
  };

  const fetchTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data || []);
    } catch (error) { console.error('Error fetching types'); }
  };

  // ✅ เพิ่มประเภทพิธีใหม่
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

  // ✅ อัปเดตประเภทพิธี
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

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditForm({ name: t.name, description: t.description || '', duration: t.duration_minutes || 60 });
  };

  // ... ฟังก์ชัน handleDelete, handleUpdateStatus (คงเดิมจากที่คุณส่งมา) ...
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ยืนยันการลบรายการจองถาวร?")) return;
    try { await bookingAPI.deleteBooking(id); toast.success('ลบเรียบร้อย'); fetchBookings(); } 
    catch (error) { toast.error('ลบไม่สำเร็จ'); }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm("ต้องการลบ/ปิดการใช้งานประเภทนี้?")) return;
    try { await bookingAPI.deleteType(id); toast.success('ดำเนินการเรียบร้อย'); fetchTypes(); } 
    catch (error) { toast.error('ลบไม่สำเร็จ'); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, { status, admin_response: adminResponse });
      toast.success(status === 'approved' ? 'อนุมัติเรียบร้อย' : 'ปฏิเสธเรียบร้อย');
      setAdminResponse(''); setShowModal(false); fetchBookings();
    } catch (error) { toast.error('เกิดข้อผิดพลาด'); }
  };

  const filteredBookings = bookings.filter(b => 
    b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.booking_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20 p-4 lg:p-8">
      {/* Header เดิมของคุณ */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-2xl text-orange-600">
                <Calendar size={32} />
              </div>
              ระบบจัดการการจอง
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowTypeModal(true)} 
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all"
            >
              <Settings size={18} className="text-slate-400" /> 
              ตั้งค่าประเภทพิธี
            </button>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหา..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none"
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table ของคุณ (เหมือนเดิม) */}
      <div className="max-w-7xl mx-auto">
         {/* ... (ส่วน Tabs Filter และ Table บอดี้เดิม) ... */}
         {/* เพื่อความกระชับ ผมจะข้ามไปส่วน Modal Type เลยนะครับ */}
      </div>

      {/* ✅ MODERN MODAL: TYPE MANAGEMENT (ชุดเต็ม) */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                  <Settings size={20} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">ตั้งค่าประเภทพิธีทางศาสนา</h3>
              </div>
              <button onClick={() => setShowTypeModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {/* ส่วนเพิ่มใหม่ */}
              <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 mb-8">
                <label className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4 block">เพิ่มประเภทพิธีใหม่</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="ชื่อพิธี (เช่น ขึ้นบ้านใหม่)" 
                    className="px-4 py-3 rounded-xl border border-white bg-white text-sm outline-none focus:border-orange-500 transition-all"
                    value={newType.name}
                    onChange={(e) => setNewType({...newType, name: e.target.value})}
                  />
                  <div className="flex items-center bg-white rounded-xl border border-white px-4">
                    <Clock size={16} className="text-slate-400 mr-2" />
                    <input 
                      type="number" 
                      placeholder="นาที" 
                      className="w-full py-3 text-sm outline-none"
                      value={newType.duration}
                      onChange={(e) => setNewType({...newType, duration: e.target.value})}
                    />
                  </div>
                  <textarea 
                    placeholder="รายละเอียดเบื้องต้น (ถ้ามี)"
                    className="md:col-span-2 px-4 py-3 rounded-xl border border-white bg-white text-sm outline-none resize-none h-20"
                    value={newType.description}
                    onChange={(e) => setNewType({...newType, description: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleAddType}
                  className="w-full mt-4 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> บันทึกประเภทพิธี
                </button>
              </div>

              {/* รายการพิธีทั้งหมด */}
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">รายการปัจจุบัน ({bookingTypes.length})</label>
                {bookingTypes.map(t => (
                  <div key={t.id} className={`border rounded-2xl transition-all ${editingId === t.id ? 'border-orange-500 bg-orange-50/20' : 'border-slate-100 bg-slate-50/30'}`}>
                    {editingId === t.id ? (
                      /* --- โหมดแก้ไข --- */
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            className="px-3 py-2 rounded-lg border border-orange-200 text-sm font-bold outline-none"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          />
                          <div className="flex items-center bg-white px-3 rounded-lg border border-orange-200">
                            <Clock size={14} className="text-slate-400 mr-2" />
                            <input 
                              type="number"
                              className="w-full py-2 text-sm outline-none"
                              value={editForm.duration}
                              onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                            />
                          </div>
                        </div>
                        <textarea 
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs h-20 outline-none"
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateType(t.id)} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600">ตกลง</button>
                          <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold">ยกเลิก</button>
                        </div>
                      </div>
                    ) : (
                      /* --- โหมดแสดงผลปกติ --- */
                      <div className="p-5 flex justify-between items-start group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-700">{t.name}</h4>
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                              {t.duration_minutes} นาที
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {t.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(t)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteType(t.id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
                          >
                            <Trash2 size={16} />
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