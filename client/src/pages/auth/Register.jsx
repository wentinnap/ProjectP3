import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, User, Mail, Lock, Phone, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    if (formData.full_name.length < 2) {
      newErrors.full_name = 'กรุณากรอกชื่อ-นามสกุล';
    }

    // เพิ่มการตรวจสอบเบอร์โทรศัพท์ (ถ้าต้องการให้เป็นฟิลด์บังคับ)
    if (!formData.phone || formData.phone.length < 9) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Decor (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-amber-200/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-6xl bg-white rounded-4xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[700px]">
        
        {/* Left Side: Decorative Panel */}
        <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 text-white relative p-12 flex flex-col justify-between overflow-hidden order-1 md:order-1">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-0 w-40 h-40 bg-yellow-300 opacity-20 rounded-full blur-2xl -translate-x-1/2"></div>

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6">
                    <UserPlus className="w-4 h-4 text-yellow-200" />
                    <span className="text-sm font-medium tracking-wide">สร้างบัญชีผู้ใช้งาน</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-sm">
                    ร่วมเป็นส่วนหนึ่ง<br/>กับวัดกำแพง
                </h1>
                <p className="text-orange-100 text-lg font-light leading-relaxed mb-8">
                    สมัครสมาชิกเพื่อเริ่มต้นจองพิธีกรรมทางศาสนา และติดตามข่าวสารกิจกรรมบุญต่างๆ ได้สะดวกรวดเร็ว
                </p>
                
                <div className="space-y-4 hidden lg:block">
                    {[
                        "จองพิธีกรรมออนไลน์ได้ตลอด 24 ชม.",
                        "ติดตามสถานะการจองได้ทันที",
                        "รับการแจ้งเตือนข่าวสารและกิจกรรม"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-orange-50 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                            <CheckCircle2 className="w-5 h-5 text-green-300 shrink-0" />
                            <span className="text-sm font-medium">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 mt-auto pt-8 text-center md:text-left">
                <p className="text-sm text-orange-200 opacity-80">
                    © 2024 วัดกำแพง Smart Temple System
                </p>
            </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full md:w-7/12 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-2 overflow-y-auto max-h-[90vh] md:max-h-full">
            
            <div className="max-w-lg mx-auto w-full">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">สมัครสมาชิกใหม่</h2>
                    <p className="text-gray-500">กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานของคุณ</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">
                                ชื่อผู้ใช้ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Username"
                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium ${errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
                                    required
                                />
                            </div>
                            {errors.username && <p className="text-xs text-red-500 ml-1">{errors.username}</p>}
                        </div>

                        {/* Full Name */}
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
                                    placeholder="ชื่อจริง นามสกุล"
                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium ${errors.full_name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
                                    required
                                />
                            </div>
                            {errors.full_name && <p className="text-xs text-red-500 ml-1">{errors.full_name}</p>}
                        </div>
                    </div>

                    {/* Email - ดอกจันถูกเอาออกแล้ว */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                            อีเมล
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
                                required
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
                    </div>

                    {/* Phone - เพิ่มดอกจันและตรวจสอบ Error */}
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
                                placeholder="08x-xxx-xxxx"
                                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
                                required
                            />
                        </div>
                        {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">
                                รหัสผ่าน <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
                                    required
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">
                                ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
                                    required
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>สร้างบัญชีผู้ใช้งาน</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-gray-500 text-sm">
                            มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
                            <Link to="/login" className="text-orange-600 font-bold hover:underline">
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