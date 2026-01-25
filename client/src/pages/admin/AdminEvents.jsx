import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { eventAPI } from "../../services/api";
import { toast } from "react-toastify";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Plus, Edit, Trash2, Eye, EyeOff, Search, X, Calendar as CalendarIcon,
  ArrowLeft, List, LayoutGrid
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

  // แปลงข้อมูลให้เข้ากับรูปแบบของ FullCalendar
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start_date,
      end: event.end_date ? new Date(new Date(event.end_date).setDate(new Date(event.end_date).getDate() + 1)).toISOString().split('T')[0] : event.start_date,
      backgroundColor: event.is_visible ? '#f97316' : '#9ca3af',
      borderColor: 'transparent',
      extendedProps: { ...event }
    }));
  }, [events]);

  const handleDateClick = (info) => {
    handleOpenModal(null, info.dateStr);
  };

  const handleEventClick = (info) => {
    handleOpenModal(info.event.extendedProps);
  };

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
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="text-orange-500" size={24} />
                จัดการกิจกรรมวัด
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setViewMode("calendar")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid size={18} /> ปฏิทิน
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={18} /> รายการ
            </button>
          </div>

          <button onClick={() => handleOpenModal()} className="w-full md:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-95">
            <Plus size={20} /> เพิ่มกิจกรรม
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {viewMode === "calendar" ? (
              <div className="calendar-container">
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
                 {/* ส่วน Search แบบย่อ */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" placeholder="ค้นหากิจกรรม..." 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-200 outline-none"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {/* ตารางแบบย่อ (เหมือนโค้ดเดิมของคุณแต่คลีนขึ้น) */}
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="border-b border-gray-100 text-gray-400 text-sm">
                        <tr>
                          <th className="pb-4 font-medium">กิจกรรม</th>
                          <th className="pb-4 font-medium">วันที่</th>
                          <th className="pb-4 text-right font-medium">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {events.filter(ev => ev.title.includes(search)).map(event => (
                          <tr key={event.id} className="group hover:bg-gray-50 transition-colors">
                            <td className="py-4 font-bold text-gray-700">{event.title}</td>
                            <td className="py-4 text-sm text-gray-500">{toDateInput(event.start_date)}</td>
                            <td className="py-4 text-right">
                               <button onClick={() => handleOpenModal(event)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                               <button onClick={() => handleDelete(event.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
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

      {/* Modal - ปรับปรุงให้กระชับขึ้น */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg text-gray-800">{editingEvent ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">ชื่อกิจกรรม</label>
                <input required type="text" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-orange-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-600 block mb-1">วันที่เริ่ม</label>
                  <input required type="date" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-orange-500" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600 block mb-1">วันที่สิ้นสุด</label>
                  <input type="date" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-orange-500" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="vis" checked={formData.is_visible} onChange={e => setFormData({...formData, is_visible: e.target.checked})} className="w-5 h-5 accent-orange-500" />
                <label htmlFor="vis" className="text-sm font-medium text-gray-700">แสดงผลให้คนทั่วไปเห็น</label>
              </div>
              <div className="flex gap-3 pt-4">
                {editingEvent && (
                  <button type="button" onClick={() => handleDelete(editingEvent.id)} className="px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">ลบ</button>
                )}
                <button type="submit" className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS สำหรับปรับแต่ง FullCalendar เล็กน้อย */}
      <style>{`
        .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: bold; color: #374151; }
        .fc .fc-button-primary { background-color: #f3f4f6; border: none; color: #4b5563; font-weight: bold; }
        .fc .fc-button-primary:not(:disabled):active, .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #f97316; }
        .fc .fc-daygrid-day.fc-day-today { background-color: #fff7ed; }
        .fc-event { cursor: pointer; padding: 2px 4px; border-radius: 4px; font-size: 0.85rem; }
      `}</style>
    </div>
  );
};

export default AdminEvents;