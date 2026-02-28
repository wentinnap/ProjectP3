import axios from "axios";

// =========================================================
// 1. CONFIGURATION
// =========================================================

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

const ASSET_BASE =
  import.meta.env.VITE_ASSET_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// =========================================================
// 2. HELPER FUNCTION
// =========================================================

export const toAssetUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) {
    if (url.includes("localhost:5000")) {
      return url.replace("http://localhost:5000", ASSET_BASE);
    }
    return url;
  }
  return `${ASSET_BASE}/${url.replace(/^\//, "")}`;
};

// =========================================================
// 3. INTERCEPTORS
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace("/login");
      }
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
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

// ---------------- NEWS ----------------
export const newsAPI = {
  getAll: (params) => api.get("/news", { params }),
  getById: (id) => api.get(`/news/${id}`),
  getAllAdmin: (params) => api.get("/news/admin/all", { params }),
  create: (data) => api.post("/news/admin", data),
  update: (id, data) => api.put(`/news/admin/${id}`, data),
  toggleVisibility: (id) => api.patch(`/news/admin/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/news/admin/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/news/admin/upload-image", formData);
  },
};

// ---------------- BOOKING ----------------
export const bookingAPI = {
  getTypes: () => api.get("/bookings/types"),
  create: (data) => api.post("/bookings", data),
  getUserBookings: (params) => api.get("/bookings/my-bookings", { params }),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),
  getAllAdmin: (params) => api.get("/bookings/admin/all", { params }),
  updateStatus: (id, data) => api.put(`/bookings/admin/${id}/status`, data),
  deleteBooking: (id) => api.delete(`/bookings/admin/${id}`),
  createType: (data) => api.post("/bookings/types", data),
  updateType: (id, data) => api.put(`/bookings/types/${id}`, data),
  deleteType: (id) => api.delete(`/bookings/types/${id}`),
  
  // 🔥 ดึงสถิติรวม (ข่าว, กิจกรรม, Q&A, การจอง) สำหรับ Dashboard
  getStats: () => api.get("/bookings/admin/stats"),
};

// ---------------- EVENT ----------------
export const eventAPI = {
  getAll: () => api.get("/events"),
  getAllAdmin: () => api.get("/events/admin/all"),
  create: (data) => api.post("/events", data),
  update: (id, data) => api.put(`/events/${id}`, data),
  toggleVisibility: (id) => api.patch(`/events/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/events/${id}`),
};

// ---------------- QNA ----------------
export const qnaAPI = {
  getAll: (params) => api.get("/qna", { params }),
  ask: (data) => api.post("/qna", data),
  getAllAdmin: () => api.get("/qna/admin/all"),
  answer: (id, data) => api.put(`/qna/${id}/answer`, data),
  toggleVisibility: (id) => api.patch(`/qna/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/qna/${id}`),
};

// ---------------- ALBUM ----------------
export const albumAPI = {
  getAllUser: () => api.get("/albums/user"),
  getAllAdmin: () => api.get("/albums/admin"),
  getPhotos: (id) => api.get(`/albums/${id}/photos`),
  create: (formData) => api.post("/albums", formData),
  update: (id, formData) => api.put(`/albums/${id}`, formData),
  deletePhoto: (photoId) => api.delete(`/albums/photo/${photoId}`),
  toggleHide: (id, isHidden) => api.patch(`/albums/${id}/hide`, { is_hidden: isHidden }),
  delete: (id) => api.delete(`/albums/${id}`),
};

// ---------------- NOTIFICATION ----------------
export const notificationAPI = {
  async getSummary() {
    try {
      const response = await api.get('/notifications/summary'); 
      return {
        unreadCount: response.data.unreadCount || 0,
        items: response.data.items || []
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return { unreadCount: 0, items: [] };
    }
  }
};

// ---------------- ANALYTICS ----------------
export const analyticsAPI = {
  getOverview: (params) => api.get("/analytics", { params }),

  getTopPages: (params) =>
    api.get("/analytics/top-pages", { params }),

  getDailyStats: (params) =>
    api.get("/analytics/daily", { params }),

  getByCountry: (params) =>
    api.get("/analytics/countries", { params }),

  getByDevice: (params) =>
    api.get("/analytics/devices", { params }),
};

export default api;