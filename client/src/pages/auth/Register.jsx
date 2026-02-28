import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, User, Mail, Lock, 
  ArrowRight, ArrowLeft, CheckCircle2, 
  UserCircle, ShieldCheck, Smartphone,
  Sparkles, Loader2
} from 'lucide-react';

// --- InputField Component ---
const InputField = ({ label, name, type = "text", icon: Icon, placeholder, value, onChange, error }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-orange-500'}`} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className={`w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 rounded-xl md:rounded-2xl outline-none transition-all duration-300 text-sm md:text-base
          ${error 
            ? 'border-red-100 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/5' 
            : 'border-transparent focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5'
          }`}
        placeholder={placeholder}
      />
    </div>
    <AnimatePresence>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-red-500 text-[10px] md:text-[11px] ml-2 font-bold"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.username.length < 3) newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (formData.password.length < 6) newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    if (formData.full_name.length < 2) newErrors.full_name = 'กรุณากรอกชื่อ-นามสกุล';
    if (!formData.phone || formData.phone.length < 9) newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      if (result.success) navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-0 sm:p-4 py-10 md:py-20 font-sans relative overflow-x-hidden">
      
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-orange-400/10 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-amber-200/20 rounded-full blur-[70px] md:blur-[100px]" />
      </div>

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 md:top-6 md:left-6 z-60 group flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white shadow-md border border-orange-50 text-gray-600 rounded-xl md:rounded-2xl hover:border-orange-200 transition-all active:scale-95 text-xs md:text-sm"
      >
        <ArrowLeft className="w-4 h-4 text-orange-500" />
        <span className="font-bold">กลับ</span>
      </Link>

      {/* Main Container */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-6xl bg-white sm:rounded-[40px] shadow-[0_32px_64px_-16px_rgba(234,88,12,0.12)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-screen sm:min-h-[700px] border-none sm:border border-orange-50/50"
      >
        
        {/* Left Panel */}
        <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 relative p-8 md:p-12 flex flex-col justify-center text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at:1px_1px,#fff_1px,transparent_0)] bg-size-[24px_24px] md:bg-size-[32px_32px]"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-lg px-3 py-1.5 rounded-lg mb-6 md:mb-12 border border-white/20">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-200" />
              <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase">Smart Temple System</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 md:mb-8 tracking-tight">
              ร่วมเป็นส่วนหนึ่ง<br/>
              <span className="text-yellow-200 drop-shadow-sm">กับครอบครัวธรรม</span>
            </h1>

            <div className="space-y-3 md:space-y-4">
              {[
                { text: "จองพิธีกรรมออนไลน์ 24 ชม.", icon: CheckCircle2 },
                { text: "ระบบสมาชิกและประวัติส่วนตัว", icon: ShieldCheck },
                { text: "แจ้งเตือนข่าวสารงานบุญ", icon: CheckCircle2 }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/10">
                  <item.icon className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 shrink-0" />
                  <span className="font-medium text-xs md:text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 md:mt-12 text-white/60 hidden md:flex items-center gap-2 uppercase text-[10px] font-bold tracking-widest">
            <ShieldCheck size={16} /> Secured Gateway
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-7/12 bg-white p-6 md:p-10 lg:p-16 flex flex-col justify-center">
          <div className="max-w-xl mx-auto w-full">
            <div className="mb-8 md:mb-10 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">สร้างบัญชีผู้ใช้งาน</h2>
              <p className="text-gray-500 font-medium text-xs md:text-sm">เริ่มต้นประสบการณ์ Smart Temple กับเรา</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {/* Full Name & Phone - Grid on desktop, Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <InputField 
                  label="ชื่อ-นามสกุล" name="full_name" icon={UserCircle} placeholder="นายสมชาย ใจดี" 
                  value={formData.full_name} onChange={handleChange} error={errors.full_name}
                />
                <InputField 
                  label="เบอร์โทรศัพท์" name="phone" icon={Smartphone} placeholder="08XXXXXXXX" 
                  value={formData.phone} onChange={handleChange} error={errors.phone}
                />
              </div>

              <InputField 
                label="ชื่อผู้ใช้งาน (Username)" name="username" icon={User} placeholder="somchai_88" 
                value={formData.username} onChange={handleChange} error={errors.username}
              />
              <InputField 
                label="อีเมล" name="email" type="email" icon={Mail} placeholder="example@gmail.com" 
                value={formData.email} onChange={handleChange} error={errors.email}
              />

              {/* Password & Confirm - Grid on desktop, Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <InputField 
                  label="รหัสผ่าน" name="password" type="password" icon={Lock} placeholder="••••••••" 
                  value={formData.password} onChange={handleChange} error={errors.password}
                />
                <InputField 
                  label="ยืนยันรหัสผ่าน" name="confirmPassword" type="password" icon={ShieldCheck} placeholder="••••••••" 
                  value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-6 md:mt-8 py-3.5 md:py-4 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-lg md:shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-70 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <><span>ยืนยันการสมัครสมาชิก</span><ArrowRight size={20}/></>}
              </motion.button>

              <div className="text-center pt-4 md:pt-6">
                <p className="text-gray-500 font-medium text-xs md:text-sm">
                  มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
                  <Link to="/login" className="text-orange-600 font-bold hover:underline underline-offset-4">
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;