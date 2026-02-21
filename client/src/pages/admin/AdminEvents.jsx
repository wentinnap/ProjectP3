import { useEffect, useMemo, useState } from "react";
import { eventAPI } from "../../services/api";
import { toast } from "react-toastify";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Plus, Edit, Trash2, Search, X, Calendar as CalendarIcon,
  List, LayoutGrid
} from "lucide-react";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("calendar"); // calendar | list
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
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start_date,
      end: event.end_date ? new Date(new Date(event.end_date).setDate(new Date(event.end_date).getDate() + 1)).toISOString().split('T')[0] : event.start_date,
      backgroundColor: event.is_visible ? '#06b6d4' : '#9ca3af', // ใช้สี Cyan แทนส้ม
      borderColor: 'transparent',
      extendedProps: { ...event }
    }));
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
        is_visible: !!item.is_visible,
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
      const payload = { ...formData, title: formData.title.trim() };
      if (editingEvent) {
        await eventAPI.update(editingEvent.id, payload);
        toast.success("แก้ไขสำเร็จ");
      } else {
        await eventAPI.create(payload);
        toast.success("เพิ่มสำเร็จ");
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error("บันทึกไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบกิจกรรมนี้?")) return;
    try {
      await eventAPI.delete(id);
      toast.success("ลบสำเร็จ");
      if(showModal) setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  function toDateInput(value) {
    if (!value) return "";
    return new Date(value).toISOString().split('T')[0];
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Page Header - ปรับให้คลีนและเข้ากับ Layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="text-cyan-500" size={28} />
            จัดการกิจกรรมวัด
          </h2>
          <p className="text-gray-500 text-sm">กำหนดการงานบุญและกิจกรรมต่างๆ ภายในวัด</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Switcher */}
          <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
            <button 
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-cyan-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={18} /> ปฏิทิน
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <List size={18} /> รายการ
            </button>
          </div>

          <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none px-6 py-2.5 bg-[#343d52] hover:bg-[#3e485f] text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
            <Plus size={20} /> เพิ่มกิจกรรม
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          {viewMode === "calendar" ? (
            <div className="calendar-container custom-calendar">
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
            <div className="space-y-4">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" placeholder="ค้นหากิจกรรม..." 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-100 outline-none"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="pb-4 font-bold">กิจกรรม</th>
                      <th className="pb-4 font-bold">วันที่เริ่ม</th>
                      <th className="pb-4 font-bold text-center">สถานะ</th>
                      <th className="pb-4 text-right font-bold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {events.filter(ev => ev.title.toLowerCase().includes(search.toLowerCase())).map(event => (
                      <tr key={event.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 font-bold text-gray-700">{event.title}</td>
                        <td className="py-4 text-sm text-gray-500">{toDateInput(event.start_date)}</td>
                        <td className="py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${event.is_visible ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            {event.is_visible ? 'Public' : 'Hidden'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenModal(event)} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"><Edit size={18}/></button>
                            <button onClick={() => handleDelete(event.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#343d52]/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-lg text-gray-800">{editingEvent ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">ชื่อกิจกรรม</label>
                <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-cyan-500 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">วันที่เริ่ม</label>
                  <input required type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-cyan-500 transition-all" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">วันที่สิ้นสุด (ถ้ามี)</label>
                  <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-cyan-500 transition-all" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input type="checkbox" id="vis" checked={formData.is_visible} onChange={e => setFormData({...formData, is_visible: e.target.checked})} className="w-5 h-5 accent-cyan-500 cursor-pointer" />
                <label htmlFor="vis" className="text-sm font-bold text-gray-600 cursor-pointer">แสดงผลบนหน้าเว็บไซต์</label>
              </div>
              <div className="flex gap-3 pt-4">
                {editingEvent && (
                  <button type="button" onClick={() => handleDelete(editingEvent.id)} className="px-6 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">ลบ</button>
                )}
                <button type="submit" className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-100 transition-all">
                  {editingEvent ? 'ยืนยันการแก้ไข' : 'เพิ่มกิจกรรม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-calendar .fc .fc-toolbar-title { font-size: 1.1rem; font-weight: 800; color: #343d52; text-transform: uppercase; }
        .custom-calendar .fc .fc-button-primary { background-color: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; font-weight: bold; text-transform: capitalize; }
        .custom-calendar .fc .fc-button-primary:not(:disabled):active, 
        .custom-calendar .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #06b6d4; border-color: #06b6d4; color: white; }
        .custom-calendar .fc .fc-daygrid-day.fc-day-today { background-color: #ecfeff; }
        .fc-event { border: none !important; padding: 4px 8px !important; font-weight: 600 !important; font-size: 0.75rem !important; }
      `}</style>
    </div>
  );
};

export default AdminEvents;