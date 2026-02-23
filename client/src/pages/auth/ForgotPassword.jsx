import React, { useState } from "react";
import { authAPI } from "../../services/api";
import { BsEnvelope, BsArrowLeft } from "react-icons/bs";
import { Link } from "react-router-dom";

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
        setStatus({ type: "success", message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว!" });
        setEmail("");
      }
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">ลืมรหัสผ่าน?</h2>
            <p className="text-gray-500 mt-2">ไม่ต้องกังวล! กรอกอีเมลของคุณเพื่อรับลิงก์แก้ไข</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมลผู้ใช้งาน</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <BsEnvelope />
                </span>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {status.message && (
              <div className={`p-4 rounded-xl text-sm ${status.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "กำลังส่งข้อมูล..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-orange-600 inline-flex items-center gap-2 transition">
              <BsArrowLeft /> ย้อนกลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;