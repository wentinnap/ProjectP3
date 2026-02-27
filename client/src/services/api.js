import axios from "axios";

// =========================================================
// 1. CONFIGURATION
// =========================================================

// 🔥 ใช้ ENV ก่อนเสมอ ถ้าไม่มีค่อย fallback
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

const ASSET_BASE =
  import.meta.env.VITE_ASSET_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // กันปัญหา cookie ใน production
});

// =========================================================
// 2. HELPER FUNCTION
// =========================================================

export const toAssetUrl = (url) => {
  if (!url) return "";

  // ถ้าเป็น full url อยู่แล้ว
  if (/^https?:\/\//i.test(url)) {
    // ถ้า database เก็บ localhost มา
    if (url.includes("localhost:5000")) {
      return url.replace("http://localhost:5000", ASSET_BASE);
    }
    return url;
  }

  // กัน double slash
  return `${ASSET_BASE}/${url.replace(/^\//, "")}`;
};

// =========================================================
// 3. INTERCEPTORS
// =========================================================

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔥 สำคัญมาก: อย่าตั้ง Content-Type เองถ้าเป็น FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // ❌ ถ้าอยู่หน้า login/register ไม่ต้อง redirect
      if (currentPath === "/login" || currentPath === "/register") {
        return Promise.reject(error);
      }

      // ✅ Logout กรณี token หมดอายุ
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

// =========================================================
// 4. API METHODS
// =========================================================

// ---------------- AUTH ----------------
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data), // data คือ { email }
  resetPassword: (data) => api.post("/auth/reset-password", data),   // data คือ { token, password }
};

// ---------------- NEWS ----------------
export const newsAPI = {
  getAll: (params) => api.get("/news", { params }),
  getById: (id) => api.get(`/news/${id}`),

  getAllAdmin: (params) => api.get("/news/admin/all", { params }),
  create: (data) => api.post("/news/admin", data),
  update: (id, data) => api.put(`/news/admin/${id}`, data),
  toggleVisibility: (id) =>
    api.patch(`/news/admin/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/news/admin/${id}`),

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return api.post("/news/admin/upload-image", formData);
  },
};

// ---------------- BOOKING ----------------
// ---------------- BOOKING ----------------
export const bookingAPI = {
  // Public & User
  getTypes: () => api.get("/bookings/types"),
  create: (data) => api.post("/bookings", data),
  getUserBookings: (params) => api.get("/bookings/my-bookings", { params }),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),

  // Admin: Management
  getAllAdmin: (params) => api.get("/bookings/admin/all", { params }),
  updateStatus: (id, data) => api.put(`/bookings/admin/${id}/status`, data),
  getStats: () => api.get("/bookings/admin/stats"),
  
  // ✅ เพิ่มใหม่: ลบรายการจอง (Admin)
  deleteBooking: (id) => api.delete(`/bookings/admin/${id}`),

  // ✅ เพิ่มใหม่: จัดการประเภทพิธี (Admin Booking Types)
  createType: (data) => api.post("/bookings/types", data),
  deleteType: (id) => api.delete(`/bookings/types/${id}`),
};

// ---------------- EVENT ----------------
export const eventAPI = {
  getAll: () => api.get("/events"),

  getAllAdmin: () => api.get("/events/admin/all"),
  create: (data) => api.post("/events", data),
  update: (id, data) => api.put(`/events/${id}`, data),
  toggleVisibility: (id) =>
    api.patch(`/events/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/events/${id}`),
};

// ---------------- QNA ----------------
export const qnaAPI = {
  getAll: (params) => api.get("/qna", { params }),
  ask: (data) => api.post("/qna", data),

  getAllAdmin: () => api.get("/qna/admin/all"),
  answer: (id, data) =>
    api.put(`/qna/${id}/answer`, data),
  toggleVisibility: (id) =>
    api.patch(`/qna/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/qna/${id}`),
};

// ---------------- ALBUM ----------------
// ---------------- ALBUM ----------------
export const albumAPI = {
  getAllUser: () => api.get("/albums/user"),
  getAllAdmin: () => api.get("/albums/admin"),
  getPhotos: (id) => api.get(`/albums/${id}/photos`),

  create: (formData) => api.post("/albums", formData),

  // ✅ เพิ่มใหม่: สำหรับแก้ไขชื่ออัลบั้ม หรืออัปโหลดรูปเพิ่มเข้าไป (formData)
  update: (id, formData) => api.put(`/albums/${id}`, formData),

  // ✅ เพิ่มใหม่: สำหรับลบรูปภาพเพียงรูปเดียวโดยใช้ ID ของรูปนั้น
  deletePhoto: (photoId) => api.delete(`/albums/photo/${photoId}`),

  toggleHide: (id, isHidden) =>
    api.patch(`/albums/${id}/hide`, { is_hidden: isHidden }),
  delete: (id) => api.delete(`/albums/${id}`),
};

