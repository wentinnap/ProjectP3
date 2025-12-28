import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { eventAPI } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Calendar as CalendarIcon, X, CalendarClock, MapPin } from "lucide-react";

const EventCalendar = () => {
  const [eventsRaw, setEventsRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [open, setOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await eventAPI.getAll(); // public: is_visible = true
      setEventsRaw(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ แปลงข้อมูลจาก backend -> FullCalendar format
  const calendarEvents = useMemo(() => {
    return eventsRaw.map((e) => {
      const endExclusive = e.end_date ? addOneDay(e.end_date) : null;

      return {
        id: String(e.id),
        title: e.title,
        start: e.start_date, 
        end: endExclusive,   
        allDay: true,
        extendedProps: {
          description: e.description || "",
          start_date: e.start_date,
          end_date: e.end_date || null,
          location: e.location || "วัดพระธาตุ", // สมมติว่ามี field location
        },
        // Custom styles for events
        classNames: ['luxury-event'],
        backgroundColor: '#f97316',
        borderColor: '#f97316',
      };
    });
  }, [eventsRaw]);

  const onEventClick = (info) => {
    setActiveEvent(info.event);
    setOpen(true);
  };

  const onDateClick = (info) => {
    // Optional: Click on empty date
    setActiveEvent({
      title: "วันที่ " + formatThaiDate(info.dateStr),
      extendedProps: { 
          description: "ไม่มีกิจกรรมสำคัญในวันนี้",
          start_date: info.dateStr 
      },
    });
    setOpen(true);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 font-sans pb-0">
        
        {/* Header Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            
            <div className="container mx-auto px-4 relative z-10 text-center text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6">
                    <CalendarClock className="w-5 h-5 text-amber-200" />
                    <span className="text-sm font-medium tracking-wide">ปฏิทินงานบุญ</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">ตารางกิจกรรม</h1>
                <p className="text-orange-100 text-lg font-light">ติดตามวันสำคัญทางศาสนาและกิจกรรมต่างๆ ของวัด</p>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1">
                <svg viewBox="0 0 1440 80" fill="none" className="w-full h-[60px]" preserveAspectRatio="none">
                    <path d="M0 0C240 80 480 80 720 60C960 40 1200 20 1440 80V80H0V0Z" fill="#f9fafb"/>
                </svg>
            </div>
        </section>

        {/* Calendar Container */}
        <div className="container mx-auto px-4 -mt-10 relative z-20 pb-20">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-6 md:p-10 overflow-hidden relative">
            
            {/* Top Bar Decor */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-orange-400 via-amber-400 to-yellow-400"></div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">กำลังโหลดปฏิทิน...</p>
              </div>
            ) : (
              <div className="luxury-calendar">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={calendarEvents}
                  eventClick={onEventClick}
                  dateClick={onDateClick}
                  height="auto"
                  dayMaxEventRows={3}
                  eventDisplay="block"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek' // Optional: add week view
                  }}
                  buttonText={{
                    today: 'วันนี้',
                    month: 'เดือน',
                    week: 'สัปดาห์'
                  }}
                  locale="th" // ใช้ภาษาไทย (ต้องลง @fullcalendar/core/locales/th หรือ config เอง)
                />
              </div>
            )}
          </div>
        </div>

        {/* Event Modal */}
        {open && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
              
              {/* Modal Header */}
              <div className="bg-linear-to-r from-orange-50 to-amber-50 px-6 py-5 border-b border-orange-100 flex items-start justify-between">
                <div>
                    <span className="text-xs font-bold text-orange-500 tracking-wider uppercase mb-1 block">Event Details</span>
                    <h3 className="font-bold text-xl text-gray-800 line-clamp-2 leading-tight">
                        {activeEvent?.title || "รายละเอียด"}
                    </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-orange-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-all shadow-sm shrink-0 ml-4"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                
                {/* Date & Time */}
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                        <CalendarIcon size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">วัน-เวลา</p>
                        <p className="text-gray-800 font-medium">
                            {activeEvent?.extendedProps?.start_date && formatThaiDate(activeEvent.extendedProps.start_date)}
                            {activeEvent?.extendedProps?.end_date && ` - ${formatThaiDate(activeEvent.extendedProps.end_date)}`}
                        </p>
                    </div>
                </div>

                {/* Location (Mock) */}
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">สถานที่</p>
                        <p className="text-gray-800 font-medium">
                            {activeEvent?.extendedProps?.location || "วัดพระธาตุ (ลานพิธี)"}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {activeEvent?.extendedProps?.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition-all shadow-lg shadow-gray-200"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />

      {/* ✅ Custom Styles for Luxury Calendar */}
      <style>{`
        .luxury-calendar {
            font-family: 'Sarabun', sans-serif; /* หรือฟอนต์หลักของเว็บ */
        }
        .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 800 !important;
          color: #1f2937 !important;
        }
        .fc-button {
          border-radius: 12px !important;
          border: 1px solid #e5e7eb !important;
          background: white !important;
          color: #4b5563 !important;
          font-weight: 600 !important;
          padding: 0.5rem 1rem !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
          transition: all 0.2s !important;
        }
        .fc-button:hover {
          background: #fff7ed !important;
          border-color: #fb923c !important;
          color: #ea580c !important;
          transform: translateY(-1px);
        }
        .fc-button-active {
          background: #f97316 !important;
          border-color: #f97316 !important;
          color: white !important;
        }
        .fc-daygrid-day-number {
            font-size: 0.9rem;
            font-weight: 600;
            color: #6b7280;
            padding: 8px !important;
        }
        .fc-day-today {
            background-color: #fff7ed !important; /* Orange-50 */
        }
        .fc-day-today .fc-daygrid-day-number {
            color: #ea580c;
            font-weight: 800;
        }
        .fc-col-header-cell {
            background-color: #f9fafb;
            padding: 12px 0 !important;
            border-bottom: 1px solid #e5e7eb !important;
        }
        .fc-col-header-cell-cushion {
          font-weight: 700 !important;
          color: #374151 !important;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
        }
        .luxury-event {
            border-radius: 6px !important;
            padding: 2px 6px !important;
            font-size: 0.85rem !important;
            border: none !important;
            box-shadow: 0 2px 4px rgba(249, 115, 22, 0.2) !important;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .luxury-event:hover {
            transform: scale(1.02);
            filter: brightness(1.1);
        }
        .fc-daygrid-event-dot {
            border-color: white !important;
        }
        .fc-theme-standard td, .fc-theme-standard th {
            border-color: #f3f4f6 !important;
        }
      `}</style>
    </>
  );
};

// helpers
function addOneDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatThaiDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default EventCalendar;