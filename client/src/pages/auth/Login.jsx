import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, Sparkles, ArrowRight, User, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Decor (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] bg-amber-200/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-5xl bg-white rounded-4xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Decorative Panel (Welcome) */}
        <div className="w-full md:w-1/2 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 text-white relative p-12 flex flex-col justify-between overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            {/* Organic Shapes (Like Reference) */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-0 w-40 h-40 bg-yellow-300 opacity-20 rounded-full blur-2xl translate-x-1/2"></div>
            <div className="absolute bottom-0 left-10 w-32 h-32 bg-orange-300 opacity-20 rounded-full blur-xl"></div>

            {/* Content Top */}
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6">
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                    <span className="text-sm font-medium tracking-wide">Smart Temple System</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-sm">
                    ยินดีต้อนรับ<br/>กลับสู่วัดพระธาตุ
                </h1>
                <p className="text-orange-100 text-lg font-light leading-relaxed max-w-sm">
                    ระบบจัดการข้อมูลและจองพิธีกรรมออนไลน์ อำนวยความสะดวกแด่พุทธศาสนิกชนทุกท่าน
                </p>
            </div>

            {/* Content Bottom (Decor) */}
            <div className="relative z-10 mt-12 hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 max-w-xs transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 font-bold">ว</div>
                        <div>
                            <p className="font-bold text-sm">วัดพระธาตุ</p>
                            <p className="text-xs text-orange-100">ศูนย์รวมจิตใจ</p>
                        </div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full w-3/4 mb-2"></div>
                    <div className="h-2 bg-white/20 rounded-full w-1/2"></div>
                </div>
            </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            
            <div className="max-w-md mx-auto w-full">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">เข้าสู่ระบบ</h2>
                    <p className="text-gray-500">กรุณากรอกข้อมูลเพื่อเข้าใช้งานบัญชีของคุณ</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">ชื่อผู้ใช้ หรือ อีเมล</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-bold text-gray-700">รหัสผ่าน</label>
                            <a href="#" className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline">
                                ลืมรหัสผ่าน?
                            </a>
                        </div>
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
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Remember & Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>เข้าสู่ระบบ</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer / Register */}
                <div className="mt-8 text-center space-y-6">
                    <p className="text-gray-500 text-sm">
                        ยังไม่มีบัญชีผู้ใช้งาน?{' '}
                        <Link to="/register" className="text-orange-600 font-bold hover:underline">
                            สมัครสมาชิก
                        </Link>
                    </p>

                    {/* Demo Account (Optional) */}
                    <div className="pt-6 border-t border-gray-100">
                        <div 
                            onClick={() => setFormData({username: 'admin', password: 'password'})}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-lg cursor-pointer transition-colors"
                        >
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-gray-500 font-medium">Click for Demo Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;