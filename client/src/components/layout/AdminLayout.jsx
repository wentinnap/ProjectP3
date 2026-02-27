import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Calendar, 
  MessageCircleQuestion, LogOut, Bell,
  Newspaper, CalendarClock, Image as ImageIcon, Menu, 
  ChevronRight, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  // หาชื่อเมนูปัจจุบันเพื่อแสดงใน Header
  const currentMenu = menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel';

  return (
    <div className="h-screen w-full bg-[#FCFAF8] flex overflow-hidden font-sans">
      
      {/* --- Sidebar --- */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-[#1e1b18] text-white transition-all duration-500 ease-in-out flex flex-col h-full z-50 shrink-0 shadow-2xl relative`}>
        
        {/* Logo Section */}
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="bg-linear-to-br from-orange-500 to-amber-600 p-2.5 rounded-2xl shadow-lg shadow-orange-500/20">
              <LayoutDashboard size={24} className="text-white" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-black tracking-tighter text-xl bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400"
            >
              SMART TEMPLE
            </motion.span>
          )}
        </div>

        {/* User Profile Section */}
        <div className={`p-8 flex flex-col items-center ${isSidebarOpen ? 'bg-white/5' : ''} border-b border-white/5 mx-4 my-6 rounded-4xl transition-all`}>
          <div className="relative">
            <div className="w-16 h-16 bg-linear-to-tr from-orange-500 via-orange-400 to-amber-300 rounded-2xl flex items-center justify-center border-2 border-white/10 overflow-hidden text-2xl font-black shadow-xl rotate-3">
              <span className="-rotate-3">{user?.full_name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#1e1b18] rounded-full"></div>
          </div>
          
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-4">
              <p className="font-black tracking-[0.2em] text-[10px] uppercase text-orange-500 mb-1">ADMINISTRATOR</p>
              <p className="text-sm font-bold text-gray-200 truncate w-44">{user?.full_name}</p>
            </motion.div>
          )}
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                  ? 'bg-linear-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-900/20' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={22} className={`${isActive ? 'text-white' : 'group-hover:text-orange-400'} transition-colors`} />
                {isSidebarOpen && <span className="text-[15px] font-bold tracking-tight">{item.label}</span>}
                {isActive && isSidebarOpen && <ChevronRight size={16} className="ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2">
            <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all group">
                <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
                {isSidebarOpen && <span className="text-[15px] font-bold">ตั้งค่าระบบ</span>}
            </button>
            <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all font-bold"
            >
                <LogOut size={22} />
                {isSidebarOpen && <span className="text-[15px]">ออกจากระบบ</span>}
            </button>
        </div>
      </aside>

      {/* --- Main Area --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Header - ลบช่อง Search ออกแล้ว */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-orange-100/50 flex items-center justify-between px-10 z-40 shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors shadow-sm"
            >
              <Menu size={22} />
            </button>
            
            {/* แสดงชื่อเมนูปัจจุบันแทนช่องค้นหาเพื่อให้ Header ดูมีข้อมูล */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-gray-400 text-sm font-medium">เมนู</span>
              <ChevronRight size={14} className="text-gray-300" />
              <span className="text-gray-900 font-bold tracking-tight">{currentMenu}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
              {/* Notification */}
              <button className="relative p-3 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                <Bell size={22} />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-orange-600 rounded-full border-2 border-white"></span>
              </button>

              <div className="h-10 w-px bg-gray-100 mx-2"></div>

              {/* User Menu */}
              <div className="flex items-center gap-4 pl-2 group cursor-pointer">
                <div className="text-right hidden md:block">
                    <p className="text-[13px] font-black text-gray-900 leading-none">{user?.full_name}</p>
                    <p className="text-[11px] font-bold text-orange-500 mt-1 uppercase tracking-tighter">Super Admin</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-orange-100 to-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-black shadow-sm group-hover:shadow-md transition-all">
                  {user?.full_name?.charAt(0)}
                </div>
              </div>
          </div>
        </header>

        {/* --- Content Outlet --- */}
        <main className="flex-1 overflow-y-auto p-8 md:p-12 bg-linear-to-b from-[#FCFAF8] to-[#F5F1EE] custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
             <Outlet />
          </motion.div>
        </main>

        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      </div>
    </div>
  );
};

export default AdminLayout;