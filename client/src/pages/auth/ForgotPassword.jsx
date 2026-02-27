import React, { useState } from "react";
import { authAPI } from "../../services/api";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  ArrowLeft, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  KeyRound
} from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await authAPI.forgotPassword({ email });
      if (res.data.success) {
        setStatus({ 
          type: "success", 
          message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบในกล่องขาเข้า" 
        });
        setEmail("");
      }
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || "ไม่พบอีเมลนี้ในระบบ หรือเกิดข้อผิดพลาด" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Decorative Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-amber-100/30 rounded-full blur-[80px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(234,88,12,0.1)] border border-orange-50 overflow-hidden">
          
          {/* Top Accent Bar */}
          <div className="h-2 bg-linear-to-r from-orange-500 to-amber-500"></div>

          <div className="p-10 md:p-12">
            {/* Icon & Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-[30px] mb-6 shadow-inner shadow-orange-200/50 text-orange-500">
                <KeyRound size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">ลืมรหัสผ่าน?</h2>
              <p className="text-gray-500 mt-3 font-medium px-4">
                ไม่ต้องกังวล! เพียงระบุอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">อีเมลของคุณ</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <Mail size={20} className="text-gray-400 group-focus-within:text-orange-500" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all duration-300 font-medium text-gray-800"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Message */}
              <AnimatePresence mode="wait">
                {status.message && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex gap-3 p-4 rounded-2xl text-sm font-bold ${
                      status.type === "success" 
                        ? "bg-green-50 text-green-700 border border-green-100" 
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {status.type === "success" ? <CheckCircle2 size={18} shrink={0} /> : <AlertCircle size={18} shrink={0} />}
                    <p>{status.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer Link */}
            <div className="mt-10 text-center border-t border-gray-50 pt-8">
              <Link 
                to="/login" 
                className="group inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-orange-500" />
                กลับหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;