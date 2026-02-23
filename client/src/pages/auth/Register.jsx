import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserPlus, User, Mail, Lock, Phone, 
  ArrowRight, CheckCircle2, UserCircle, 
  ShieldCheck, Smartphone 
} from 'lucide-react';

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
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
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    if (result.success) navigate('/');
    setLoading(false);
  };

  // Helper component สำหรับ Input field เพื่อความสะอาดของ Code
  const InputField = ({ label, name, type = "text", icon: Icon, placeholder }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <div className={`relative group transition-all duration-300 ${errors[name] ? 'animate-shake' : ''}`}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className={`w-5 h-5 ${errors[name] ? 'text-red-400' : 'text-gray-400 group-focus-within:text-orange-500'}`} />
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl outline-none transition-all duration-300
            ${errors[name] 
              ? 'border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-transparent focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10'
            }`}
          placeholder={placeholder}
        />
      </div>
      {errors[name] && <p className="text-red-500 text-xs ml-2 font-medium">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-[0_32px_64px_-15px_rgba(234,88,12,0.15)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[750px] border border-orange-50">
        
        {/* Left Panel: Decorative & Info */}
        <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 text-white relative p-12 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[24px_24px]"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-lg border border-white/30 px-4 py-2 rounded-full mb-10">
              <UserPlus className="w-4 h-4 text-yellow-200" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Smart Temple System</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
              ร่วมเป็นส่วนหนึ่ง<br />กับวัดกำแพง
            </h1>
            <p className="text-orange-50/90 text-lg font-light leading-relaxed mb-10 max-w-sm">
              เข้าถึงบริการทางธรรม จองพิธีกรรม และรับข่าวสารงานบุญได้ง่ายๆ เพียงปลายนิ้ว
            </p>

            <div className="space-y-4">
              {[
                { text: "จองพิธีกรรมออนไลน์ 24 ชม.", icon: CheckCircle2 },
                { text: "ระบบสมาชิกและประวัติส่วนตัว", icon: ShieldCheck },
                { text: "แจ้งเตือนข่าวสารงานบุญ", icon: CheckCircle2 }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors group">
                  <item.icon className="w-6 h-6 text-yellow-300 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-12 flex items-center gap-4">
            <div className="h-px bg-white/20 flex-1"></div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">Wat Kampang</span>
            <div className="h-px bg-white/20 flex-1"></div>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="w-full md:w-7/12 bg-white p-8 lg:p-16 flex flex-col justify-center overflow-y-auto custom-scrollbar">
          <div className="max-w-xl mx-auto w-full">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-gray-900 mb-2">สร้างบัญชีผู้ใช้งาน</h2>
              <p className="text-gray-500 font-medium">เริ่มต้นการใช้งานระบบ Smart Temple กับเรา</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Grid Layout สำหรับ Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField 
                  label="ชื่อ-นามสกุล" 
                  name="full_name" 
                  icon={UserCircle} 
                  placeholder="นายสมชาย ใจดี" 
                />
                <InputField 
                  label="เบอร์โทรศัพท์" 
                  name="phone" 
                  icon={Smartphone} 
                  placeholder="08XXXXXXXX" 
                />
              </div>

              <InputField 
                label="ชื่อผู้ใช้งาน (Username)" 
                name="username" 
                icon={User} 
                placeholder="somchai_88" 
              />

              <InputField 
                label="อีเมล" 
                name="email" 
                type="email" 
                icon={Mail} 
                placeholder="example@gmail.com" 
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField 
                  label="รหัสผ่าน" 
                  name="password" 
                  type="password" 
                  icon={Lock} 
                  placeholder="••••••••" 
                />
                <InputField 
                  label="ยืนยันรหัสผ่าน" 
                  name="confirmPassword" 
                  type="password" 
                  icon={ShieldCheck} 
                  placeholder="••••••••" 
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>ยืนยันการสมัครสมาชิก</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-6">
                <p className="text-gray-500 font-medium">
                  มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
                  <Link to="/login" className="text-orange-600 font-bold hover:text-orange-700 hover:underline decoration-2 underline-offset-4 transition-all">
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;