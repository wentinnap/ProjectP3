import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, User, Phone, FileText, 
  Send, Sparkles, ChevronDown, CheckCircle2, 
  AlertCircle, X, Users, Info 
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

  const [formData, setFormData] = useState({
    booking_type_id: '',
    booking_date: '',
    monks_count: '', 
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    details: '',
  });

  const MAX_DETAILS = 500;

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('กรุณาเข้าสู่ระบบก่อนจองพิธี');
      navigate('/login');
      return;
    }
    fetchBookingTypes();
  }, [isAuthenticated, navigate]);

  // ฟังก์ชันเช็คพระว่าง (รายวัน)
  const handleCheckAvailable = async (date) => {
    if (!date) return;
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

  const fetchBookingTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'details' && value.length > MAX_DETAILS) return;

    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    if (name === 'booking_date') {
      handleCheckAvailable(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.monks_count || parseInt(formData.monks_count) <= 0) {
        toast.error('กรุณาระบุจำนวนพระที่นิมนต์');
        return;
    }

    if (availableMonks !== null && parseInt(formData.monks_count) > availableMonks) {
        toast.error(`ขออภัย วันที่เลือกมีพระว่างเหลือเพียง ${availableMonks} รูป`);
        return;
    }

    setLoading(true);
    try {
      await bookingAPI.create({
        ...formData,
        booking_type_id: parseInt(formData.booking_type_id),
        monks_count: parseInt(formData.monks_count)
      });
      toast.success('จองพิธีสำเร็จ รอการตอบรับจากเจ้าหน้าที่');
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
      <div className="min-h-screen bg-[#FDFBF7] font-sans pb-20 pt-28 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-amber-100/30 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-gray-900 mb-2">จองพิธีนิมนต์พระ</h1>
                <p className="text-gray-500 font-medium">ระบุวันที่และรายละเอียดเพื่อตรวจสอบคิวพระว่าง</p>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl border border-orange-50 overflow-hidden">
              <div className="h-2 bg-linear-to-r from-orange-500 to-amber-500"></div>

              <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                
                {/* ส่วนที่ 1: กำหนดการ */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white"><Calendar size={20} /></div>
                        <h3 className="text-xl font-black text-gray-800">เลือกวันที่และประเภทพิธี</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-bold text-gray-700">ประเภทพิธี</label>
                            <select
                                name="booking_type_id"
                                value={formData.booking_type_id}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none font-bold"
                                required
                            >
                                <option value="">เลือกประเภทพิธี...</option>
                                {bookingTypes.map((type) => (
                                  <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">วันที่ต้องการ</label>
                            <input
                                type="date"
                                name="booking_date"
                                value={formData.booking_date}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 font-bold"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">จำนวนพระ (รูป)</label>
                            <input
                                type="number"
                                name="monks_count"
                                value={formData.monks_count}
                                onChange={handleChange}
                                min="1"
                                placeholder="ระบุจำนวนพระ..."
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 font-bold"
                                required
                            />
                        </div>
                    </div>

                    {/* Status Monitor */}
                    <AnimatePresence>
                        {formData.booking_date && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                                <div className={`p-5 rounded-3xl border-2 ${availableMonks > 0 ? 'bg-white border-green-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2 font-black text-gray-800">
                                            {checkingMonks ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent animate-spin rounded-full" /> : <Info size={18} className="text-orange-500" />}
                                            {checkingMonks ? "กำลังตรวจสอบ..." : `สถานะวันที่ ${formData.booking_date}`}
                                        </div>
                                        {!checkingMonks && (
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${availableMonks > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {availableMonks > 0 ? `ว่าง ${availableMonks} รูป` : 'เต็มแล้ว'}
                                            </span>
                                        )}
                                    </div>
                                    {!checkingMonks && (
                                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${availableMonks > 5 ? 'bg-green-500' : 'bg-orange-500'}`} 
                                                style={{ width: `${(availableMonks / totalMonks) * 100}%` }} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* ส่วนที่ 2: ผู้ติดต่อ */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white"><User size={20} /></div>
                        <h3 className="text-xl font-black text-gray-800">ข้อมูลผู้ติดต่อและสถานที่</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="full_name"
                            placeholder="ชื่อ-นามสกุล"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 font-bold"
                            required
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="เบอร์โทรศัพท์"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 font-bold"
                            required
                        />
                    </div>
                    <textarea
                        name="details"
                        placeholder="รายละเอียดเพิ่มเติม เช่น เวลาเริ่มงาน, สถานที่จัดงาน..."
                        value={formData.details}
                        onChange={handleChange}
                        rows="4"
                        className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-3xl focus:border-orange-500 font-medium resize-none"
                    ></textarea>
                </section>

                <div className="pt-6 flex flex-col md:flex-row gap-4">
                    <Link to="/" className="flex-1 py-4 text-center font-bold text-gray-400 hover:text-gray-600 transition-colors">ย้อนกลับ</Link>
                    <button
                        type="submit"
                        disabled={loading || availableMonks <= 0}
                        className="flex-2 py-4 px-10 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-black shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? "กำลังดำเนินการ..." : "ยืนยันการจองพิธี"}
                        <Send size={18} />
                    </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Booking;