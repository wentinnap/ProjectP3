import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { 
  Calendar, Newspaper, CheckCircle, XCircle, Clock, 
  LogOut, LayoutDashboard, Bell, ArrowRight, Activity, 
  Users, CalendarClock, MessageCircleQuestion, Home, Menu, X
} from 'lucide-react';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State สำหรับเมนูมือถือ

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await bookingAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col pb-10">
      
      {/* --- Top Navbar --- */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
            
            {/* Logo & Title */}
            <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-linear-to-br from-orange-500 to-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <LayoutDashboard size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                    <h1 className="text-lg md:text-xl font-extrabold text-gray-800 tracking-tight leading-tight">Admin Portal</h1>
                    <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase hidden sm:block">Smart Temple System</p>
                </div>
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-4">
                <Link 
                    to="/"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-600 font-medium text-sm hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 group"
                >
                    <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                    <span>หน้าเว็บไซต์</span>
                </Link>

                <div className="h-8 w-px bg-gray-200"></div>

                <div className="flex items-center gap-3 bg-white px-1.5 py-1.5 pr-4 rounded-full border border-gray-100 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                        {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-700">{user?.full_name}</span>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 hover:shadow-md"
                    title="ออกจากระบบ"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* --- Mobile Menu Overlay --- */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-4 px-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 font-bold text-lg shadow-sm">
                        {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{user?.full_name}</p>
                        <p className="text-xs text-gray-500">ผู้ดูแลระบบ</p>
                    </div>
                </div>
                
                <Link to="/" className="flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    <Home size={20} />
                    <span className="font-medium">กลับหน้าเว็บไซต์</span>
                </Link>
                
                <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left">
                    <LogOut size={20} />
                    <span className="font-medium">ออกจากระบบ</span>
                </button>
            </div>
        )}
      </nav>

      {/* --- Main Content --- */}
      <div className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-10">
        
        {/* Welcome Card */}
        <div className="mb-8 md:mb-12 p-6 md:p-8 bg-white rounded-3xl md:rounded-4xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 md:w-80 md:h-80 bg-linear-to-bl from-orange-100/50 to-transparent rounded-bl-full -mr-8 -mt-8 md:-mr-16 md:-mt-16 transition-transform duration-700 group-hover:scale-110"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-3">
                        สวัสดีครับ, <br className="md:hidden"/>
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-amber-600">{user?.full_name}</span> 👋
                    </h2>
                    <p className="text-gray-500 text-sm md:text-lg">จัดการข้อมูลวัด ตรวจสอบการจอง และดูแลระบบ</p>
                </div>
                <div className="inline-flex self-start md:self-auto items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-green-50 text-green-700 rounded-xl text-xs md:text-sm font-semibold border border-green-100 shadow-sm">
                    <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-green-500"></span>
                    </span>
                    ระบบปกติ
                </div>
            </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
            <StatCard 
                title="การจองทั้งหมด" 
                value={stats?.total_bookings || 0} 
                icon={Users} 
                color="blue" 
            />
            <StatCard 
                title="รอการตอบรับ" 
                value={stats?.pending_count || 0} 
                icon={Clock} 
                color="orange" 
                isPending={true}
            />
            <StatCard 
                title="อนุมัติแล้ว" 
                value={stats?.approved_count || 0} 
                icon={CheckCircle} 
                color="green" 
            />
            <StatCard 
                title="ปฏิเสธ/ยกเลิก" 
                value={stats?.rejected_count || 0} 
                icon={XCircle} 
                color="red" 
            />
        </div>

        {/* Action Menu Section */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="w-1 md:w-1.5 h-6 md:h-8 bg-linear-to-b from-orange-500 to-amber-500 rounded-full"></div>
            <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">เมนูจัดการ</h3>
                <p className="text-xs md:text-sm text-gray-400">เลือกรายการที่ต้องการดำเนินการ</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <MenuCard 
                to="/admin/bookings" 
                icon={Calendar} 
                title="จัดการการจอง" 
                desc="ตรวจสอบและอนุมัติคิว" 
                color="orange"
                notification={stats?.pending_count}
            />
            <MenuCard 
                to="/admin/news" 
                icon={Newspaper} 
                title="จัดการข่าวสาร" 
                desc="ประชาสัมพันธ์กิจกรรมวัด" 
                color="blue"
            />
            <MenuCard 
                to="/admin/events" 
                icon={CalendarClock} 
                title="จัดการกิจกรรม" 
                desc="ตารางงานบุญและพิธีการ" 
                color="purple"
            />
            <MenuCard 
                to="/admin/qna" 
                icon={MessageCircleQuestion} 
                title="จัดการถาม-ตอบ" 
                desc="ตอบคำถามจากทางบ้าน" 
                color="cyan"
            />
        </div>

      </div>
    </div>
  );
};

