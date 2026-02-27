import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
     INIT AUTH ON APP START
  =============================== */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await authAPI.getProfile();

        const userData =
          res.data?.data ||
          res.data?.user ||
          res.data;

        if (!userData) throw new Error("No user data");

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Auth Init Error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /* ===============================
     LOGIN
  =============================== */
  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);

      const { user: userData, token } =
        res.data?.data || {};

      if (!token || !userData)
        throw new Error("Invalid login response");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      toast.success("เข้าสู่ระบบสำเร็จ");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "เข้าสู่ระบบไม่สำเร็จ";

      toast.error(message);
      return { success: false };
    }
  };

  /* ===============================
     REGISTER
  =============================== */
  const register = async (data) => {
    try {
      const res = await authAPI.register(data);

      const { user: userData, token } =
        res.data?.data || {};

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      toast.success("สมัครสมาชิกสำเร็จ");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "สมัครสมาชิกไม่สำเร็จ";

      toast.error(message);
      return { success: false };
    }
  };

  /* ===============================
     LOGOUT
  =============================== */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.replace("/login");
  };

  /* ===============================
     UPDATE USER
  =============================== */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};