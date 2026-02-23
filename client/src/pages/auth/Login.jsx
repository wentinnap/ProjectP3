import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck
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
    if (error) setError(''); // ล้าง error เมื่อผู้ใช้เริ่มพิมพ์ใหม่
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 z-50 group flex items-center gap-2.5 px-6 py-3 bg-white/70 backdrop-blur-md border border-orange-100 text-gray-600 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-orange-500" />
        <span className="text-sm font-bold group-hover:text-orange-600">กลับหน้าหลัก</span>
      </Link>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(234,88,12,0.12)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[680px] border border-orange-50/50">
        
        {/* Left Panel - Branding Area */}
        <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 relative p-12 lg:p-16 flex flex-col justify-between text-white overflow-hidden">
          {/* Subtle Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[32px_32px]"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl mb-12 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">Smart Temple System</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-8 tracking-tight">
              ศรัทธา<br/>นำทาง<br/>
              <span className="text-yellow-200 drop-shadow-sm">ปัญญา</span>
            </h1>

            <p className="text-orange-50/90 text-lg font-light leading-relaxed max-w-xs">
              เข้าสู่ระบบเพื่อจัดการข้อมูลส่วนตัว จองคิวทำบุญ และติดตามข่าวสารของทางวัดได้อย่างสะดวกสบาย
            </p>
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
            <div className="mb-12 text-center md:text-left">
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                เข้าสู่ระบบ
              </h2>
              <p className="text-gray-500 font-medium">
                ยินดีต้อนรับกลับมา กรุณากรอกข้อมูลของคุณ
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Error Message with Animation */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

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
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-gray-700">
                    รหัสผ่าน
                  </label>
                  <Link 
                       to="/forgot-password" 
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                        >
                    ลืมรหัสผ่าน?
                  </Link>
                </div>

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
                    <div className="w-5 h-5 bg-gray-100 border-2 border-gray-200 rounded-md peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">จดจำฉันไว้ในระบบ</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>เข้าสู่ระบบ</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-gray-500 font-medium">
                ยังไม่มีบัญชีผู้ใช้งาน?{' '}
                <Link to="/register" className="text-orange-600 font-bold hover:text-orange-700 hover:underline decoration-2 underline-offset-4 transition-all">
                  สมัครสมาชิกใหม่
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;