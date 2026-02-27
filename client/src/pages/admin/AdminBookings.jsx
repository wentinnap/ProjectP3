import { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, Search, Check, X, MoreHorizontal, Filter, Trash2, Settings, Plus, User, Phone, Info
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  
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
      toast.success(status === 'approved' ? 'อนุมัติเรียบร้อย' : 'ปฏิเสธเรียบร้อย');
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
    <div className="min-h-screen bg-[#FDFCFB] pb-20 p-4 lg:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-2xl text-orange-600">
                <Calendar size={32} />
              </div>
              จัดการการจองพิธี
            </h2>
            <p className="text-slate-500 mt-1 ml-14">ตรวจสอบคำขอและตั้งค่าระบบประเภทพิธีทางศาสนา</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowTypeModal(true)} 
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95"
            >
              <Settings size={18} className="text-slate-400" /> 
              ตั้งค่าประเภทพิธี
            </button>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อผู้จอง หรือประเภทพิธี..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Tabs Filter */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-fit mb-8 gap-1">
          {[
            { id: 'pending', label: 'รออนุมัติ', color: 'text-orange-600' },
            { id: 'approved', label: 'อนุมัติแล้ว', color: 'text-emerald-600' },
            { id: 'all', label: 'ทั้งหมด', color: 'text-slate-600' }
          ].map((t) => (
            <button 
              key={t.id} 
              onClick={() => setFilter(t.id)} 
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                filter === t.id 
                ? 'bg-white shadow-md shadow-slate-200 ' + t.color
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-4xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">ข้อมูลผู้ขอจอง</th>
                  <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">ประเภทพิธี</th>
                  <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">กำหนดการ</th>
                  <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">สถานะ</th>
                  <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-slate-400 font-medium">กำลังโหลดข้อมูล...</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-slate-400 font-medium">ไม่พบข้อมูลการจอง</td>
                  </tr>
                ) : filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-700">{booking.full_name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone size={12} /> {booking.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {booking.booking_type_name}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(booking.booking_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock size={14} />
                          {booking.booking_time} น.
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      {booking.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse"></span>
                          รอการพิจารณา
                        </span>
                      ) : booking.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                          <Check size={12} />
                          อนุมัติแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                          <X size={12} />
                          ปฏิเสธแล้ว
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        {booking.status === 'pending' && (
                          <button 
                            onClick={() => {setSelectedBooking(booking); setShowModal(true)}} 
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="พิจารณา"
                          >
                            <MoreHorizontal size={18}/>
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(booking.id)} 
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="ลบ"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modern Modal: Management */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-100 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <Info size={24} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">พิจารณาคำขอการจอง</h3>
                <p className="text-sm text-slate-400">คุณ {selectedBooking.full_name}</p>
              </div>
            </div>
            
            <div className="mb-6 space-y-4">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">รายละเอียดเพิ่มเติม</div>
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedBooking.details || 'ไม่มีข้อมูลรายละเอียดเพิ่มเติม'}</p>
               </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block tracking-widest">ข้อความตอบกลับจากเจ้าหน้าที่</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-2xl p-4 text-sm h-32 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none" 
                  placeholder="เช่น เตรียมเอกสารเพิ่มเติม หรือขั้นตอนถัดไป..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')} 
                className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
              >
                ปฏิเสธคำขอ
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedBooking.id, 'approved')} 
                className="py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:shadow-orange-600/40 transition-all active:scale-95"
              >
                อนุมัติการจอง
              </button>
            </div>
            <button 
              onClick={() => setShowModal(false)} 
              className="w-full mt-4 text-sm text-slate-400 font-medium hover:text-slate-600"
            >
              ปิดหน้าต่างนี้
            </button>
          </div>
        </div>
      )}

      {/* Modern Modal: Type Management */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-100 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl font-bold">
                  <Settings size={20} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">จัดการประเภทพิธี</h3>
              </div>
              <button onClick={() => setShowTypeModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="text-slate-400" />
              </button>
            </div>

            <div className="flex gap-2 mb-8">
              <input 
                type="text" 
                value={newTypeName} 
                onChange={(e) => setNewTypeName(e.target.value)} 
                placeholder="ชื่อพิธีใหม่..." 
                className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm" 
              />
              <button 
                onClick={handleAddType} 
                className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block">รายการปัจจุบัน</label>
              {bookingTypes.map(t => (
                <div key={t.id} className="group flex justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl items-center hover:bg-white hover:border-orange-200 hover:shadow-sm transition-all">
                  <span className="text-sm font-bold text-slate-700">{t.name}</span>
                  <button 
                    onClick={() => handleDeleteType(t.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
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