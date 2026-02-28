import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../commom/NotificationDropdown';
import {
  LayoutDashboard,
  Calendar,
  MessageCircleQuestion,
  LogOut,
  Newspaper,
  CalendarClock,
  Image as ImageIcon,
  Menu,
  ExternalLink,
  Home
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // เปิด sidebar อัตโนมัติเมื่อจอ ≥ md
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Calendar, label: 'จัดการการจอง', path: '/admin/bookings' },
    { icon: Newspaper, label: 'จัดการข่าวสาร', path: '/admin/news' },
    { icon: CalendarClock, label: 'จัดการกิจกรรม', path: '/admin/events' },
    { icon: MessageCircleQuestion, label: 'จัดการถาม-ตอบ', path: '/admin/qna' },
    { icon: ImageIcon, label: 'จัดการรูปภาพ', path: '/admin/albums' },
  ];

  const currentMenu =
    menuItems.find(item => item.path === location.pathname)?.label ||
    'Admin Panel';

  return (
    <div className="h-screen w-full bg-[#FCFAF8] flex overflow-hidden font-sans relative">

      {/* Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-72 md:w-72
          h-full
          bg-[#1e1b18] text-white
          transition-all duration-300
          z-50 flex flex-col shadow-2xl
        `}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="bg-linear-to-br from-orange-500 to-amber-600 p-2.5 rounded-xl">
            <LayoutDashboard size={22} />
          </div>
          <span className="font-black tracking-tight text-lg">
            SMART TEMPLE
          </span>
        </div>

        {/* Profile */}
        <div className="p-6 flex flex-col items-center border-b border-white/5">
          <div className="w-14 h-14 bg-linear-to-tr from-orange-500 to-amber-300 rounded-xl flex items-center justify-center text-xl font-bold">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-semibold mt-3 text-gray-200 truncate w-full text-center">
            {user?.full_name}
          </p>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-2">
          <Link
            to="/"
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-amber-400 hover:bg-amber-400/10 transition-all"
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
          >
            <Home size={20} />
            <span className="font-semibold text-sm">
              ไปหน้าหลักเว็บไซต์
            </span>
          </Link>

          <div className="h-px bg-white/10 my-3" />

          {menuItems.map(item => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() =>
                  window.innerWidth < 768 && setIsSidebarOpen(false)
                }
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm font-semibold
                ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all font-semibold text-sm"
          >
            <LogOut size={20} />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8">

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-orange-50 text-orange-600 rounded-lg md:hidden"
            >
              <Menu size={22} />
            </button>

            <span className="font-bold text-gray-900 text-sm md:text-base">
              {currentMenu}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 px-3 py-2 text-orange-600 text-sm font-semibold bg-orange-50 hover:bg-orange-100 rounded-lg"
            >
              <ExternalLink size={16} />
              ดูหน้าเว็บ
            </Link>

            <NotificationDropdown />

            <div className="hidden md:block text-right">
              <p className="text-xs font-bold">{user?.full_name}</p>
              <p className="text-[10px] text-orange-500 uppercase">
                Administrator
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-[#FCFAF8]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;