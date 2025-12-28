import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { 
  Calendar, Newspaper, CheckCircle, XCircle, Clock, 
  LogOut, LayoutDashboard, Bell, ArrowRight, Activity, 
  Users, CalendarClock, MessageCircleQuestion, Home 
} from 'lucide-react';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* --- Top Navbar (Glassmorphism Effect) --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 transform hover:scale-105 transition-transform duration-300">
                    <LayoutDashboard size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Admin Portal</h1>
                    <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">Smart Temple System</p>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* ปุ่มไปหน้าบ้าน */}
                <Link 
                    to="/"
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-600 font-medium text-sm hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 group"
                >
                    <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                    <span>หน้าเว็บไซต์</span>
                </Link>

                <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 bg-white px-1.5 py-1.5 pr-4 rounded-full border border-gray-100 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                        {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-700 hidden sm:block">{user?.full_name}</span>
                </div>

                {/* Logout Button */}
                <button 
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 hover:shadow-md"
                    title="ออกจากระบบ"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <div className="flex-1 container mx-auto px-6 py-10">
        
        {/* Welcome Card */}
        <div className="mb-12 p-8 bg-white rounded-4xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-orange-100/50 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-3">
                        สวัสดีครับ, <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-amber-600">{user?.full_name}</span> 👋
                    </h2>
                    <p className="text-gray-500 text-lg">จัดการข้อมูลวัด ตรวจสอบการจอง และดูแลระบบได้ครบจบในที่เดียว</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold border border-green-100">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    ระบบทำงานปกติ
                </div>
            </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
        <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-8 bg-linear-to-b from-orange-500 to-amber-500 rounded-full"></div>
            <div>
                <h3 className="text-2xl font-bold text-gray-800">เมนูจัดการ</h3>
                <p className="text-sm text-gray-400">เลือกรายการที่ต้องการดำเนินการ</p>
            </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

// Component ย่อยสำหรับการ์ดสถิติ (StatCard) เพื่อลดโค้ดซ้ำซ้อน
const StatCard = ({ title, value, icon: Icon, color, isPending }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        green: "bg-green-50 text-green-600 border-green-100",
        red: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <div className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}>
            {isPending && <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-bl-[4rem] -mr-10 -mt-10 opacity-50 animate-pulse"></div>}
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={26} />
                </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1 pl-1">{title}</h3>
            <p className={`text-4xl font-extrabold pl-1 text-gray-800`}>{value}</p>
        </div>
    );
};

// Component ย่อยสำหรับการ์ดเมนู (MenuCard)
const MenuCard = ({ to, icon: Icon, title, desc, color, notification }) => {
    const theme = {
        orange: "from-orange-500 to-amber-500 shadow-orange-200 group-hover:text-orange-600",
        blue: "from-blue-500 to-indigo-500 shadow-blue-200 group-hover:text-blue-600",
        purple: "from-purple-500 to-fuchsia-500 shadow-purple-200 group-hover:text-purple-600",
        cyan: "from-cyan-500 to-teal-500 shadow-cyan-200 group-hover:text-cyan-600",
    };

    return (
        <Link to={to} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${theme[color].split(' ')[0]} ${theme[color].split(' ')[1]} text-white flex items-center justify-center shadow-lg ${theme[color].split(' ')[2]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={30} />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                    <ArrowRight size={18} />
                </div>
            </div>
            
            <div>
                <h3 className={`text-xl font-bold text-gray-800 ${theme[color].split(' ').slice(-1)[0]} transition-colors`}>
                    {title}
                </h3>
                <p className="text-sm text-gray-400 mt-1 font-light">{desc}</p>
                
                {notification > 0 && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold animate-pulse">
                        <Bell size={12} className="fill-red-600" />
                        {notification} รายการใหม่
                    </div>
                )}
            </div>
        </Link>
    );
};

export default AdminDashboard;