// --- StatCard Component (Responsive Optimized) ---
const StatCard = ({ title, value, icon: Icon, color, isPending }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        green: "bg-green-50 text-green-600 border-green-100",
        red: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <div className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-full`}>
            {isPending && <div className="absolute top-0 right-0 w-12 h-12 md:w-20 md:h-20 bg-orange-100 rounded-bl-4xl md:rounded-bl-[4rem] -mr-6 -mt-6 md:-mr-10 md:-mt-10 opacity-50 animate-pulse"></div>}
            
            <div className="flex justify-between items-start mb-2 md:mb-4 relative z-10">
                <div className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>
            <div>
                <h3 className="text-gray-400 text-xs md:text-sm font-medium mb-0.5 pl-1 truncate">{title}</h3>
                <p className={`text-2xl md:text-4xl font-extrabold pl-1 text-gray-800`}>{value}</p>
            </div>
        </div>
    );
};

// --- MenuCard Component (Responsive Optimized) ---
const MenuCard = ({ to, icon: Icon, title, desc, color, notification }) => {
    const theme = {
        orange: "from-orange-500 to-amber-500 shadow-orange-200 group-hover:text-orange-600",
        blue: "from-blue-500 to-indigo-500 shadow-blue-200 group-hover:text-blue-600",
        purple: "from-purple-500 to-fuchsia-500 shadow-purple-200 group-hover:text-purple-600",
        cyan: "from-cyan-500 to-teal-500 shadow-cyan-200 group-hover:text-cyan-600",
    };

    return (
        <Link to={to} className="group bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-4 h-full relative overflow-hidden">
            
            {/* Mobile: Left Icon / Desktop: Top Icon */}
            <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-xl md:rounded-2xl bg-linear-to-br ${theme[color].split(' ')[0]} ${theme[color].split(' ')[1]} text-white flex items-center justify-center shadow-lg ${theme[color].split(' ')[2]} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className={`text-lg md:text-xl font-bold text-gray-800 ${theme[color].split(' ').slice(-1)[0]} transition-colors truncate`}>
                        {title}
                    </h3>
                    {/* Mobile Arrow */}
                    <div className="md:hidden text-gray-300 group-hover:text-gray-600 transition-colors">
                        <ArrowRight size={20} />
                    </div>
                </div>
                
                <p className="text-xs md:text-sm text-gray-400 mt-0.5 md:mt-1 font-light truncate md:whitespace-normal">{desc}</p>
                
                {/* Notification Badge */}
                {notification > 0 && (
                    <div className="mt-2 md:mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] md:text-xs font-bold animate-pulse">
                        <Bell size={10} className="fill-red-600" />
                        {notification} ใหม่
                    </div>
                )}
            </div>

            {/* Desktop Arrow */}
            <div className="hidden md:flex absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 items-center justify-center text-gray-300 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                <ArrowRight size={18} />
            </div>
        </Link>
    );
};

export default AdminDashboard;
