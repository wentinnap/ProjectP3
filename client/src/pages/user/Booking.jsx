import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, User, Phone, FileText, 
  Send, Sparkles, ChevronDown, CheckCircle2, 
  Info, AlertCircle, X, Users // เพิ่ม Users icon
} from 'lucide-react';
import Navbar from "../../components/layout/Navbar";

const Booking = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bookingTypes, setBookingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ✅ เพิ่ม State สำหรับเช็คพระว่าง
  const [availableMonks, setAvailableMonks] = useState(null);
  const [checkingMonks, setCheckingMonks] = useState(false);

  const [formData, setFormData] = useState({
    booking_type_id: '',
    booking_date: '',
    booking_time: '',
    monks_count: '', // ✅ เพิ่มฟิลด์จำนวนพระ
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

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name,
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // ✅ ฟังก์ชันเช็คจำนวนพระว่าง
  const handleCheckAvailable = async (date, time) => {
    if (!date || !time) return;
    setCheckingMonks(true);
    try {
      const response = await bookingAPI.checkAvailableMonks(date, time);
      setAvailableMonks(response.data.available_monks);
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

    // ✅ ถ้าเปลี่ยนวันที่หรือเวลา ให้เช็คพระว่างใหม่ทันที
    if (name === 'booking_date' || name === 'booking_time') {
      handleCheckAvailable(newFormData.booking_date, newFormData.booking_time);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validation เพิ่มเติม
    if (!formData.monks_count || parseInt(formData.monks_count) <= 0) {
        toast.error('กรุณาระบุจำนวนพระที่นิมนต์');
        return;
    }

    if (availableMonks !== null && parseInt(formData.monks_count) > availableMonks) {
        toast.error(`ขออภัย ในเวลานี้มีพระว่างเพียง ${availableMonks} รูปเท่านั้น`);
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
      const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการจองพิธี';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFBF7] font-sans pb-20 pt-28 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-amber-100/30 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            
            <div className="text-center mb-12">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full mb-6">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-black tracking-widest text-orange-600 uppercase">Online Booking System</span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">จองพิธีทางศาสนา</h1>
            </div>

            <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(234,88,12,0.1)] border border-orange-50 overflow-hidden">
              <div className="h-2 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500"></div>

              <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                
                {/* ส่วนที่ 1: รายละเอียดพิธี */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">เลือกพิธีและกำหนดการ</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">ประเภทพิธี</label>
                            <div className="relative group">
                                <select
                                    name="booking_type_id"
                                    value={formData.booking_type_id}
                                    onChange={handleChange}
                                    className="w-full pl-5 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all outline-none appearance-none cursor-pointer font-bold text-gray-800"
                                    required
                                >
                                    <option value="">เลือกพิธีที่ต้องการ...</option>
                                    {bookingTypes.map((type) => (
                                      <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">วันที่ต้องการ</label>
                                <input
                                    type="date"
                                    name="booking_date"
                                    value={formData.booking_date}
                                    onChange={handleChange}
                                    min={getMinDate()}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">เวลาโดยประมาณ</label>
                                <input
                                    type="time"
                                    name="booking_time"
                                    value={formData.booking_time}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all font-bold"
                                    required
                                />
                            </div>
                        </div>

                        {/* ✅ [เพิ่มใหม่] ส่วนเลือกจำนวนพระ + เช็คสถานะว่าง */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                    <Users size={16} className="text-orange-500" />
                                    จำนวนพระที่ต้องการนิมนต์ (รูป)
                                </label>
                                <input
                                    type="number"
                                    name="monks_count"
                                    value={formData.monks_count}
                                    onChange={handleChange}
                                    min="1"
                                    max={availableMonks || 9}
                                    placeholder={availableMonks ? `ระบุจำนวน (ว่าง ${availableMonks} รูป)` : "ระบุจำนวนพระ"}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all font-bold"
                                    required
                                />
                            </div>

                            {/* แสดงสถานะจำนวนพระว่างแบบเรียลไทม์ */}
                            <AnimatePresence>
                                {(formData.booking_date && formData.booking_time) && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-2xl border flex items-center gap-3 ${
                                            availableMonks > 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                                        }`}
                                    >
                                        {checkingMonks ? (
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                        ) : availableMonks > 0 ? (
                                            <CheckCircle2 size={18} />
                                        ) : (
                                            <AlertCircle size={18} />
                                        )}
                                        <span className="text-sm font-bold">
                                            {checkingMonks ? "กำลังตรวจสอบคิวพระ..." : 
                                             availableMonks > 0 ? `ช่วงเวลานี้มีพระว่าง ${availableMonks} รูป` : 
                                             "ขออภัย ช่วงเวลานี้พระไม่ว่างแล้ว"}
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* ส่วนที่ 2: ข้อมูลผู้ติดต่อ */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                            <User size={20} />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">ข้อมูลผู้ติดต่อ</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">ชื่อ-นามสกุล</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all font-bold"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end ml-1">
                            <label className="text-sm font-bold text-gray-700">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                            <span className="text-[11px] font-bold text-gray-400">{formData.details.length} / {MAX_DETAILS}</span>
                        </div>
                        <textarea
                            name="details"
                            value={formData.details}
                            onChange={handleChange}
                            rows="4"
                            className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-orange-500 transition-all outline-none font-medium resize-none"
                            placeholder="เช่น สถานที่จัดงาน หรือรายละเอียดอื่นๆ..."
                        ></textarea>
                    </div>
                </section>

                <div className="pt-6 border-t border-gray-50 flex flex-col-reverse md:flex-row gap-4">
                    <Link to="/" className="flex-1 py-4 px-6 rounded-2xl text-center font-bold text-gray-500 hover:bg-gray-100 transition-colors">ยกเลิก</Link>
                    <button
                        type="submit"
                        disabled={loading || availableMonks === 0}
                        className="flex-2 py-4 px-8 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : (
                            <>
                                <span>ยืนยันข้อมูลการจอง</span>
                                <Send size={20} />
                            </>
                        )}
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