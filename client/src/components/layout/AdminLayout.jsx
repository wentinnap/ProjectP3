import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Users, Search, Calendar, 
  MessageCircleQuestion, LogOut, ChevronDown, Bell,
  Newspaper, CalendarClock, Image as ImageIcon, Menu
} from 'lucide-react';

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

  return (
    // 1. เพิ่ม h-screen และ overflow-hidden เพื่อล็อคหน้าจอไม่ให้เลื่อนทั้งหน้า
    <div className="h-screen w-full bg-[#f4f7fe] flex overflow-hidden font-sans">
      
      {/* --- Sidebar --- */}
      {/* 2. ใช้ h-full เพื่อให้ Sidebar สูงเต็มจอเสมอ */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#343d52] text-white transition-all duration-300 flex flex-col h-full z-50 shrink-0`}>
        <div className="p-6 flex items-center gap-3 border-b border-gray-600/50">
          <div className="bg-cyan-500 p-2 rounded-lg text-white">
             <LayoutDashboard size={24} />
          </div>
          {isSidebarOpen && <span className="font-bold tracking-tight text-lg">SMART TEMPLE</span>}
        </div>

        {/* User Profile Section */}
        <div className="p-8 flex flex-col items-center border-b border-gray-600/50">
          <div className="w-16 h-16 bg-linear-to-tr from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-4 border-2 border-white/20 overflow-hidden text-2xl font-bold shadow-lg">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          {isSidebarOpen && (
            <div className="text-center">
              <p className="font-bold tracking-widest text-[10px] uppercase text-cyan-400 opacity-80">ADMIN PANEL</p>
              <p className="text-sm mt-1 font-medium truncate w-40">{user?.full_name}</p>
            </div>
          )}
        </div>

        {/* Sidebar Menu - ส่วนนี้เลื่อน scroll ได้เองถ้าเมนูเยอะ */}
        <nav className="flex-1 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 border-l-4 ${
                  isActive 
                  ? 'bg-white/10 border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Bottom */}
        <button 
          onClick={handleLogout} 
          className="p-6 border-t border-gray-600/50 flex items-center gap-4 text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">ออกจากระบบ</span>}
        </button>
      </aside>

      {/* --- Main Area --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header - ล็อคอยู่กับที่เพราะอยู่ข้างนอก main */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-8 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 w-64 md:w-96">
              <Search size={16} className="text-gray-400 mr-2" />
              <input type="text" placeholder="ค้นหาข้อมูล..." className="bg-transparent outline-none text-sm w-full" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative p-2 text-gray-400 hover:text-cyan-500 cursor-pointer transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </div>
             <div className="h-8 w-px bg-gray-200 mx-2"></div>
             <div className="flex items-center gap-3">
               <span className="text-sm font-semibold text-gray-700 hidden md:block">{user?.full_name}</span>
               <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                 {user?.full_name?.charAt(0)}
               </div>
             </div>
          </div>
        </header>

        {/* --- Content Outlet --- */}
        {/* 3. ส่วนนี้คือส่วนเดียวที่จะเลื่อน (Scrollable Area) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;