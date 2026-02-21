import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Loader2,
  Eye,
  EyeOff
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

      {/* Back to Home */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 group flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-orange-100 text-gray-600 rounded-full shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-orange-500" />
        <span className="text-sm font-semibold group-hover:text-orange-600 transition-colors">
          กลับหน้าหลัก
        </span>
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-5xl bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(234,88,12,0.15)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[650px] border border-orange-50">
        
        {/* Left Panel */}
        <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 to-amber-500 relative p-12 flex flex-col justify-between text-white">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span className="text-xs font-bold tracking-wider uppercase">
                Smart Temple System
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              ศรัทธา<br/>นำทาง<br/>
              <span className="text-yellow-200">ปัญญา</span>
            </h1>

            <p className="text-orange-50 text-lg font-light leading-relaxed">
              เข้าสู่ระบบเพื่อจัดการข้อมูล จองคิวทำบุญ และติดตามข่าวสารของวัดพระธาตุได้อย่างสะดวกสบาย
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-7/12 bg-white p-8 md:p-16 flex flex-col justify-center">

          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                ยินดีต้อนรับกลับมา
              </h2>
              <p className="text-gray-500">
                กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Username */}
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-gray-700 ml-1 group-focus-within:text-orange-600 transition-colors">
                  ชื่อผู้ใช้ / อีเมล
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 group">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-gray-700 group-focus-within:text-orange-600 transition-colors">
                    รหัสผ่าน
                  </label>
                  <a href="#" className="text-xs font-semibold text-orange-500 hover:underline">
                    ลืมรหัสผ่าน?
                  </a>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                    required
                  />

                  {/* Show Password Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-500"
                  >
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="accent-orange-500"
                  />
                  จดจำฉันไว้ในระบบ
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/25 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
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

            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm">
                ยังไม่มีบัญชีผู้ใช้งาน?{' '}
                <Link to="/register" className="text-orange-600 font-bold hover:underline">
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