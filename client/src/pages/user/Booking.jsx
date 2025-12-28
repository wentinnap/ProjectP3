import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Calendar, Clock, User, Phone, FileText, Send, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';
import Navbar from "../../components/layout/Navbar";

const Booking = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bookingTypes, setBookingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    booking_type_id: '',
    booking_date: '',
    booking_time: '',
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

  const fetchBookingTypes = async () => {
    try {
      const response = await bookingAPI.getTypes();
      setBookingTypes(response.data.data);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.booking_type_id || !formData.booking_date || !formData.booking_time) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);

    try {
      await bookingAPI.create({
        ...formData,
        booking_type_id: parseInt(formData.booking_type_id),
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 font-sans pb-20 pt-28">
        
        {/* Header Background */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-linear-to-b from-orange-100/50 to-transparent pointer-events-none z-0"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-orange-100 px-4 py-1.5 rounded-full mb-4 shadow-sm">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-gray-600">จองคิวออนไลน์</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 drop-shadow-sm">
                    จองพิธีทางศาสนา
                </h1>
                <p className="text-gray-500 text-lg font-light">
                    กรุณากรอกข้อมูลให้ครบถ้วน เจ้าหน้าที่จะตรวจสอบและยืนยันการจองภายใน 24 ชั่วโมง
                </p>
            </div>

            {/* Booking Form Card */}
            <div className="bg-white rounded-4xl shadow-xl shadow-orange-500/5 border border-white/60 p-8 md:p-12 relative overflow-hidden">
              
              {/* Decorative Top Border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500"></div>

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: พิธีและเวลา */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <Sparkles size={16} />
                        </div>
                        เลือกพิธีและเวลา
                    </h3>

                    {/* Booking Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                            ประเภทพิธี <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Sparkles className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                name="booking_type_id"
                                value={formData.booking_type_id}
                                onChange={handleChange}
                                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none appearance-none cursor-pointer font-medium text-gray-800"
                                required
                            >
                                <option value="">-- กรุณาเลือกประเภทพิธี --</option>
                                {bookingTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name} (ใช้เวลาประมาณ {type.duration_minutes} นาที)
                                </option>
                                ))}
                            </select>
                        </div>
                        {formData.booking_type_id && (
                            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 mt-3 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                                <div className="mt-0.5"><Sparkles size={16} className="text-orange-500" /></div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    <span className="font-bold text-orange-700 block mb-1">รายละเอียดพิธี:</span>
                                    {bookingTypes.find((t) => t.id === parseInt(formData.booking_type_id))?.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Date and Time */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">
                                วันที่ต้องการจอง <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    name="booking_date"
                                    value={formData.booking_date}
                                    onChange={handleChange}
                                    min={getMinDate()}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium cursor-pointer"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">
                                เวลา <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Clock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="time"
                                    name="booking_time"
                                    value={formData.booking_time}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium cursor-pointer"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: ข้อมูลผู้จอง */}
                <div className="space-y-6 pt-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <User size={16} />
                        </div>
                        ข้อมูลผู้ติดต่อ
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">
                                ชื่อ-นามสกุล <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium"
                                    placeholder="ชื่อผู้จอง"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">
                                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium"
                                    placeholder="เบอร์โทรติดต่อกลับ"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                            รายละเอียดเพิ่มเติม (ถ้ามี)
                        </label>
                        <div className="relative group">
                            <div className="absolute top-3.5 left-4 pointer-events-none">
                                <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <textarea
                                name="details"
                                value={formData.details}
                                onChange={handleChange}
                                rows="4"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium resize-none"
                                placeholder="เช่น จำนวนผู้เข้าร่วม, สิ่งที่ต้องเตรียมมาเอง, หรือข้อสงสัยเพิ่มเติม"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Notice & Buttons */}
                <div className="pt-6 border-t border-gray-100">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex gap-3 items-start">
                        <div className="mt-0.5 text-blue-500">
                             <CheckCircle2 size={18} />
                        </div>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            <strong>หมายเหตุ:</strong> หลังจากส่งคำขอแล้ว เจ้าหน้าที่จะตรวจสอบคิวว่างและติดต่อกลับเพื่อยืนยันภายใน 24 ชั่วโมง 
                            ท่านสามารถตรวจสอบสถานะการจองได้ที่เมนู "โปรไฟล์"
                        </p>
                    </div>

                    <div className="flex flex-col-reverse md:flex-row justify-end gap-4">
                        <Link 
                            to="/" 
                            className="px-8 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-800 transition-all text-center"
                        >
                            ยกเลิก
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-3.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send size={20} />
                                    <span>ยืนยันการจอง</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Booking;