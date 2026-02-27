import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { 
  Lock, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError("รหัสผ่านไม่ตรงกัน");
    if (form.password.length < 6) return setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");

    setLoading(true);
    setError("");

    try {
      const res = await authAPI.resetPassword({ token, password: form.password });
      if (res.data.success) {
        toast.success("เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบใหม่");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "ลิงก์หมดอายุหรือข้อมูลไม่ถูกต้อง กรุณาลองขอใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-green-100/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-orange-100/20 rounded-full blur-[90px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(34,197,94,0.1)] border border-green-50 overflow-hidden">
          
          <div className="h-2 bg-linear-to-r from-green-500 to-emerald-500"></div>

          <div className="p-10 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-[30px] mb-6 shadow-inner text-green-600">
                <ShieldCheck size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">ตั้งรหัสผ่านใหม่</h2>
              <p className="text-gray-500 mt-3 font-medium">
                เพื่อความปลอดภัย กรุณาระบุรหัสผ่านใหม่ที่คาดเดาได้ยาก
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">รหัสผ่านใหม่</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <Lock size={18} className="text-gray-400 group-focus-within:text-green-600" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-500 transition-all font-medium text-gray-800"
                    placeholder="ระบุรหัสผ่านใหม่"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">ยืนยันรหัสผ่านอีกครั้ง</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <CheckCircle2 size={18} className="text-gray-400 group-focus-within:text-green-600" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-500 transition-all font-medium text-gray-800"
                    placeholder="ระบุรหัสผ่านอีกครั้ง"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold"
                  >
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>บันทึกรหัสผ่านใหม่</span>
                    <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center border-t border-gray-50 pt-8">
              <p className="text-gray-400 text-sm font-medium">
                พบปัญหาในการใช้งาน? <button className="text-green-600 font-bold hover:underline">ติดต่อเรา</button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;