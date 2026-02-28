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

  const calendarEvents = useMemo(() => {
    if (!events) return [];
    return events.map(event => {
      let endDate = event.start_date;
      if (event.end_date) {
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

  function toDateInput(value) {
    if (!value) return "";
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.filter(ev => 
      ev.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [events, search]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-10 p-3 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-100 rounded-2xl text-cyan-600 shadow-sm">
            <CalendarIcon size={28} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">จัดการกิจกรรม</h2>
            <p className="text-slate-500 text-sm font-medium hidden sm:block">กำหนดการงานบุญ และกิจกรรมสำคัญ</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner w-full sm:w-auto">
            <button 
              onClick={() => setViewMode("calendar")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${viewMode === 'calendar' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-500'}`}
            >
              <LayoutGrid size={16} /> ปฏิทิน
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-500'}`}
            >
              <List size={16} /> รายการ
            </button>
          </div>

          <button 
            onClick={() => handleOpenModal()} 
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Plus size={18} strokeWidth={3} /> <span className="text-sm">เพิ่มกิจกรรม</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-[10px] tracking-widest">LOADING...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-4 md:p-8 shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
            {viewMode === "calendar" ? (
              <div className="calendar-container custom-calendar animate-in zoom-in-95 duration-500 overflow-x-auto">
                <div className="min-w-[600px] md:min-w-full">
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
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="ค้นหากิจกรรม..." 
                    value={search}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none text-sm font-medium"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                {/* Mobile List View / Desktop Table View */}
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full text-left min-w-[700px] md:min-w-full">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">กิจกรรม</th>
                        <th className="px-6 py-4">ช่วงเวลา</th>
                        <th className="px-6 py-4 text-center">การแสดงผล</th>
                        <th className="px-6 py-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredEvents.map(event => (
                        <tr key={event.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-700 group-hover:text-cyan-600 transition-colors">{event.title}</div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-[200px]">{event.description || '-'}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-bold text-slate-600">
                              {new Date(event.start_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </div>
                            {event.end_date && (
                              <div className="text-[10px] text-slate-400 font-medium">
                                ถึง {new Date(event.end_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${event.is_visible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              {event.is_visible ? 'Public' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => handleOpenModal(event)} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"><Edit size={16}/></button>
                              <button onClick={() => handleDelete(event.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
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

      {/* Responsive Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-100 p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-t-4xl sm:rounded-4xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="font-extrabold text-lg text-slate-800 tracking-tight">
                {editingEvent ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">หัวข้อกิจกรรม</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-cyan-500 transition-all font-bold text-slate-700" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">วันที่เริ่ม</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-cyan-500 font-bold text-slate-700" 
                    value={formData.start_date} 
                    onChange={e => setFormData({...formData, start_date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">วันที่สิ้นสุด</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-cyan-500 font-bold text-slate-700" 
                    value={formData.end_date} 
                    onChange={e => setFormData({...formData, end_date: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">รายละเอียด</label>
                <textarea 
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-cyan-500 font-medium text-slate-700 resize-none h-24" 
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.is_visible} 
                    onChange={e => setFormData({...formData, is_visible: e.target.checked})} 
                    className="w-5 h-5 accent-cyan-500 rounded" 
                  />
                  <span className="text-xs font-black text-slate-600">แสดงผลบนเว็บไซต์</span>
              </label>

              <button 
                type="submit" 
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-black rounded-xl shadow-lg shadow-cyan-100 transition-all active:scale-[0.98]"
              >
                {editingEvent ? 'อัปเดตข้อมูล' : 'สร้างกิจกรรม'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-calendar .fc .fc-toolbar-title { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
        @media (min-width: 768px) {
          .custom-calendar .fc .fc-toolbar-title { font-size: 1.5rem; }
        }
        .custom-calendar .fc .fc-button-primary { 
          background: white; border: 1px solid #e2e8f0; color: #64748b; 
          font-weight: 800; border-radius: 10px; padding: 6px 12px; font-size: 0.8rem;
        }
        .custom-calendar .fc .fc-button-primary:hover { background: #f8fafc; color: #1e293b; }
        .custom-calendar .fc .fc-button-primary:not(:disabled).fc-button-active { background: #06b6d4; border-color: #06b6d4; color: white; }
        .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #f1f5f9 !important; }
        .fc-event { border: none !important; padding: 2px 4px !important; font-size: 11px !important; border-radius: 4px !important; }
        .fc-daygrid-dot-event:hover { background: rgba(0,0,0,0.05) !important; }
      `}</style>
    </div>
  );
};

export default AdminEvents;