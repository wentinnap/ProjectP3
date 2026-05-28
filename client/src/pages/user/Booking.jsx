import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "../../CalendarCustom.css";
import { Clock, Users, Phone, Info, CheckCircle, MapPin, Sun, Sunrise, User, FileText } from 'lucide-react';
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer"; // ✅ อิมพอร์ตเข้ามาเรียบร้อยแล้ว
import { motion } from 'framer-motion';

const Booking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingTypes, setBookingTypes] = useState([]);
  const [busyDates, setBusyDates] = useState({});
  const [availableCount, setAvailableCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [maxMonks, setMaxMonks] = useState(20);

  const timeSlots = [
    { label: "รอบเช้า", value: "07:00", icon: <Sunrise size={20} /> },
    { label: "รอบเพล/บ่าย", value: "11:00", icon: <Sun size={20} /> }
  ];

  const [formData, setFormData] = useState({
    booking_type_id: '', 
    booking_date: '', 
    booking_time: '',
    monks_count: '', 
    full_name: '', 
    phone: '', 
    details: ''
  });

  // เฝ้าดูการโหลดของสถานะ Auth เพื่อนำมา Pre-fill ข้อมูลเมื่อพร้อม
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const fetchAvailability = useCallback(async (date, time) => {
    if (!date || !time) return;
    try {
      const res = await bookingAPI.checkAvailableMonks(date, `${time}:00`);
      setAvailableCount(res.data.available_monks);
    } catch (err) { 
      setAvailableCount(0); 
    }
  }, []);

  const fetchMonthlyStatus = async (date) => {
    try {
      const res = await bookingAPI.getMonthlyStatus(date.getFullYear(), date.getMonth() + 1);
      setBusyDates(res.data.busyDates || {});
      setMaxMonks(res.data.max_monks || 20);
    } catch (err) { 
      console.error(err); 
    }
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
    if (parseInt(formData.monks_count) > availableCount) return toast.error('จำนวนพระไม่พอสำหรับช่วงเวลานี้');
    setLoading(true);

    try {
      // แก้ไขปัญหา Double Submit: สร้างตัวแปร payload แยกเพื่อไม่ให้กระทบค่าเดิมใน State
      const formattedTime = formData.booking_time.includes(':00') 
        ? formData.booking_time 
        : `${formData.booking_time}:00`;

      await bookingAPI.create({ 
        ...formData, 
        booking_time: formattedTime 
      });

      toast.success('ส่งคำขอจองสำเร็จ');
      navigate('/profile');
    } catch (err) { 
      toast.error(err.response?.data?.message || 'จองไม่สำเร็จ');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      {/* ส่วนเนื้อหาหลักครอบด้วย flex-grow เพื่อดัน Footer ให้ติดขอบล่างเสมอ */}
      <main className="grow">
        <div className="bg-linear-to-b from-orange-500 to-orange-600 pt-32 pb-20 px-4">
          <div className="container mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-white mb-4"
            >
              จองคิวพิธีสงฆ์
            </motion.h1>
            <p className="text-orange-100 text-lg max-w-2xl mx-auto">
              เลือกวันที่และช่วงเวลาที่คุณต้องการ เพื่อความสะดวกในการเตรียมนิมนต์พระคุณเจ้า
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl -mt-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ฝั่งซ้าย: ปฏิทิน */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="bg-white rounded-4xl shadow-xl shadow-orange-900/5 p-8 border border-orange-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                      <CheckCircle size={24} />
                    </div>
                    1. เลือกวันที่ต้องการ
                  </h2>
                </div>
                
                <div className="booking-calendar-container">
                  <Calendar 
                    onChange={handleDateChange} 
                    tileClassName={getTileClassName} 
                    onActiveStartDateChange={({ activeStartDate }) => fetchMonthlyStatus(activeStartDate)} 
                    minDate={new Date()}
                    className="border-none w-full"
                  />
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-8 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-xs font-bold text-gray-500">ว่างมาก</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-8 h-2 bg-orange-400 rounded-full"></span>
                    <span className="text-xs font-bold text-gray-500">มีจองบ้าง</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-8 h-2 bg-red-400 rounded-full"></span>
                    <span className="text-xs font-bold text-gray-500">เต็ม/งดรับ</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ฝั่งขวา: ฟอร์มรายละเอียด */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-6"
            >
              <div className="bg-white rounded-4xl shadow-2xl shadow-orange-900/10 p-8 sticky top-28 border border-orange-100">
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* สถานะการเลือกปัจจุบัน */}
                  <div className="bg-linear-to-r from-orange-50 to-orange-100 p-5 rounded-3xl border border-orange-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">ข้อมูลที่เลือก</p>
                      <Info size={16} className="text-orange-400" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800">
                      {formData.booking_date ? new Date(formData.booking_date).toLocaleDateString('th-TH', { dateStyle: 'long' }) : 'โปรดเลือกวันที่'}
                    </h3>
                    {availableCount !== null && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${availableCount > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {availableCount > 0 ? `พระว่าง ${availableCount} รูป` : 'รอบนี้เต็มแล้ว'}
                        </div>
                        <span className="text-xs text-gray-500">
                          {timeSlots.find(s => s.value === formData.booking_time)?.label || ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* เลือกเวลา (เช้า/เพล) */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2 ml-1">
                      <Clock size={16} className="text-orange-500"/> 2. เลือกช่วงเวลา
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map(slot => (
                        <button 
                          key={slot.value} 
                          type="button" 
                          disabled={!formData.booking_date}
                          onClick={() => { 
                            setFormData({...formData, booking_time: slot.value}); 
                            fetchAvailability(formData.booking_date, slot.value); 
                          }} 
                          className={`py-4 rounded-2xl border-2 font-bold transition-all duration-200 flex flex-col items-center gap-2 ${
                            !formData.booking_date ? 'opacity-50 cursor-not-allowed' : ''
                          } ${
                            formData.booking_time === slot.value 
                            ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105' 
                            : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-orange-200 hover:text-orange-400'
                          }`}
                        >
                          {slot.icon}
                          <div className="text-center">
                            <div className="text-sm">{slot.label}</div>
                            <div className="text-xs font-normal opacity-80">{slot.value} น.</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ประเภทพิธี */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      <MapPin size={16} className="text-orange-500"/> 3. ประเภทพิธี
                    </label>
                    <select 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" 
                      value={formData.booking_type_id}
                      onChange={e => setFormData({...formData, booking_type_id: e.target.value})} 
                      required
                    >
                      <option value="">เลือกประเภทพิธี...</option>
                      {bookingTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  {/* จำนวนพระ */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      <Users size={16} className="text-orange-500"/> 4. จำนวนพระ (รูป)
                    </label>
                    <input 
                      type="number" 
                      placeholder={availableCount ? `ระบุจำนวน (ไม่เกิน ${availableCount})` : "เช่น 9"}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                      value={formData.monks_count} 
                      max={availableCount || 20} 
                      min="1"
                      onChange={e => setFormData({...formData, monks_count: e.target.value})} 
                      required 
                      disabled={!formData.booking_time} 
                    />
                  </div>

                  {/* ชื่อ-นามสกุล ผู้แจ้งจอง */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      <User size={16} className="text-orange-500"/> 5. ชื่อ-นามสกุล ผู้จอง
                    </label>
                    <input 
                      type="text" 
                      placeholder="กรุณาระบุชื่อผู้จองพิธี" 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" 
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})} 
                      required 
                    />
                  </div>

                  {/* เบอร์โทร */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      <Phone size={16} className="text-orange-500"/> 6. เบอร์โทรศัพท์ติดต่อ
                    </label>
                    <input 
                      type="tel" 
                      placeholder="08X-XXX-XXXX" 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      required 
                    />
                  </div>

                  {/* หมายเหตุ / รายละเอียดสถานที่เพิ่มเติม */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      <FileText size={16} className="text-orange-500"/> 7. หมายเหตุ / รายละเอียดเพิ่มเติม (ถ้ามี)
                    </label>
                    <textarea 
                      placeholder="ระบุรายละเอียดเพิ่มเติม เช่น สถานที่จัดงาน หรือความต้องการพิเศษอื่น ๆ" 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all h-24 resize-none" 
                      value={formData.details}
                      onChange={e => setFormData({...formData, details: e.target.value})} 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || !availableCount || availableCount <= 0 || !formData.booking_time} 
                    className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all duration-300 transform active:scale-95 ${
                      loading || !availableCount || availableCount <= 0 || !formData.booking_time
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                      : "bg-linear-to-r from-orange-500 to-orange-600 text-white hover:shadow-orange-200 hover:-translate-y-1"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>กำลังส่งข้อมูล...</span>
                      </div>
                    ) : (
                      "ยืนยันการจองพิธี"
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* 🌟 วาง Footer ไว้ล่างสุดเรียบร้อยครับ */}
      <Footer />
    </div>
  );
};

export default Booking;