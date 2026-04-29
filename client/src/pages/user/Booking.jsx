import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "../../CalendarCustom.css";
import { Calendar as CalendarIcon, Clock, Users, Phone, Info } from 'lucide-react';
import Navbar from "../../components/layout/Navbar";

const Booking = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [bookingTypes, setBookingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyDates, setBusyDates] = useState({}); // เก็บสถานะความว่างรายวัน
  const [totalMonks, setTotalMonks] = useState(20);
  
  const timeSlots = ["07:00", "08:00", "09:00", "10:00", "11:00"];

  const [formData, setFormData] = useState({
    booking_type_id: '',
    booking_date: '',
    booking_time: '',
    monks_count: '',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    details: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.info('กรุณาเข้าสู่ระบบก่อนจองพิธี');
      navigate('/login');
    }
    fetchBookingTypes();
    fetchMonthlyStatus(new Date());
  }, [isAuthenticated, authLoading]);

  // ดึงข้อมูลความว่างรายเดือนมาโชว์บนปฏิทิน
  const fetchMonthlyStatus = async (date) => {
    try {
      const res = await bookingAPI.getMonthlyStatus(date.getFullYear(), date.getMonth() + 1);
      if (res.data.success) {
        setBusyDates(res.data.busyDates || {});
        setTotalMonks(res.data.max_monks || 20);
      }
    } catch (error) { console.error(error); }
  };

  const fetchBookingTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data);
    } catch (error) { toast.error('โหลดข้อมูลล้มเหลว'); }
  };

  const handleDateSelect = (date) => {
    const dateString = date.toLocaleDateString('sv-SE'); 
    setFormData((prev) => ({ ...prev, booking_date: dateString }));
  };

  // Logic การใส่ Class สีให้ปฏิทิน
  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString('sv-SE');
      const dayData = busyDates[dateString];
      const today = new Date().setHours(0,0,0,0);

      if (date < today) return 'past-date';
      if (!dayData) return 'date-available'; // ไม่มีข้อมูล = ว่าง (เขียว)
      
      const used = dayData.used || 0;
      if (used >= totalMonks) return 'date-full'; // เต็ม (แดง)
      if (used > 0) return 'date-partial'; // มีจองบ้าง (ส้ม)
      return 'date-available';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.booking_date || !formData.booking_time) return toast.error('กรุณาเลือกวันและเวลา');
    
    setLoading(true);
    try {
      await bookingAPI.create({
        ...formData,
        booking_time: `${formData.booking_time}:00`, // Format ให้ตรงกับ DB time
        booking_type_id: parseInt(formData.booking_type_id),
        monks_count: parseInt(formData.monks_count)
      });
      toast.success('ส่งคำขอจองสำเร็จ');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'การจองล้มเหลว');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ฝั่งซ้าย: ปฏิทินแสดงความว่าง */}
            <div className="lg:col-span-7 bg-white rounded-[30px] shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <CalendarIcon className="text-orange-500" />
                <h2 className="text-xl font-bold">ตรวจสอบวันว่าง</h2>
              </div>
              <Calendar 
                onChange={handleDateSelect} 
                tileClassName={getTileClassName}
                onActiveStartDateChange={({ activeStartDate }) => fetchMonthlyStatus(activeStartDate)}
                minDate={new Date()}
              />
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium border-t pt-4">
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-100 border border-green-200 rounded"></span> ว่างมาก</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></span> มีจองแล้ว</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-100 border border-red-200 rounded"></span> เต็ม/งดรับ</div>
              </div>
            </div>

            {/* ฝั่งขวา: ฟอร์มกรอกข้อมูล */}
            <div className="lg:col-span-5 bg-white rounded-[30px] shadow-xl p-8 relative overflow-hidden">
              <div className="h-2 absolute top-0 left-0 w-full bg-orange-500"></div>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* แสดงวันที่เลือก */}
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <p className="text-sm text-orange-800">วันที่จอง:</p>
                  <p className="text-2xl font-black text-orange-600">
                    {formData.booking_date ? new Date(formData.booking_date).toLocaleDateString('th-TH', { dateStyle: 'long' }) : "โปรดเลือกวันที่"}
                  </p>
                </div>

                {/* เลือกช่วงเวลา */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Clock size={16} /> เลือกเวลา
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData({...formData, booking_time: time})}
                        className={`p-2 rounded-xl border-2 transition-all text-sm font-bold ${
                          formData.booking_time === time 
                          ? 'border-orange-500 bg-orange-500 text-white shadow-md' 
                          : 'border-gray-100 bg-gray-50 text-gray-500'
                        }`}
                      >
                        {time} น.
                      </button>
                    ))}
                  </div>
                </div>

                {/* ประเภทพิธี */}
                <select 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-orange-500"
                  onChange={(e) => setFormData({...formData, booking_type_id: e.target.value})}
                  required
                >
                  <option value="">เลือกประเภทพิธี...</option>
                  {bookingTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                {/* จำนวนพระ */}
                <div className="relative">
                  <Users className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input 
                    type="number" placeholder="จำนวนพระ (รูป)" 
                    className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
                    onChange={(e) => setFormData({...formData, monks_count: e.target.value})}
                    required
                  />
                </div>

                {/* เบอร์โทร */}
                <div className="relative">
                  <Phone className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input 
                    type="tel" placeholder="เบอร์โทรศัพท์ติดต่อ" 
                    className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-lg transition-all"
                >
                  {loading ? "กำลังบันทึก..." : "ยืนยันการจองพิธี"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Booking;