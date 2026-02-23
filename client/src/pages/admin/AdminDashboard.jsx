import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { 
  ChevronDown, 
  Home, 
  ArrowRight, 
  Settings, 
  Activity,
  Database,
  Cloud,
  LayoutDashboard
} from 'lucide-react';

const AdminDashboard = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-orange-600" />
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">แผงควบคุมระบบ</h2>
          </div>
          <p className="text-gray-500 font-medium">Smart Temple Management Platform • ข้อมูลอัปเดตล่าสุด</p>
        </div>

        {/* ปุ่มกลับหน้าหลัก */}
        <Link 
          to="/" 
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-100 text-orange-600 rounded-2xl font-bold shadow-sm hover:bg-orange-50 hover:border-orange-200 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 shadow-orange-100/50"
        >
          <Home size={20} />
          <span>กลับหน้าเว็บไซต์</span>
        </Link>
      </div>

      {/* Grid Layout สำหรับ Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* วิดเจ็ตแบบที่ 1: Donut Chart Look */}
        <DashboardCard title="สถิติการอนุมัติ">
            <div className="flex justify-center items-center py-4">
              <div className="relative w-36 h-36 rounded-full border-[14px] border-orange-50 flex items-center justify-center shadow-inner">
                {/* วงกลมความก้าวหน้า (จำลองด้วย border) */}
                <div className="absolute inset-[-14px] rounded-full border-[14px] border-orange-500 border-t-transparent border-l-transparent transform rotate-[135deg]"></div>
                <div className="text-center">
                   <span className="text-3xl font-black text-gray-800 block">75%</span>
                   <span className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter">Approved</span>
                </div>
              </div>
            </div>
        </DashboardCard>

        {/* วิดเจ็ตแบบที่ 2: Progress Bars */}
        <DashboardCard title="สถานะการจอง">
            <div className="space-y-6 py-4">
                <ProgressBar label={stats?.approved_count || '0'} color="bg-orange-500" percent="75%" title="อนุมัติแล้ว" icon="check" />
                <ProgressBar label={stats?.pending_count || '0'} color="bg-amber-400" percent="50%" title="รอตรวจสอบ" icon="clock" />
                <ProgressBar label={stats?.rejected_count || '0'} color="bg-gray-400" percent="35%" title="ยกเลิก/ปฏิเสธ" icon="x" />
            </div>
        </DashboardCard>

        {/* วิดเจ็ตแบบที่ 3: Bar Chart Look */}
        <DashboardCard title="ความนิยมการใช้งาน">
            <div className="flex items-end justify-between h-32 px-4 py-2 border-l-2 border-b-2 border-orange-50">
                <div className="w-8 bg-orange-500 h-[60%] rounded-t-lg shadow-lg shadow-orange-500/20" title="จอง"></div>
                <div className="w-8 bg-amber-500 h-[90%] rounded-t-lg shadow-lg shadow-amber-500/20" title="ข่าวสาร"></div>
                <div className="w-8 bg-gray-800 h-[50%] rounded-t-lg shadow-lg shadow-gray-800/20" title="กิจกรรม"></div>
                <div className="w-8 bg-orange-300 h-[35%] rounded-t-lg shadow-lg shadow-orange-300/20" title="ถาม-ตอบ"></div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-gray-400 font-black px-1 uppercase tracking-tighter">
                <span>การจอง</span>
                <span>ข่าวสาร</span>
                <span>กิจกรรม</span>
                <span>Q&A</span>
            </div>
        </DashboardCard>

        {/* วิดเจ็ตแบบที่ 4: Menu Shortcut */}
        <DashboardCard title="ทางลัดการจัดการ">
           <div className="grid grid-cols-2 gap-4 py-2 mt-2">
             <QuickMenu to="/admin/bookings" label="ตรวจสอบการจอง" count={stats?.pending_count} color="bg-orange-500" />
             <QuickMenu to="/admin/news" label="ประกาศข่าวสาร" color="bg-amber-500" />
             <QuickMenu to="/admin/events" label="ตารางกิจกรรม" color="bg-orange-700" />
             <QuickMenu to="/admin/albums" label="คลังรูปภาพ" color="bg-gray-800" />
           </div>
        </DashboardCard>

        {/* วิดเจ็ตแบบที่ 5: Total Count */}
        <DashboardCard title="รายการจองรวม">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white p-6 rounded-[2rem] mt-4 flex justify-between items-center shadow-xl shadow-orange-500/25 group cursor-pointer">
                <div>
                  <span className="text-4xl font-black">{stats?.total_bookings || '0'}</span>
                  <span className="text-sm font-bold ml-2 opacity-80 uppercase tracking-widest">Items</span>
                </div>
                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </div>
            <div className="mt-6 flex items-center gap-2">
               <Activity size={14} className="text-orange-500" />
               <span className="bg-orange-50 px-3 py-1 text-[10px] rounded-full text-orange-600 uppercase font-black tracking-widest">Update: Real-time</span>
            </div>
        </DashboardCard>

        {/* วิดเจ็ตแบบที่ 6: System Status */}
        <DashboardCard title="สถานะระบบ">
            <ul className="space-y-4 mt-2">
                <StatusItem label="ฐานข้อมูล (SQL)" status="Online" color="text-green-500" icon={<Database size={14}/>} />
                <StatusItem label="API Endpoint" status="Connected" color="text-orange-500" icon={<Activity size={14}/>} />
                <StatusItem label="พื้นที่จัดเก็บรูปภาพ" status="Normal" color="text-orange-500" icon={<Cloud size={14}/>} />
            </ul>
        </DashboardCard>

      </div>
    </div>
  );
};

