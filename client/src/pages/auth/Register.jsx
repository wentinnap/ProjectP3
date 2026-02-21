import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, User, Mail, Lock, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

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

    if (!formData.phone || formData.phone.length < 9) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans relative overflow-hidden">

      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-6xl bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(234,88,12,0.15)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[700px] border border-orange-50">

        {/* Left Panel */}
        <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 to-amber-500 text-white relative p-12 flex flex-col justify-between overflow-hidden">

          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[20px_20px]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-8 shadow-inner">
              <UserPlus className="w-4 h-4 text-yellow-200" />
              <span className="text-xs font-bold tracking-wider uppercase">
                Smart Temple System
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 drop-shadow-md">
              ร่วมเป็นส่วนหนึ่ง<br />
              กับวัดกำแพง
            </h1>

            <p className="text-orange-50 text-lg font-light leading-relaxed opacity-90 mb-8">
              สมัครสมาชิกเพื่อเริ่มต้นจองพิธีกรรม และติดตามข่าวสารกิจกรรมบุญต่างๆ ได้อย่างสะดวกสบาย
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

          <div className="relative z-10 mt-auto pt-8">
            <div className="flex items-center gap-4 opacity-80">
              <div className="h-px bg-white/30 flex-1"></div>
              <span className="text-sm font-medium tracking-widest uppercase">
                Wat Kampang
              </span>
              <div className="h-px bg-white/30 flex-1"></div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-7/12 bg-white p-8 md:p-16 flex flex-col justify-center overflow-y-auto max-h-[90vh] md:max-h-full">

          <div className="max-w-lg mx-auto w-full">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                สมัครสมาชิกใหม่
              </h2>
              <p className="text-gray-500">
                กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานของคุณ
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* --- FORM CONTENT เดิมของคุณทั้งหมด --- */}
              {/* คุณสามารถคง input ทั้งหมดเดิมได้เลย ไม่ต้องแก้อะไร */}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>สร้างบัญชีผู้ใช้งาน</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center pt-4">
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