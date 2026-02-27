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
export const notificationAPI = {
  getSummary: async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) return { unreadCount: 0, items: [] };

      if (user.role === 'admin') {
        const [qnaRes, bookingRes] = await Promise.all([
          qnaAPI.getAllAdmin(),
          bookingAPI.getStats()
        ]);
        // ป้องกัน Error ด้วยการเช็ก Array ชั้นแรก
        const qnaData = qnaRes.data?.data || [];
        const qnaPending = Array.isArray(qnaData) ? qnaData.filter(item => !item.answer) : [];
        const bookingCount = bookingRes.data?.data?.pending_count || 0;

        const items = [
          ...qnaPending.map(item => ({
            id: `qna-${item.id}`,
            type: 'qna',
            title: 'คำถามใหม่',
            message: item.question,
            time_ago: item.created_at,
            link: '/admin/qna'
          })),
          ...(bookingCount > 0 ? [{
            id: 'booking-admin',
            type: 'new_booking',
            title: 'มีรายการจองคิว',
            message: `มี ${bookingCount} รายการที่รอคุณตรวจสอบ`,
            time_ago: 'Update: Now',
            link: '/admin/bookings'
          }] : [])
        ];
        return { unreadCount: items.length, items };
      } 
      else {
        // ฝั่ง USER
        const [bookingRes, newsRes] = await Promise.all([
          bookingAPI.getUserBookings(),
          newsAPI.getAll({ limit: 5 })
        ]);

        // 🔥 จุดที่ต้องระวัง: เช็กโครงสร้างข้อมูลให้ชัวร์ก่อน map
        const myBookings = bookingRes.data?.data || bookingRes.data || [];
        const latestNews = newsRes.data?.data || newsRes.data || [];

        const newsItems = Array.isArray(latestNews) ? latestNews.map(news => ({
          id: `news-${news.id}`,
          type: 'news',
          title: 'ข่าวสารใหม่',
          message: news.title,
          time_ago: news.created_at,
          link: `/news/${news.id}`
        })) : [];

        const statusItems = Array.isArray(myBookings) ? myBookings
          .filter(b => b.status !== 'pending')
          .map(b => ({
            id: `status-${b.id}`,
            type: 'booking_status',
            title: 'อัปเดตการจอง',
            message: `รายการ "${b.ceremony_name || 'พิธีการ'}": ${b.status}`,
            time_ago: b.updated_at,
            link: '/profile'
          })) : [];

        const allItems = [...newsItems, ...statusItems];
        return { unreadCount: allItems.length, items: allItems };
      }
    } catch (error) {
      console.error("Noti API Error:", error);
      return { unreadCount: 0, items: [] };
    }
  }
};
export default api;