// ---------------- NOTIFICATION ----------------
// ---------------- NOTIFICATION API ----------------
// ---------------- NOTIFICATION ----------------
export const notificationAPI = {
  // ฟังก์ชันช่วยสกัด Array เพื่อกันพัง
  extractArray(res) {
    // เช็ก res.data.data (สำหรับ pagination) หรือ res.data (สำหรับ array ปกติ)
    const data = res?.data?.data || res?.data || [];
    return Array.isArray(data) ? data : [];
  },

  async getUserSummary() {
    try {
      const [newsRes, bookingRes] = await Promise.all([
        newsAPI.getAll({ limit: 5 }).catch(() => ({ data: [] })),
        bookingAPI.getUserBookings().catch(() => ({ data: [] })),
      ]);

      const rawNews = this.extractArray(newsRes);
      const rawBookings = this.extractArray(bookingRes);

      // 1️⃣ NEWS - ข่าวสาร
      const newsItems = rawNews.map((n) => ({
        id: `user-news-${n.id || n._id}`,
        type: "news",
        title: "ประกาศจากทางวัด",
        message: n.title || "มีข่าวสารใหม่",
        time_ago: n.created_at || n.createdAt || null,
        link: `/news/${n.id || n._id}`,
      }));

      // 2️⃣ BOOKING - สถานะการจอง
      const bookingItems = rawBookings.map((b) => {
        const status = (b.status || "").toLowerCase();
        let statusText = "รอตรวจสอบ";
        if (status === "approved") statusText = "อนุมัติแล้ว";
        if (status === "rejected") statusText = "ปฏิเสธแล้ว";
        if (status === "cancelled") statusText = "ยกเลิกแล้ว";

        return {
          id: `user-bk-${b.id || b._id}`,
          type: "booking_status",
          title: "อัปเดตสถานะการจอง",
          message: `${b.booking_type_name || 'รายการของคุณ'}ได้รับการ ${statusText}`,
          time_ago: b.updated_at || b.created_at || null,
          link: "/profile",
        };
      });

      const combined = [...newsItems, ...bookingItems].sort(
        (a, b) => new Date(b.time_ago || 0) - new Date(a.time_ago || 0)
      );

      return { unreadCount: combined.length, items: combined };
    } catch (error) {
      console.error("User Notification Error:", error);
      return { unreadCount: 0, items: [] };
    }
  },

  async getAdminSummary() {
    try {
      const [bookingRes, qnaRes] = await Promise.all([
        bookingAPI.getAllAdmin().catch(() => ({ data: [] })),
        qnaAPI.getAllAdmin().catch(() => ({ data: [] })),
      ]);

      const rawBookings = this.extractArray(bookingRes);
      const rawQna = this.extractArray(qnaRes);

      const bookingItems = rawBookings
        .filter((b) => (b.status || "").toLowerCase() === "pending")
        .map((b) => ({
          id: `admin-bk-${b.id || b._id}`,
          type: "new_booking",
          title: "มีคำขอจองใหม่",
          message: `มีรายการจองใหม่จากคุณ ${b.user_name || 'ผู้ใช้'}`,
          time_ago: b.created_at || b.createdAt,
          link: "/admin/bookings",
        }));

      const qnaItems = rawQna
        .filter((q) => !q.answer)
        .map((q) => ({
          id: `admin-qna-${q.id || q._id}`,
          type: "qna",
          title: "มีคำถามใหม่",
          message: q.question || "มีคำถามใหม่รอการตอบ",
          time_ago: q.created_at || q.createdAt,
          link: "/admin/qna",
        }));

      const combined = [...bookingItems, ...qnaItems].sort(
        (a, b) => new Date(b.time_ago || 0) - new Date(a.time_ago || 0)
      );

      return { unreadCount: combined.length, items: combined };
    } catch (error) {
      console.error("Admin Notification Error:", error);
      return { unreadCount: 0, items: [] };
    }
  },
};
export default api;