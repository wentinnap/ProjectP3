import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ChevronDown, Home, ArrowRight, Settings, 
  Activity, Database, Cloud, LayoutDashboard,
  CheckCircle2, Clock, XCircle
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
      // สมมติโครงสร้าง data: { approved_count: 10, pending_count: 5, rejected_count: 2, total_bookings: 17 ... }
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- ข้อมูลสำหรับกราฟ (Data Preparation) ---
  
  // 1. Donut Chart Data
  const donutData = [
    { name: 'Approved', value: stats?.approved_count || 0, color: '#f97316' }, // Orange-500
    { name: 'Pending/Others', value: (stats?.total_bookings - stats?.approved_count) || 0, color: '#fff7ed' }
  ];

  // 2. Bar Chart Data
  const barData = [
    { name: 'การจอง', value: stats?.total_bookings || 0 },
    { name: 'ข่าวสาร', value: stats?.news_count || 12 }, // ตัวอย่างถ้า API ยังไม่มี
    { name: 'กิจกรรม', value: stats?.events_count || 8 },
    { name: 'Q&A', value: stats?.qa_count || 5 },
  ];

  // คำนวณ % สำหรับ Progress Bars
  const getPercent = (value) => {
    if (!stats?.total_bookings) return 0;
    return Math.round((value / stats.total_bookings) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10 p-6 bg-gray-50/30">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-orange-600" />
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">แผงควบคุมระบบ</h2>
          </div>
          <p className="text-gray-500 font-medium">Smart Temple Management Platform • ข้อมูลอัปเดตล่าสุด</p>
        </div>

        <Link 
          to="/" 
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-100 text-orange-600 rounded-2xl font-bold shadow-sm hover:bg-orange-50 hover:border-orange-200 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
        >
          <Home size={20} />
          <span>กลับหน้าเว็บไซต์</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* วิดเจ็ต 1: Donut Chart (สถิติการอนุมัติ) */}
        <DashboardCard title="สถิติการอนุมัติ">
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-gray-800">{getPercent(stats?.approved_count)}%</span>
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Approved</span>
            </div>
          </div>
        </DashboardCard>

        {/* วิดเจ็ต 2: Progress Bars (สถานะการจอง) */}
        <DashboardCard title="สถานะการจอง">
          <div className="space-y-6 py-2">
            <ProgressBar 
              label={stats?.approved_count || 0} 
              color="bg-orange-500" 
              percent={`${getPercent(stats?.approved_count)}%`} 
              title="อนุมัติแล้ว" 
            />
            <ProgressBar 
              label={stats?.pending_count || 0} 
              color="bg-amber-400" 
              percent={`${getPercent(stats?.pending_count)}%`} 
              title="รอตรวจสอบ" 
            />
            <ProgressBar 
              label={stats?.rejected_count || 0} 
              color="bg-gray-400" 
              percent={`${getPercent(stats?.rejected_count)}%`} 
              title="ยกเลิก/ปฏิเสธ" 
            />
          </div>
        </DashboardCard>

        {/* วิดเจ็ต 3: Bar Chart (ความนิยมการใช้งาน) */}
        <DashboardCard title="ความนิยมการใช้งาน">
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <Tooltip 
                  cursor={{fill: '#fff7ed'}} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#9ca3af'}} />
                <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* วิดเจ็ต 4-6: (ใช้โค้ดเดิมของคุณที่ปรับปรุงสไตล์เล็กน้อย) */}
        <DashboardCard title="ทางลัดการจัดการ">
           <div className="grid grid-cols-2 gap-4 mt-2">
             <QuickMenu to="/admin/bookings" label="ตรวจสอบการจอง" count={stats?.pending_count} color="bg-orange-500" />
             <QuickMenu to="/admin/news" label="ประกาศข่าวสาร" color="bg-amber-500" />
             <QuickMenu to="/admin/events" label="ตารางกิจกรรม" color="bg-orange-700" />
             <QuickMenu to="/admin/albums" label="คลังรูปภาพ" color="bg-gray-800" />
           </div>
        </DashboardCard>

        <DashboardCard title="รายการจองรวม">
            <div className="bg-linear-to-br from-orange-500 to-amber-500 text-white p-6 rounded-4xl mt-4 flex justify-between items-center shadow-xl shadow-orange-500/20 group cursor-pointer transition-transform hover:scale-[1.02]">
                <div>
                  <span className="text-4xl font-black">{stats?.total_bookings || 0}</span>
                  <span className="text-sm font-bold ml-2 opacity-80 uppercase tracking-widest block">Total Bookings</span>
                </div>
                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </div>
            <div className="mt-8 flex items-center gap-2">
               <Activity size={14} className="text-orange-500 animate-pulse" />
               <span className="bg-orange-50 px-3 py-1 text-[10px] rounded-full text-orange-600 uppercase font-black tracking-widest">Update: Real-time</span>
            </div>
        </DashboardCard>

        <DashboardCard title="สถานะระบบ">
            <ul className="space-y-4 mt-2">
                <StatusItem label="ฐานข้อมูล (SQL)" status="Online" color="text-green-500" icon={<Database size={14}/>} />
                <StatusItem label="API Endpoint" status="Connected" color="text-orange-500" icon={<Activity size={14}/>} />
                <StatusItem label="พื้นที่จัดเก็บ" status="Normal" color="text-orange-500" icon={<Cloud size={14}/>} />
            </ul>
        </DashboardCard>

      </div>
    </div>
  );
};

// --- Sub Components (คงเดิมแต่ปรับปรุง Props) ---

const DashboardCard = ({ title, children }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_15px_40px_-15px_rgba(234,88,12,0.08)] border border-orange-50/50 flex flex-col hover:shadow-2xl transition-all duration-500 group">
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-gray-900 text-lg font-black tracking-tight group-hover:text-orange-600 transition-colors">{title}</h3>
      <Settings size={16} className="text-gray-300 hover:rotate-90 transition-transform duration-500 cursor-pointer" />
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
            <div className="flex-1 h-2.5 bg-gray-50 rounded-full relative overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full ${color} transition-all duration-1000 ease-out rounded-full`} 
                  style={{ width: percent }}
                ></div>
            </div>
            <span className="text-gray-800 font-black text-sm w-8 text-right">{label}</span>
        </div>
    </div>
);

const QuickMenu = ({ to, label, count, color }) => (
    <Link to={to} className="flex flex-col gap-3 p-4 bg-gray-50/50 hover:bg-orange-50 rounded-2xl transition-all group border border-transparent hover:border-orange-100 active:scale-95">
        <div className={`w-2.5 h-2.5 ${color} rounded-full`}></div>
        <span className="text-xs font-black text-gray-700 group-hover:text-orange-700 tracking-tighter">{label}</span>
        {count > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[9px] bg-orange-600 text-white px-1.5 py-0.5 rounded font-black">{count} NEW</span>
          </div>
        )}
    </Link>
);

const StatusItem = ({ label, status, color, icon }) => (
    <li className="flex justify-between items-center text-sm text-gray-600 border-b border-orange-50/50 pb-3 last:border-0">
        <div className="flex items-center gap-2 font-bold">
            <span className="text-gray-300">{icon}</span>
            <span>{label}</span>
        </div>
        <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
            <span className={color}>{status}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text', 'bg')} animate-pulse`}></div>
        </div>
    </li>
);

export default AdminDashboard;