import axios from "axios";

// =========================================================
// 1. CONFIGURATION
// =========================================================

// ยิง API: ถ้ามี ENV ให้ใช้ ENV ถ้าไม่มีให้ใช้ localhost
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// เสิร์ฟไฟล์ uploads: ใช้สำหรับดึงรูปภาพ
const ASSET_BASE = import.meta.env.VITE_ASSET_URL || "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// 2. HELPER FUNCTION (จุดสำคัญที่แก้ปัญหา)
// =========================================================

// ✅ helper: แปลง URL รูปภาพให้ถูกต้องเสมอ
export const toAssetUrl = (url) => {
  if (!url) return "";

  // 🔴 FIX: ดักจับ URL ที่ติด localhost มาจาก Database แล้วเปลี่ยนเป็นของจริง
  if (url.includes("localhost:5000")) {
    return url.replace("http://localhost:5000", ASSET_BASE);
  }

  // ถ้าเป็น URL ภายนอกอื่นๆ ที่ถูกต้องอยู่แล้ว (เช่น ลิงก์จาก Google, Facebook) ให้ใช้ได้เลย
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // ถ้ามาแค่ path สั้นๆ (เช่น /uploads/news/xxx.jpg) ให้เอา ASSET_BASE มาต่อ
  return `${ASSET_BASE}${url}`;
};

// =========================================================
// 3. INTERCEPTORS
// =========================================================

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // ✅ ใส่ token ถ้ามี
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // ✅ ถ้าเป็น FormData อย่าบังคับ Content-Type เป็น multipart เอง (ให้ axios ทำ boundary)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// services/api.js

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. ตรวจสอบว่า Error เป็น 401 (Unauthorized) หรือไม่
    if (error.response?.status === 401) {
      
      // 2. เช็กว่าปัจจุบัน User อยู่ที่หน้าไหน
      const currentPath = window.location.pathname;

      // 🚩 เงื่อนไขสำคัญ: ถ้าอยู่ที่หน้า /login หรือ /register 
      // "ห้าม" ทำการ Redirect หรือล้าง LocalStorage
      // เพราะ 401 ในหน้านี้หมายถึง "รหัสผิด" ไม่ใช่ "Token หมดอายุ"
      if (currentPath === "/login" || currentPath === "/register") {
        return Promise.reject(error);
      }

      // 3. ถ้าเป็นหน้าอื่นๆ (เช่น หน้า Admin, Profile) แล้วเจอ 401
      // แสดงว่า Token หมดอายุ หรือไม่มีสิทธิ์จริงๆ ให้ทำการ Logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // ใช้ replace แทน href เพื่อป้องกันการกด Back กลับมา
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);



// =========================================================
// 4. API METHODS
// =========================================================

// --- Auth APIs ---
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// --- News APIs ---
export const newsAPI = {
  // public
  getAll: (params) => api.get("/news", { params }),
  getById: (id) => api.get(`/news/${id}`),

  // admin
  getAllAdmin: (params) => api.get("/news/admin/all", { params }),
  create: (data) => api.post("/news/admin", data),
  update: (id, data) => api.put(`/news/admin/${id}`, data),
  toggleVisibility: (id) => api.patch(`/news/admin/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/news/admin/${id}`),

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return api.post("/news/admin/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// --- Booking APIs ---
export const bookingAPI = {
  getTypes: () => api.get("/bookings/types"),
  create: (data) => api.post("/bookings", data),
  getUserBookings: (params) => api.get("/bookings/my-bookings", { params }),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),

  // admin
  getAllAdmin: (params) => api.get("/bookings/admin/all", { params }),
  updateStatus: (id, data) => api.put(`/bookings/admin/${id}/status`, data),
  getStats: () => api.get("/bookings/admin/stats"),
};

// --- Event APIs ---
export const eventAPI = {
  // public
  getAll: () => api.get("/events"),

  // admin
  getAllAdmin: () => api.get("/events/admin/all"),
  create: (data) => api.post("/events", data),
  update: (id, data) => api.put(`/events/${id}`, data),
  toggleVisibility: (id) => api.patch(`/events/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/events/${id}`),
};

// --- QnA APIs ---
export const qnaAPI = {
  // public
  getAll: (params) => api.get("/qna", { params }),
  ask: (data) => api.post("/qna", data),

  // admin
  getAllAdmin: () => api.get("/qna/admin/all"),
  answer: (id, data) => api.put(`/qna/${id}/answer`, data),
  toggleVisibility: (id) => api.patch(`/qna/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/qna/${id}`),
};

// --- Album APIs ---
export const albumAPI = {
  // Public (สำหรับหน้า User): ดูเฉพาะอัลบั้มที่โชว์ (is_hidden = 0)
  getAllUser: () => api.get("/albums/user"),

  // Admin (สำหรับหน้าจัดการ): ดูอัลบั้มทั้งหมดรวมที่ซ่อนอยู่
  getAllAdmin: () => api.get("/albums/admin"),

  // ดึงรูปภาพทั้งหมดภายในอัลบั้มนั้นๆ (ใช้ทั้ง Admin และ User)
  getPhotos: (id) => api.get(`/albums/${id}/photos`),

  // Admin: สร้างอัลบั้มใหม่ (รับไฟล์ผ่าน FormData)
  create: (formData) => api.post("/albums", formData),

  // Admin: สลับสถานะ ซ่อน/แสดง (isHidden ส่ง 1 หรือ 0)
  toggleHide: (id, isHidden) => api.patch(`/albums/${id}/hide`, { is_hidden: isHidden }),

  // Admin: ลบทั้งอัลบั้ม
  delete: (id) => api.delete(`/albums/${id}`),
};

export default api;