// --- Sub Components ---

const DashboardCard = ({ title, children }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_15px_40px_-15px_rgba(234,88,12,0.1)] border border-orange-50/50 min-h-[300px] flex flex-col hover:shadow-xl hover:border-orange-100 transition-all duration-300">
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-gray-900 text-lg font-black tracking-tight">{title}</h3>
      <Settings size={16} className="text-gray-300 hover:text-orange-500 cursor-pointer" />
    </div>
    <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] mb-6 font-bold">Internal Admin Monitor</p>
    <div className="flex-1">
        {children}
    </div>
  </div>
);

const ProgressBar = ({ label, color, percent, title }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-gray-500 uppercase font-black tracking-tight mb-1">
            <span>{title}</span>
            <span className="text-gray-400">{percent}</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-gray-50 rounded-full relative overflow-hidden border border-gray-100">
                <div className={`absolute top-0 left-0 h-full ${color} transition-all duration-1000 rounded-full shadow-sm`} style={{ width: percent }}></div>
            </div>
            <span className="text-gray-800 font-black text-sm w-8 text-right">{label}</span>
        </div>
    </div>
);

const QuickMenu = ({ to, label, count, color }) => (
    <Link to={to} className="flex flex-col gap-3 p-4 bg-gray-50/50 hover:bg-orange-50 rounded-2xl transition-all group border border-gray-100/50 hover:border-orange-200 active:scale-95">
        <div className={`w-3 h-3 ${color} rounded-full shadow-md`}></div>
        <span className="text-xs font-black text-gray-700 group-hover:text-orange-700 tracking-tighter leading-none">{label}</span>
        {count > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[9px] bg-orange-600 text-white px-1.5 py-0.5 rounded font-black tracking-tighter">{count} NEW</span>
          </div>
        )}
    </Link>
);

const StatusItem = ({ label, status, color, icon }) => (
    <li className="flex justify-between items-center text-sm text-gray-600 border-b border-orange-50/50 pb-3">
        <div className="flex items-center gap-2 font-bold">
            <span className="text-gray-300">{icon}</span>
            <span>{label}</span>
        </div>
        <div className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest">
            <span className={color}>{status}</span>
            <ChevronDown size={14} className="text-gray-300" />
        </div>
    </li>
);

export default AdminDashboard;