import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (error) setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-0 sm:p-4 font-sans relative overflow-x-hidden">
      
      {/* Background Decorative Elements - ซ่อนในมือถือขนาดเล็กมากเพื่อประสิทธิภาพ */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-orange-400 rounded-full blur-[80px] md:blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-10%] left-[-5%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-amber-200 rounded-full blur-[70px] md:blur-[100px]"
        />
      </div>

      {/* Back to Home Button - ปรับให้ลอยในมือถือ */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 md:top-8 md:left-8 z-50"
      >
        <Link 
          to="/" 
          className="group flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white/80 backdrop-blur-md border border-orange-100 text-gray-600 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span className="text-xs md:text-sm font-bold">กลับหน้าหลัก</span>
        </Link>
      </motion.div>

      {/* Main Container */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-5xl bg-white sm:rounded-[40px] shadow-[0_32px_64px_-16px_rgba(234,88,12,0.12)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-screen sm:min-h-[680px] border-none sm:border border-orange-50/50"
      >
        
        {/* Left Panel - Branding Area */}
        <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 relative p-8 md:p-12 lg:p-16 flex flex-col justify-center md:justify-between text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[24px_24px] md:bg-size-[32px_32px]"></div>
          
          <div className="relative z-10">
            <motion.div 
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-lg px-3 py-1.5 rounded-lg mb-6 md:mb-12 border border-white/20"
            >
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-200" />
              <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase">Smart Temple System</span>
            </motion.div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 md:mb-8 tracking-tight">
              ศรัทธา<br className="hidden md:block"/>นำทาง<br className="hidden md:block"/>
              <span className="text-yellow-200 drop-shadow-sm ml-2 md:ml-0">ปัญญา</span>
            </h1>

            <p className="text-orange-50/90 text-sm md:text-lg font-light leading-relaxed max-w-xs hidden sm:block">
              เข้าสู่ระบบเพื่อจัดการข้อมูลส่วนตัว จองคิวทำบุญ และติดตามข่าวสารของทางวัดได้อย่างสะดวกสบาย
            </p>
          </div>

          <div className="relative z-10 mt-8 hidden md:flex items-center gap-3 text-white/60">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-medium tracking-widest uppercase">Secured Gateway</span>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-7/12 bg-white p-6 sm:p-10 lg:p-20 flex flex-col justify-center relative grow">
          
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8 md:mb-12 text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 md:mb-4 tracking-tight">
                เข้าสู่ระบบ
              </h2>
              <p className="text-sm md:text-base text-gray-500 font-medium">
                ยินดีต้อนรับกลับมา กรุณากรอกข้อมูลของคุณ
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">

              {/* Error Message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-xs md:text-sm font-medium overflow-hidden"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username Input */}
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                  ชื่อผู้ใช้งาน / อีเมล
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-orange-500" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username or Email"
                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-gray-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none text-sm md:text-base font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                  รหัสผ่าน
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 md:pl-12 pr-12 py-3 md:py-4 bg-gray-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none text-sm md:text-base font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
                <div className="flex justify-end pr-1">
                  <Link to="/forgot-password" size="sm" className="text-[10px] md:text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center ml-1">
                <label className="flex items-center gap-2 md:gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-100 border-2 border-gray-200 rounded-md md:rounded-lg peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all flex items-center justify-center">
                      <CheckCircle2 className={`w-3 h-3 md:w-4 md:h-4 text-white transition-opacity ${formData.remember ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">จดจำฉันไว้ในระบบ</span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 md:py-4 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-lg md:shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                ) : (
                  <>
                    <span>เข้าสู่ระบบ</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 md:mt-12 text-center">
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                ยังไม่มีบัญชีผู้ใช้งาน?{' '}
                <Link to="/register" className="text-orange-600 font-bold hover:text-orange-700 underline underline-offset-4 decoration-2">
                  สมัครสมาชิกใหม่
                </Link>
              </p>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;