import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion'; // เพิ่มตัวนี้ (ต้องลง npm install framer-motion)
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
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-orange-400 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-amber-200 rounded-full blur-[100px]"
        />
      </div>

      {/* Back to Home Button */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-8 left-8 z-50"
      >
        <Link 
          to="/" 
          className="group flex items-center gap-2.5 px-6 py-3 bg-white/70 backdrop-blur-md border border-orange-100 text-gray-600 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-orange-500" />
          <span className="text-sm font-bold group-hover:text-orange-600">กลับหน้าหลัก</span>
        </Link>
      </motion.div>

      {/* Main Container */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-5xl bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(234,88,12,0.12)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[680px] border border-orange-50/50"
      >
        
        {/* Left Panel - Branding Area */}
        <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 relative p-12 lg:p-16 flex flex-col justify-between text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[32px_32px]"></div>
          
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl mb-12 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">Smart Temple System</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-5xl lg:text-6xl font-black leading-tight mb-8 tracking-tight"
            >
              ศรัทธา<br/>นำทาง<br/>
              <span className="text-yellow-200 drop-shadow-sm">ปัญญา</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-orange-50/90 text-lg font-light leading-relaxed max-w-xs"
            >
              เข้าสู่ระบบเพื่อจัดการข้อมูลส่วนตัว จองคิวทำบุญ และติดตามข่าวสารของทางวัดได้อย่างสะดวกสบาย
            </motion.p>
          </div>

          <div className="relative z-10">
              <div className="flex items-center gap-3 text-white/60">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-medium tracking-widest uppercase">Secured Gateway</span>
              </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-7/12 bg-white p-10 lg:p-20 flex flex-col justify-center relative">
          
          <div className="max-w-md mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12 text-center md:text-left"
            >
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                เข้าสู่ระบบ
              </h2>
              <p className="text-gray-500 font-medium">
                ยินดีต้อนรับกลับมา กรุณากรอกข้อมูลของคุณ
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Error Message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-medium overflow-hidden"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  ชื่อผู้ใช้งาน / อีเมล
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username or Email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-medium placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  รหัสผ่าน
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-medium placeholder:text-gray-400"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                  </button>
                </div>
                
                {/* Forgot Password Link - Moved here */}
                <div className="flex justify-end pr-1">
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center ml-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 bg-gray-100 border-2 border-gray-200 rounded-lg peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all flex items-center justify-center">
                      <CheckCircle2 className={`w-4 h-4 text-white transition-opacity ${formData.remember ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">จดจำฉันไว้ในระบบ</span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>เข้าสู่ระบบ</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 text-center"
            >
              <p className="text-gray-500 font-medium">
                ยังไม่มีบัญชีผู้ใช้งาน?{' '}
                <Link to="/register" className="text-orange-600 font-bold hover:text-orange-700 hover:underline decoration-2 underline-offset-4 transition-all">
                  สมัครสมาชิกใหม่
                </Link>
              </p>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;