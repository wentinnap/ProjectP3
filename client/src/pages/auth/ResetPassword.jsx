import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { BsLock, BsShieldCheck } from "react-icons/bs";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
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
        alert("เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบใหม่");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "ลิงก์หมดอายุหรือข้อมูลไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">ตั้งรหัสผ่านใหม่</h2>
        <p className="text-gray-500 text-center mb-8">กรุณากรอกรหัสผ่านใหม่ที่ต้องการใช้งาน</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <BsLock />
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่านใหม่</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <BsShieldCheck />
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? "กำลังบันทึก..." : "ยืนยันรหัสผ่านใหม่"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;