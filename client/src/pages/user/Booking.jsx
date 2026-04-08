import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarCustom.css'; // ✅ แก้ Path ให้ดึงจากโฟลเดอร์เดียวกัน
import { Send, Calendar as CalendarIcon } from 'lucide-react';
import Navbar from "../../components/layout/Navbar";

const Booking = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bookingTypes, setBookingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableMonks, setAvailableMonks] = useState(null);
  const [totalMonks, setTotalMonks] = useState(20);
  const [busyDates, setBusyDates] = useState({});
  const [checkingMonks, setCheckingMonks] = useState(false);

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
    fetchMonthlyStatus(new Date()); 
  }, [isAuthenticated]);

  const fetchMonthlyStatus = async (date) => {
    try {
      const res = await bookingAPI.getMonthlyStatus(date.getFullYear(), date.getMonth() + 1);
      if (res.data.success) {
        setBusyDates(res.data.busyDates);
        setTotalMonks(res.data.max_monks || 20);
      }
    } catch (error) { console.error(error); }
  };

  const fetchBookingTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data);
    } catch (error) { toast.error('โหลดข้อมูลไม่สำเร็จ'); }
  };

  // ✅ แก้ไข Syntax บรรทัดที่ 74 ให้ถูกต้อง
  const handleDateSelect = (date) => {
    const dateString = date.toLocaleDateString('sv-SE'); 
    setFormData((prev) => ({ ...prev, booking_date: dateString }));
    handleCheckAvailable(dateString);
  };

  const handleCheckAvailable = async (date) => {
    setCheckingMonks(true);
    try {
      const res = await bookingAPI.checkAvailableMonks(date);
      setAvailableMonks(res.data.available_monks);
    } catch (error) { console.error(error); }
    finally { setCheckingMonks(false); }
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString('sv-SE');
      const used = busyDates[dateString] || 0;
      if (date < new Date().setHours(0,0,0,0)) return 'past-date';
      if (used >= totalMonks) return 'date-full'; 
      if (used > 0) return 'date-partial'; 
      return 'date-available'; 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.booking_date) return toast.error('กรุณาเลือกวันที่');
    setLoading(true);
    try {
      await bookingAPI.create({
        ...formData,
        booking_type_id: parseInt(formData.booking_type_id),
        monks_count: parseInt(formData.monks_count)
      });
      toast.success('จองสำเร็จ');
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
            {/* ปฏิทิน */}
            <div className="lg:col-span-7 bg-white rounded-[40px] shadow-xl p-6">
              <Calendar 
                onChange={handleDateSelect} 
                tileClassName={getTileClassName}
                onActiveStartDateChange={({ activeStartDate }) => fetchMonthlyStatus(activeStartDate)}
              />
            </div>
            {/* ฟอร์ม */}
            <div className="lg:col-span-5 bg-white rounded-[40px] shadow-xl p-8 relative overflow-hidden">
              <div className="h-2 absolute top-0 left-0 w-full bg-linear-to-r from-orange-500 to-amber-500"></div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-orange-50 p-4 rounded-2xl">
                  <p className="text-orange-600 font-black text-xl">{formData.booking_date || "เลือกวันที่"}</p>
                  {availableMonks !== null && <p className="text-sm">ว่าง: {availableMonks} รูป</p>}
                </div>
                <select 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 focus:border-orange-500"
                  onChange={(e) => setFormData({...formData, booking_type_id: e.target.value})}
                  required
                >
                  <option value="">ประเภทพิธี...</option>
                  {bookingTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input 
                  type="number" placeholder="จำนวนพระ" 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                  onChange={(e) => setFormData({...formData, monks_count: e.target.value})}
                  required
                />
                <input 
                  type="tel" placeholder="เบersโทรศัพท์" 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
                <button 
                  disabled={loading || (availableMonks <= 0)}
                  className="w-full py-4 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-bold"
                >
                  {loading ? "กำลังโหลด..." : "ยืนยันการจอง"}
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