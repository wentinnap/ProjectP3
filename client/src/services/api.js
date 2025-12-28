import axios from "axios";

// ยิง API: http://localhost:5000/api
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// เสิร์ฟไฟล์ uploads: http://localhost:5000
const ASSET_BASE = import.meta.env.VITE_ASSET_URL || "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ helper: แปลง /uploads/... ให้เป็น URL เต็ม
export const toAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // url แบบ /uploads/news/xxx.jpg
  return `${ASSET_BASE}${url}`;
};

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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// =====================
// Auth APIs
// =====================
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// =====================
// News APIs
// =====================
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


// =====================
// Booking APIs
// =====================
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

// =====================
// Event APIs
// =====================
export const eventAPI = {
  // public
  getAll: () => api.get("/events"),

  // admin (ถ้าคุณทำ route เหล่านี้แล้ว)
  getAllAdmin: () => api.get("/events/admin/all"),
  create: (data) => api.post("/events", data),
  update: (id, data) => api.put(`/events/${id}`, data),
  toggleVisibility: (id) => api.patch(`/events/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/events/${id}`),
};

// =====================
// QnA APIs
// =====================
export const qnaAPI = {
  // public
  getAll: (params) => api.get("/qna", { params }),
  ask: (data) => api.post("/qna", data),

  // admin (ถ้าคุณทำ route เหล่านี้แล้ว)
  getAllAdmin: () => api.get("/qna/admin/all"),
  answer: (id, data) => api.put(`/qna/${id}/answer`, data),
  toggleVisibility: (id) => api.patch(`/qna/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/qna/${id}`),
};

export default api;
