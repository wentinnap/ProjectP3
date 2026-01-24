import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Sparkles, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Back to Home Button (Floating Top Left) */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 group flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-orange-100 text-gray-600 rounded-full shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-orange-500" />
        <span className="text-sm font-semibold group-hover:text-orange-600 transition-colors">กลับหน้าหลัก</span>
      </Link>

      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-5xl bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(234,88,12,0.15)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[650px] border border-orange-50">
        
        {/* Left Side: Decorative Panel */}
        <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 to-amber-500 relative p-12 flex flex-col justify-between overflow-hidden text-white">
            
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[20px_20px]"></div>
            
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

            {/* Content Top */}
            <div className="relative z-10 mt-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-8 shadow-inner">
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                    <span className="text-xs font-bold tracking-wider uppercase">Smart Temple System</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 drop-shadow-md">
                    ศรัทธา<br/>นำทาง<br/><span className="text-yellow-200">ปัญญา</span>
                </h1>
                <p className="text-orange-50 text-lg font-light leading-relaxed opacity-90">
                    เข้าสู่ระบบเพื่อจัดการข้อมูล จองคิวทำบุญ และติดตามข่าวสารของวัดพระธาตุได้อย่างสะดวกสบาย
                </p>
            </div>

            {/* Content Bottom */}
            <div className="relative z-10">
                <div className="flex items-center gap-4 opacity-80">
                    <div className="h-px bg-white/30 flex-1"></div>
                    <span className="text-sm font-medium tracking-widest uppercase">Wat Phra That</span>
                    <div className="h-px bg-white/30 flex-1"></div>
                </div>
            </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-7/12 bg-white p-8 md:p-16 flex flex-col justify-center relative">
            
            <div className="max-w-md mx-auto w-full">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">ยินดีต้อนรับกลับมา</h2>
                    <p className="text-gray-500">กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Input */}
                    <div className="space-y-2 group">
                        <label className="text-sm font-semibold text-gray-700 ml-1 group-focus-within:text-orange-600 transition-colors">
                            ชื่อผู้ใช้ / อีเมล
                        </label>
                        <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2 group">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-semibold text-gray-700 group-focus-within:text-orange-600 transition-colors">
                                รหัสผ่าน
                            </label>
                            <a href="#" className="text-xs font-semibold text-orange-500 hover:text-orange-600 hover:underline transition-colors">
                                ลืมรหัสผ่าน?
                            </a>
                        </div>
                        <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 group"
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

                {/* Footer */}
                <div className="mt-10 text-center">
                    <p className="text-gray-500 text-sm">
                        ยังไม่มีบัญชีผู้ใช้งาน?{' '}
                        <Link to="/register" className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors">
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
