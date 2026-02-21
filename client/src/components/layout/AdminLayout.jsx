import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Users, Search, Calendar, 
  MessageCircleQuestion, LogOut, ChevronDown, Bell,
  Newspaper, CalendarClock, Image as ImageIcon
} from 'lucide-react';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ใช้เช็คว่าตอนนี้อยู่หน้าไหนเพื่อทำสี Active
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // รายการเมนู
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Calendar, label: 'จัดการการจอง', path: '/admin/bookings' },
    { icon: Newspaper, label: 'จัดการข่าวสาร', path: '/admin/news' },
    { icon: CalendarClock, label: 'จัดการกิจกรรม', path: '/admin/events' },
    { icon: MessageCircleQuestion, label: 'จัดการถาม-ตอบ', path: '/admin/qna' },
    { icon: ImageIcon, label: 'จัดการรูปภาพ', path: '/admin/albums' },
  ];

  return (
    <div className="min-h-screen bg-[#e9e9e9] flex font-sans">
      
      {/* --- Sidebar --- */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#343d52] text-white transition-all duration-300 flex flex-col z-50 fixed h-full md:relative`}>
        <div className="p-6 flex items-center gap-3 border-b border-gray-600">
          <div className="bg-white/10 p-2 rounded-lg text-cyan-400">
             <LayoutDashboard size={24} />
          </div>
          {isSidebarOpen && <span className="font-bold tracking-widest uppercase">SMART TEMPLE</span>}
        </div>

        {/* User Profile Section */}
        <div className="p-8 flex flex-col items-center border-b border-gray-600">
          <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mb-4 border-4 border-gray-500 overflow-hidden text-2xl font-bold">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          {isSidebarOpen && (
            <div className="text-center">
              <p className="font-bold tracking-widest text-xs uppercase text-cyan-400">ADMIN PANEL</p>
              <p className="text-sm mt-1 truncate w-40">{user?.full_name}</p>
            </div>
          )}
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/5 ${location.pathname === item.path ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Bottom */}
        <button onClick={handleLogout} className="p-6 border-t border-gray-600 flex items-center gap-4 text-gray-400 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">ออกจากระบบ</span>}
        </button>
      </aside>

      {/* --- Main Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded px-3 py-1.5 w-64 md:w-96">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="ค้นหาข้อมูล..." className="bg-transparent outline-none text-sm w-full" />
          </div>
          <div className="flex items-center gap-4">
             <div className="relative p-2 text-gray-400 hover:text-cyan-500 cursor-pointer">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
             </div>
             <div className="h-8 w-px bg-gray-200 mx-2"></div>
             <span className="text-sm font-medium text-gray-600 hidden md:block">{user?.full_name}</span>
          </div>
        </header>

        {/* Content Outlet: หน้าอื่นๆ จะมาโผล่ตรงนี้ */}
        <main className="p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;