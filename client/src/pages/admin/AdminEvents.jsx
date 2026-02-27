import { useEffect, useMemo, useState } from "react";
import { eventAPI } from "../../services/api";
import { toast } from "react-toastify";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Plus, Edit, Trash2, Search, X, Calendar as CalendarIcon,
  List, LayoutGrid, Eye, EyeOff
} from "lucide-react";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("calendar");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    is_visible: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventAPI.getAllAdmin();
      setEvents(res.data?.data || []);
    } catch (err) {
      toast.error("โหลดกิจกรรมไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // ✅ แก้ไข: ปรับปรุง Logic การคำนวณวันสิ้นสุดสำหรับ FullCalendar
  const calendarEvents = useMemo(() => {
    if (!events) return [];
    return events.map(event => {
      let endDate = event.start_date;
      if (event.end_date) {
        // FullCalendar exclusive end date fix
        const date = new Date(event.end_date);
        date.setDate(date.getDate() + 1);
        endDate = date.toISOString().split('T')[0];
      }
      
      return {
        id: event.id.toString(),
        title: event.title,
        start: toDateInput(event.start_date),
        end: endDate,
        backgroundColor: event.is_visible ? '#06b6d4' : '#94a3b8', 
        borderColor: 'transparent',
        extendedProps: { ...event }
      };
    });
  }, [events]);

  const handleDateClick = (info) => handleOpenModal(null, info.dateStr);
  const handleEventClick = (info) => handleOpenModal(info.event.extendedProps);

  const handleOpenModal = (item = null, dateStr = null) => {
    if (item) {
      setEditingEvent(item);
      setFormData({
        title: item.title || "",
        description: item.description || "",
        start_date: toDateInput(item.start_date),
        end_date: item.end_date ? toDateInput(item.end_date) : "",
        is_visible: item.is_visible === 1 || item.is_visible === true,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        start_date: dateStr || "",
        end_date: "",
        is_visible: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ เพิ่มการตรวจสอบวัน (Start ต้องไม่เกิน End)
      if (formData.end_date && formData.start_date > formData.end_date) {
        return toast.warning("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่ม");
      }

      const payload = { 
        ...formData, 
        title: formData.title.trim(),
        is_visible: formData.is_visible ? 1 : 0 
      };

      if (editingEvent) {
        await eventAPI.update(editingEvent.id, payload);
        toast.success("แก้ไขข้อมูลกิจกรรมแล้ว");
      } else {
        await eventAPI.create(payload);
        toast.success("เพิ่มกิจกรรมใหม่สำเร็จ");
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "ดำเนินการไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้ออกจากระบบ?")) return;
    try {
      await eventAPI.delete(id);
      toast.success("ลบกิจกรรมเรียบร้อย");
      if(showModal) setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  // ✅ แก้ไข: ป้องกันปัญหา Timezone (วันที่ถอยหลัง 1 วัน)
  function toDateInput(value) {
    if (!value) return "";
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ✅ แก้ไข: เพิ่มการกรองข้อมูลที่ปลอดภัย
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.filter(ev => 
      ev.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [events, search]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20 p-4 lg:p-8 animate-in fade-in duration-500">
      {/* Header และปุ่มควบคุม (เหมือนเดิม) */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-2xl text-cyan-600">
              <CalendarIcon size={32} />
            </div>
            จัดการกิจกรรมวัด
          </h2>
          <p className="text-slate-500 mt-1 ml-14 font-medium">กำหนดการงานบุญ และกิจกรรมสำคัญภายในวัด</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
            <button 
              onClick={() => setViewMode("calendar")}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all duration-300 ${viewMode === 'calendar' ? 'bg-white shadow-md text-cyan-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={18} /> ปฏิทิน
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow-md text-cyan-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={18} /> รายการ
            </button>
          </div>

          <button 
            onClick={() => handleOpenModal()} 
            className="flex-1 md:flex-none px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-[1.25rem] font-bold shadow-xl shadow-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> เพิ่มกิจกรรม
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-[5px] border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold animate-pulse tracking-widest text-xs">LOADING...</p>
          </div>
        ) : (
          <div className="bg-white rounded-4xl p-6 lg:p-8 shadow-xl shadow-slate-200/60 border border-white">
            {viewMode === "calendar" ? (
              <div className="calendar-container custom-calendar animate-in zoom-in-95 duration-500">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  locale="th"
                  events={calendarEvents}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                  }}
                  height="auto"
                />
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อกิจกรรม..." 
                    value={search}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-medium"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <div className="overflow-x-auto rounded-2xl border border-slate-50">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-5">กิจกรรม</th>
                        <th className="px-6 py-5">ช่วงเวลา</th>
                        <th className="px-6 py-5 text-center">การแสดงผล</th>
                        <th className="px-6 py-5 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredEvents.map(event => (
                        <tr key={event.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                          <td className="px-6 py-5">
                            <div className="font-bold text-slate-700 text-lg tracking-tight group-hover:text-cyan-600">
                              {event.title}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{event.description || 'ไม่มีรายละเอียด'}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-slate-600">
                              {new Date(event.start_date).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                            </div>
                            {event.end_date && (
                              <div className="text-[10px] text-slate-400 font-medium">
                                ถึง {new Date(event.end_date).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${event.is_visible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              {event.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                              {event.is_visible ? 'Public' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleOpenModal(event)} className="p-2.5 text-cyan-600 hover:bg-cyan-600 hover:text-white rounded-xl transition-all shadow-sm"><Edit size={18}/></button>
                              <button onClick={() => handleDelete(event.id)} className="p-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"><Trash2 size={18}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal - ใช้ formData.is_visible ที่ตรวจสอบสถานะ 1 หรือ true */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-100 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${editingEvent ? 'bg-blue-100 text-blue-600' : 'bg-cyan-100 text-cyan-600'}`}>
                  {editingEvent ? <Edit size={20} /> : <Plus size={20} strokeWidth={3} />}
                </div>
                <h2 className="font-extrabold text-xl text-slate-800 tracking-tight">
                  {editingEvent ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-all shadow-sm"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">หัวข้อกิจกรรม</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold text-slate-700" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">วันที่เริ่ม</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold text-slate-700" 
                    value={formData.start_date} 
                    onChange={e => setFormData({...formData, start_date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">วันที่สิ้นสุด</label>
                  <input 
                    type="date" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold text-slate-700" 
                    value={formData.end_date} 
                    onChange={e => setFormData({...formData, end_date: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">รายละเอียด</label>
                <textarea 
                   className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-700 resize-none h-28" 
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.25rem] border border-slate-100">
                 <input 
                    type="checkbox" 
                    id="vis" 
                    checked={formData.is_visible} 
                    onChange={e => setFormData({...formData, is_visible: e.target.checked})} 
                    className="w-5 h-5 accent-cyan-500 cursor-pointer" 
                  />
                  <label htmlFor="vis" className="text-sm font-black text-slate-700 cursor-pointer">แสดงผลบนเว็บไซต์</label>
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-black rounded-2xl shadow-xl shadow-cyan-500/20 transition-all"
                >
                  {editingEvent ? 'อัปเดตกิจกรรม' : 'สร้างกิจกรรม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* สไตล์ CSS (เหมือนเดิม) */}
      <style>{`
        .custom-calendar .fc .fc-toolbar-title { font-size: 1.5rem; font-weight: 900; color: #1e293b; }
        .custom-calendar .fc .fc-button-primary { background-color: #ffffff; border: 1px solid #e2e8f0; color: #64748b; font-weight: 800; border-radius: 12px; }
        .custom-calendar .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #06b6d4; border-color: #06b6d4; color: white; }
        .custom-calendar .fc .fc-daygrid-day.fc-day-today { background-color: #ecfeff !important; }
        .fc-event { border: none !important; padding: 4px 8px !important; font-weight: 700 !important; font-size: 0.75rem !important; border-radius: 6px !important; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default AdminEvents;