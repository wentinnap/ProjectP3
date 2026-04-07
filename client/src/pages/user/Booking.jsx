import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar'; // ✅ เพิ่มใหม่
import 'react-calendar/dist/Calendar.css'; // ✅ CSS พื้นฐาน
import './CalendarCustom.css'; // ✅ ไฟล์แต่งสีที่เราจะสร้าง
import { 
  User, Phone, Send, Info, Calendar as CalendarIcon, CheckCircle2 
} from 'lucide-react';
import Navbar from "../../components/layout/Navbar";

const Booking = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bookingTypes, setBookingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // สถานะพระว่าง
  const [availableMonks, setAvailableMonks] = useState(null);
  const [totalMonks, setTotalMonks] = useState(20);
  const [checkingMonks, setCheckingMonks] = useState(false);

  // ข้อมูลวันที่เต็ม (ดึงมาจาก Backend)
  const [busyDates, setBusyDates] = useState({}); // { "2026-04-10": 20 }

  const [formData, setFormData] = useState({
    booking_type_id: '',
    booking_date: '',
    monks_count: '', 
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    details: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('กรุณาเข้าสู่ระบบก่อนจองพิธี');
      navigate('/login');
      return;
    }
    fetchBookingTypes();
    fetchMonthlyStatus(new Date()); // โหลดสถานะเดือนปัจจุบัน
  }, [isAuthenticated, navigate]);

  // ✅ ดึงสถานะรายเดือนเพื่อมาแสดงในปฏิทิน
  const fetchMonthlyStatus = async (date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      // หมายเหตุ: ต้องมี API นี้ที่ Backend เพื่อคืนค่า { "YYYY-MM-DD": count }
      // const res = await bookingAPI.getMonthlyStatus(year, month);
      // setBusyDates(res.data.busyDates);
    } catch (error) {
      console.error("Failed to fetch monthly status");
    }
  };

  const fetchBookingTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
  };

  // ✅ เมื่อคลิกเลือกวันที่ในปฏิทิน
  const handleDateSelect = (date) => {
    // ปรับ Format เป็น YYYY-MM-DD
    const dateString = date.toLocaleDateString('sv-SE'); 
    setFormData({ ...formData, booking_date: dateString });
    handleCheckAvailable(dateString);
  };

  const handleCheckAvailable = async (date) => {
    setCheckingMonks(true);
    try {
      const response = await bookingAPI.checkAvailableMonks(date);
      setAvailableMonks(response.data.available_monks);
      setTotalMonks(response.data.total_monks);
    } catch (error) {
      console.error("Error checking monks:", error);
    } finally {
      setCheckingMonks(false);
    }
  };

  // ✅ ฟังก์ชันกำหนดสีให้แต่ละช่องในปฏิทิน
  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString('sv-SE');
      const usedCount = busyDates[dateString] || 0;
      
      if (date < new Date().setHours(0,0,0,0)) return 'past-date';
      if (usedCount >= totalMonks) return 'date-full'; // สีแดง
      if (usedCount > 0) return 'date-partial'; // สีส้ม
      return 'date-available'; // สีเขียว
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.booking_date) return toast.error('กรุณาเลือกวันที่จากปฏิทิน');
    
    setLoading(true);
    try {
      await bookingAPI.create({
        ...formData,
        booking_type_id: parseInt(formData.booking_type_id),
        monks_count: parseInt(formData.monks_count)
      });
      toast.success('จองพิธีสำเร็จ');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFBF7] font-sans pb-20 pt-28 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-gray-900 mb-2">จองคิวนิมนต์พระ</h1>
                <p className="text-gray-500 font-medium">เลือกวันที่ว่างจากปฏิทินและกรอกรายละเอียด</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* ฝั่งซ้าย: ปฏิทิน (7 ส่วน) */}
              <div className="lg:col-span-7 bg-white rounded-[40px] shadow-2xl p-6 border border-orange-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                    <CalendarIcon size={20} />
                  </div>
                  <h3 className="text-xl font-black text-gray-800">ตารางวันว่าง</h3>
                </div>

                <Calendar
                  onChange={handleDateSelect}
                  onActiveStartDateChange={({ activeStartDate }) => fetchMonthlyStatus(activeStartDate)}
                  tileClassName={getTileClassName}
                  minDate={new Date()}
                  className="w-full border-none font-sans"
                />

                <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs font-bold text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div> วันว่าง
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div> มีการจองบ้างแล้ว
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div> เต็ม
                  </div>
                </div>
              </div>

              {/* ฝั่งขวา: ฟอร์ม (5 ส่วน) */}
              <div className="lg:col-span-5 bg-white rounded-[40px] shadow-2xl p-8 border border-orange-50 overflow-hidden relative">
                <div className="h-2 absolute top-0 left-0 w-full bg-linear-to-r from-orange-500 to-amber-500"></div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 mb-4">
                    <p className="text-sm font-bold text-orange-800">วันที่เลือก:</p>
                    <p className="text-2xl font-black text-orange-600">
                      {formData.booking_date || "กรุณาเลือกวันที่บนปฏิทิน"}
                    </p>
                  </div>

                  {availableMonks !== null && (
                    <div className="flex justify-between items-center px-2">
                       <span className="text-sm font-bold text-gray-600">พระว่างคงเหลือ:</span>
                       <span className={`text-lg font-black ${availableMonks > 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {availableMonks} รูป
                       </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <select
                      name="booking_type_id"
                      value={formData.booking_type_id}
                      onChange={(e) => setFormData({...formData, booking_type_id: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 font-bold outline-none"
                      required
                    >
                      <option value="">ประเภทพิธี...</option>
                      {bookingTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="จำนวนพระ (รูป)"
                      value={formData.monks_count}
                      onChange={(e) => setFormData({...formData, monks_count: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 font-bold outline-none"
                      required
                      min="1"
                    />

                    <input
                      type="tel"
                      placeholder="เบอร์โทรศัพท์"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 font-bold outline-none"
                      required
                    />

                    <textarea
                      placeholder="สถานที่และรายละเอียดเพิ่มเติม..."
                      value={formData.details}
                      onChange={(e) => setFormData({...formData, details: e.target.value})}
                      rows="3"
                      className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-3xl focus:border-orange-500 font-medium resize-none outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !formData.booking_date || (availableMonks !== null && availableMonks <= 0)}
                    className="w-full py-5 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-black shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? "กำลังดำเนินการ..." : "ยืนยันการจอง"}
                    <Send size={18} />
                  </button>
                </form>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Booking;