import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "../../CalendarCustom.css";
import { Clock, Users, Phone, Info, CheckCircle } from 'lucide-react';
import Navbar from "../../components/layout/Navbar";

const Booking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingTypes, setBookingTypes] = useState([]);
  const [busyDates, setBusyDates] = useState({});
  const [availableCount, setAvailableCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [maxMonks, setMaxMonks] = useState(20);

  const timeSlots = ["07:00", "08:00", "09:00", "10:00", "11:00"];
  const [formData, setFormData] = useState({
    booking_type_id: '', booking_date: '', booking_time: '',
    monks_count: '', full_name: user?.full_name || '', phone: user?.phone || '', details: ''
  });

  // เช็คจำนวนพระว่างเมื่อเลือก วัน หรือ เวลา
  const fetchAvailability = useCallback(async (date, time) => {
    if (!date || !time) return;
    try {
      const res = await bookingAPI.checkAvailableMonks(date, `${time}:00`);
      setAvailableCount(res.data.available_monks);
    } catch (err) { setAvailableCount(0); }
  }, []);

  const fetchMonthlyStatus = async (date) => {
    try {
      const res = await bookingAPI.getMonthlyStatus(date.getFullYear(), date.getMonth() + 1);
      setBusyDates(res.data.busyDates || {});
      setMaxMonks(res.data.max_monks || 20);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    bookingAPI.getTypes().then(res => setBookingTypes(res.data.data));
    fetchMonthlyStatus(new Date());
  }, []);

  const handleDateChange = (date) => {
    const dateStr = date.toLocaleDateString('sv-SE');
    setFormData(prev => ({ ...prev, booking_date: dateStr, booking_time: '', monks_count: '' }));
    setAvailableCount(null);
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toLocaleDateString('sv-SE');
      const today = new Date().setHours(0,0,0,0);
      if (date < today) return 'past-date';
      const used = busyDates[dateStr]?.used || 0;
      if (used >= maxMonks) return 'date-full';
      if (used > 0) return 'date-partial';
      return 'date-available';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(formData.monks_count) > availableCount) return toast.error('จำนวนพระไม่พอ');
    setLoading(true);
    try {
      await bookingAPI.create({ ...formData, booking_time: `${formData.booking_time}:00` });
      toast.success('ส่งคำขอจองสำเร็จ');
      navigate('/profile');
    } catch (err) { toast.error(err.response?.data?.message || 'จองไม่สำเร็จ');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-10">
        <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ปฏิทิน */}
          <div className="lg:col-span-7 bg-white rounded-[30px] shadow-sm p-6">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600"><CheckCircle /> 1. เลือกวัน</h2>
             <Calendar onChange={handleDateChange} tileClassName={getTileClassName} onActiveStartDateChange={({ activeStartDate }) => fetchMonthlyStatus(activeStartDate)} minDate={new Date()} />
          </div>

          {/* ฟอร์ม */}
          <div className="lg:col-span-5 bg-white rounded-[30px] shadow-xl p-8 border-t-8 border-orange-500">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <p className="text-sm font-bold text-orange-800">วันที่: {formData.booking_date || 'โปรดเลือกบนปฏิทิน'}</p>
                {availableCount !== null && <p className="text-lg font-black text-green-600">ว่างสำหรับเวลานี้: {availableCount} รูป</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2"><Clock size={16}/> 2. เลือกเวลา</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(t => (
                    <button key={t} type="button" onClick={() => { setFormData({...formData, booking_time: t}); fetchAvailability(formData.booking_date, t); }} 
                      className={`p-2 rounded-xl border-2 font-bold ${formData.booking_time === t ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>{t} น.</button>
                  ))}
                </div>
              </div>

              <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" onChange={e => setFormData({...formData, booking_type_id: e.target.value})} required>
                <option value="">3. เลือกประเภทพิธี...</option>
                {bookingTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <div className="space-y-1">
                <label className="text-sm font-bold ml-1">4. จำนวนพระ (รูป)</label>
                <input type="number" placeholder="ระบุจำนวนพระ" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
                  value={formData.monks_count} max={availableCount} onChange={e => setFormData({...formData, monks_count: e.target.value})} required disabled={!formData.booking_time} />
              </div>

              <input type="tel" placeholder="เบอร์โทรติดต่อ" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} required />

              <button type="submit" disabled={loading || !availableCount} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg hover:bg-orange-600 disabled:bg-gray-300">
                {loading ? "กำลังตรวจสอบ..." : "ยืนยันการจอง"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default Booking;