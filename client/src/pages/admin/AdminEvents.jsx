import { useEffect, useMemo, useState } from "react";
import { eventAPI } from "../../services/api";
import { toast } from "react-toastify";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Plus, Edit, Trash2, Search, X, Calendar as CalendarIcon,
  List, LayoutGrid, CheckCircle2, EyeOff, Info, Clock
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
      
      const eventColor = event.is_visible ? '#06b6d4' : '#94a3b8';

      return {
        id: event.id.toString(),
        title: event.title,
        start: toDateInput(event.start_date),
        end: endDate,
        backgroundColor: eventColor,
        borderColor: 'transparent',
        textColor: '#ffffff',
        display: 'block',
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
    <div className="min-h-screen bg-[#fafafa] pb-12 p-4 md:p-8 lg:p-10 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-cyan-600 font-black text-xs uppercase tracking-[0.2em]">
            <span className="w-8 h-0.5 bg-cyan-600"></span>
            Event Management
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            จัดการกิจกรรม <span className="text-cyan-500">.</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-md">บริหารจัดการตารางงานบุญ และกิจกรรมสำคัญของวัดให้เป็นระเบียบและเข้าถึงง่าย</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* View Switcher */}
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-full sm:w-auto">
            <button 
              onClick={() => setViewMode("calendar")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${viewMode === 'calendar' ? 'bg-slate-900 shadow-lg shadow-slate-200 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={16} /> ปฏิทิน
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${viewMode === 'list' ? 'bg-slate-900 shadow-lg shadow-slate-200 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={16} /> รายการ
            </button>
          </div>

          <button 
            onClick={() => handleOpenModal()} 
            className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-black shadow-xl shadow-cyan-200/60 flex items-center justify-center gap-3 active:scale-95 transition-all duration-300 group"
          >
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" /> 
            <span>เพิ่มกิจกรรมใหม่</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-cyan-50 border-t-cyan-500 rounded-full animate-spin"></div>
                <CalendarIcon className="absolute text-cyan-200" size={20} />
            </div>
            <p className="text-slate-400 font-black text-xs tracking-[0.3em] uppercase animate-pulse">กำลังเตรียมข้อมูล</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl shadow-slate-200/40 border border-white overflow-hidden">
            {viewMode === "calendar" ? (
              <div className="calendar-container custom-calendar animate-in fade-in zoom-in-95 duration-700">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
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
                        dayMaxEvents={3}
                        />
                    </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:max-w-md group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-cyan-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="ค้นหาชื่อกิจกรรม หรือรายละเอียด..." 
                            value={search}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-cyan-100 focus:ring-4 focus:ring-cyan-500/5 outline-none text-sm font-bold text-slate-700 transition-all placeholder:text-slate-300"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-slate-400 text-xs font-bold bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                        พบทั้งหมด {filteredEvents.length} รายการ
                    </div>
                </div>
                
                <div className="overflow-x-auto -mx-6 md:mx-0 rounded-3xl border border-slate-100">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50/80 backdrop-blur-md text-slate-500 text-[11px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-5">กิจกรรม</th>
                        <th className="px-8 py-5">ช่วงเวลาดำเนินการ</th>
                        <th className="px-8 py-5 text-center">สถานะ</th>
                        <th className="px-8 py-5 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredEvents.length > 0 ? filteredEvents.map(event => (
                        <tr key={event.id} className="group hover:bg-cyan-50/30 transition-all duration-300">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                                <span className="font-black text-slate-700 text-base group-hover:text-cyan-700 transition-colors">{event.title}</span>
                                <span className="text-sm text-slate-400 mt-1 font-medium line-clamp-1 italic">{event.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white transition-colors">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-600">
                                    {new Date(event.start_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    {event.end_date && (
                                    <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        สิ้นสุด {new Date(event.end_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                    )}
                                </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${event.is_visible ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                              {event.is_visible ? (
                                <><CheckCircle2 size={12} strokeWidth={3} /> Public</>
                              ) : (
                                <><EyeOff size={12} strokeWidth={3} /> Hidden</>
                              )}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                              <button onClick={() => handleOpenModal(event)} className="p-2.5 text-cyan-600 bg-white shadow-sm border border-cyan-100 rounded-xl hover:bg-cyan-500 hover:text-white transition-all"><Edit size={18}/></button>
                              <button onClick={() => handleDelete(event.id)} className="p-2.5 text-red-400 bg-white shadow-sm border border-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                            <td colSpan="4" className="px-8 py-20 text-center">
                                <div className="flex flex-col items-center gap-3 text-slate-300">
                                    <Info size={40} strokeWidth={1} />
                                    <p className="font-bold">ไม่พบกิจกรรมที่ค้นหา</p>
                                </div>
                            </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center z-100 p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 max-h-[95vh] flex flex-col border border-white">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${editingEvent ? 'bg-cyan-100 text-cyan-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {editingEvent ? <Edit size={20} /> : <Plus size={20} />}
                  </div>
                  <h2 className="font-black text-xl text-slate-800 tracking-tight">
                    {editingEvent ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่'}
                  </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">หัวข้อกิจกรรม</label>
                <input 
                  required 
                  type="text" 
                  placeholder="เช่น งานบวชหมู่, วันมาฆบูชา..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-cyan-200 transition-all font-bold text-slate-700 shadow-inner" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">วันที่เริ่ม</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-cyan-200 font-bold text-slate-700 shadow-inner" 
                    value={formData.start_date} 
                    onChange={e => setFormData({...formData, start_date: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">วันที่สิ้นสุด</label>
                  <input 
                    type="date" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-cyan-200 font-bold text-slate-700 shadow-inner" 
                    value={formData.end_date} 
                    onChange={e => setFormData({...formData, end_date: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">รายละเอียด</label>
                <textarea 
                   placeholder="รายละเอียดกิจกรรมเพิ่มเติม (ถ้ามี)"
                   className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-cyan-200 font-medium text-slate-700 resize-none h-32 shadow-inner transition-all" 
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div 
                onClick={() => setFormData({...formData, is_visible: !formData.is_visible})}
                className={`flex items-center justify-between p-5 rounded-4xl border-2 cursor-pointer transition-all duration-300 ${formData.is_visible ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}
              >
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-colors ${formData.is_visible ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {formData.is_visible ? <CheckCircle2 size={20} strokeWidth={3} /> : <EyeOff size={20} strokeWidth={3} />}
                      </div>
                      <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">การแสดงผลบนเว็บไซต์</span>
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{formData.is_visible ? 'ทุกคนมองเห็นได้' : 'ซ่อนจากสาธารณะ'}</span>
                      </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_visible ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.is_visible ? 'left-7' : 'left-1'}`}></div>
                  </div>
              </div>

              <div className="flex gap-4 pt-4">
                {editingEvent && (
                  <button 
                    type="button"
                    onClick={() => handleDelete(editingEvent.id)}
                    className="flex-1 py-5 bg-red-50 text-red-500 font-black rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-200"
                  >
                    ลบกิจกรรม
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-2 py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-3xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                >
                  {editingEvent ? 'อัปเดตข้อมูลกิจกรรม' : 'บันทึกกิจกรรมใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modern Calendar CSS Customization --- */}
      <style>{`
        .custom-calendar .fc {
          --fc-border-color: #f1f5f9;
          --fc-daygrid-event-dot-width: 8px;
          font-family: inherit;
        }

        .custom-calendar .fc-theme-standard {
            border: none !important;
        }

        .custom-calendar .fc-theme-standard td, 
        .custom-calendar .fc-theme-standard th {
            border: 1px solid #f8fafc !important;
        }

        /* Toolbar */
        .custom-calendar .fc .fc-toolbar {
            margin-bottom: 2rem !important;
            padding: 0 10px;
        }

        .custom-calendar .fc .fc-toolbar-title {
            font-size: 1.5rem !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            letter-spacing: -0.025em;
        }

        .custom-calendar .fc .fc-button-primary {
            background: white !important;
            border: 1px solid #e2e8f0 !important;
            color: #64748b !important;
            font-weight: 800 !important;
            border-radius: 14px !important;
            padding: 10px 18px !important;
            font-size: 0.85rem !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
            transition: all 0.2s !important;
        }

        .custom-calendar .fc .fc-button-primary:hover {
            background: #f8fafc !important;
            color: #0f172a !important;
            border-color: #cbd5e1 !important;
        }

        .custom-calendar .fc .fc-button-active {
            background: #0f172a !important;
            border-color: #0f172a !important;
            color: white !important;
        }

        /* Day Grid */
        .custom-calendar .fc-daygrid-day-number {
            font-size: 0.8rem !important;
            font-weight: 800 !important;
            color: #94a3b8 !important;
            padding: 12px !important;
            text-decoration: none !important;
        }

        .custom-calendar .fc-col-header-cell {
            background: #fcfcfd !important;
            padding: 15px 0 !important;
        }

        .custom-calendar .fc-col-header-cell-cushion {
            font-size: 0.75rem !important;
            font-weight: 900 !important;
            color: #64748b !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
            text-decoration: none !important;
        }

        .custom-calendar .fc-day-today {
            background: #f0f9ff !important;
        }

        .custom-calendar .fc-day-today .fc-daygrid-day-number {
            color: #06b6d4 !important;
        }

        /* Events */
        .fc-event {
            border-radius: 10px !important;
            padding: 5px 10px !important;
            margin: 2px 5px !important;
            font-size: 0.75rem !important;
            font-weight: 800 !important;
            border: none !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            cursor: pointer !important;
            transition: transform 0.2s !important;
        }

        .fc-event:hover {
            transform: scale(1.02) !important;
        }

        .fc-daygrid-more-link {
            font-size: 0.7rem !important;
            font-weight: 900 !important;
            color: #06b6d4 !important;
            padding-left: 10px !important;
            text-decoration: none !important;
        }

        /* Hide focus ring */
        :focus { outline: none !important; }
      `}</style>
    </div>
  );
};

export default AdminEvents;