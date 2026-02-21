import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from "./components/commom/ProtectedRoute";
import AdminLayout from './components/layout/AdminLayout'; // อย่าลืมสร้างไฟล์ Layout ที่ผมให้ไว้ก่อนหน้านี้

// Pages (User)
import Home from './pages/user/Home';
import About from './pages/user/About';
import Donate from './pages/user/Donate';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NewsList from './pages/user/NewsList';
import NewsDetail from './pages/user/NewsDetail';
import Booking from './pages/user/Booking';
import Profile from './pages/user/Profile';
import EventCalendar from "./pages/user/EventCalendar";
import QnA from './pages/user/QnA';
import Gallery from './pages/user/Gallery';
import AlbumDetail from './pages/user/AlbumDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews from './pages/admin/AdminNews';
import AdminBookings from './pages/admin/AdminBookings';
import AdminEvents from './pages/admin/AdminEvents';
import AdminQnA from './pages/admin/AdminQnA';
import AdminAlbums from './pages/admin/AdminAlbums';

const contextClass = {
  success: "bg-white border-l-4 border-green-500 text-gray-800",
  error: "bg-white border-l-4 border-red-500 text-gray-800",
  info: "bg-white border-l-4 border-blue-500 text-gray-800",
  warning: "bg-white border-l-4 border-orange-500 text-gray-800",
  default: "bg-white border-l-4 border-gray-500 text-gray-800",
  dark: "bg-gray-800 border-l-4 border-white text-white",
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans text-gray-900">
          <main className="flex-1">
            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/news" element={<NewsList />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/events" element={<EventCalendar />} />
              <Route path="/qna" element={<QnA />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/:id" element={<AlbumDetail />} />

              {/* --- Protected User Routes --- */}
              <Route path="/booking" element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* --- Protected Admin Routes (Nested with AdminLayout) --- */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                {/* ทุก Route ด้านล่างนี้จะแสดงผลภายในช่อง Outlet ของ AdminLayout */}
                <Route index element={<AdminDashboard />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="qna" element={<AdminQnA />} />
                <Route path="albums" element={<AdminAlbums />} />
              </Route>

              {/* 404 Not Found */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            toastClassName={({ type }) => contextClass[type || "default"] + 
              " relative flex p-1 min-h-[64px] rounded-xl justify-between overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.12)] mb-4 transform hover:scale-[1.02] transition-all duration-300 items-center font-sans"
            }
            bodyClassName={() => "text-sm font-semibold flex items-center gap-3 px-3"}
            icon={true}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;