import { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, 
  ArrowRight, 
  LayoutDashboard,
  Settings
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

  // --- ข้อมูลสำหรับกราฟ ---
  
  const donutData = [
    { name: 'Approved', value: stats?.approved_count || 0, color: '#f97316' }, 
    { name: 'Pending/Others', value: (stats?.total_bookings - stats?.approved_count) || 0, color: '#fff7ed' }
  ];

  const barData = [
    { name: 'การจอง', value: stats?.total_bookings || 0 },
    { name: 'ข่าวสาร', value: stats?.news_count || 0 },
    { name: 'กิจกรรม', value: stats?.events_count || 0 },
    { name: 'Q&A', value: stats?.qa_count || 0 },
  ];

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
      
      {/* Header Section (เอาปุ่มกลับหน้าหลักออกแล้ว) */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard className="w-5 h-5 text-orange-600" />
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">แผงควบคุมระบบ</h2>
        </div>
        <p className="text-gray-500 font-medium">Smart Temple Management Platform • ข้อมูลภาพรวมสถิติ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        
        {/* วิดเจ็ต 1: สถิติการอนุมัติ */}
        <DashboardCard title="สถิติการอนุมัติ">
          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={70}
                  outerRadius={95}
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
              <span className="text-4xl font-black text-gray-800">{getPercent(stats?.approved_count)}%</span>
              <span className="text-[11px] text-orange-500 font-bold uppercase tracking-widest">Approved</span>
            </div>
          </div>
        </DashboardCard>

        {/* วิดเจ็ต 2: สถานะการจอง */}
        <DashboardCard title="สถานะการจองรายบุคคล">
          <div className="space-y-8 py-4 px-2">
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

        {/* วิดเจ็ต 3: ความนิยมการใช้งาน */}
        <DashboardCard title="ความนิยมการใช้งานส่วนต่างๆ">
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <Tooltip 
                  cursor={{fill: '#fff7ed'}} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 800, fill: '#6b7280'}} />
                <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* วิดเจ็ต 4: รายการจองรวม (Highlight Card) */}
        <div className="flex flex-col gap-6">
            <DashboardCard title="สรุปยอดรวมระบบ">
                <div className="bg-linear-to-br from-orange-500 to-amber-500 text-white p-8 rounded-[2.5rem] mt-4 flex justify-between items-center shadow-xl shadow-orange-500/20 group cursor-pointer transition-transform hover:scale-[1.01]">
                    <div>
                      <span className="text-5xl font-black">{stats?.total_bookings || 0}</span>
                      <span className="text-sm font-bold ml-2 opacity-80 uppercase tracking-widest block mt-1">Total Transactions</span>
                    </div>
                    <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
                </div>
                <div className="mt-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-orange-500 animate-pulse" />
                        <span className="bg-orange-50 px-3 py-1 text-[11px] rounded-full text-orange-600 uppercase font-black tracking-widest">Update: Real-time</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">System Healthy</span>
                </div>
            </DashboardCard>
        </div>

      </div>
    </div>
  );
};

// --- Sub Components ---

const DashboardCard = ({ title, children }) => (
  <div className="bg-white p-10 rounded-[3rem] shadow-[0_15px_50px_-15px_rgba(234,88,12,0.1)] border border-orange-50 flex flex-col hover:shadow-2xl hover:border-orange-100 transition-all duration-500">
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-gray-900 text-xl font-black tracking-tight">{title}</h3>
      <Settings size={18} className="text-gray-300 hover:rotate-90 transition-transform duration-500 cursor-pointer" />
    </div>
    <p className="text-[11px] text-gray-400 uppercase tracking-[0.2em] mb-8 font-bold">Data Insight Analysis</p>
    <div className="flex-1 flex flex-col justify-center">
        {children}
    </div>
  </div>
);

const ProgressBar = ({ label, color, percent, title }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500 uppercase font-black tracking-tight">
            <span>{title}</span>
            <span className="text-gray-400 font-bold">{percent}</span>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex-1 h-3.5 bg-gray-50 rounded-full relative overflow-hidden border border-gray-100/50">
                <div 
                  className={`absolute top-0 left-0 h-full ${color} transition-all duration-1000 ease-out rounded-full shadow-sm`} 
                  style={{ width: percent }}
                ></div>
            </div>
            <span className="text-gray-900 font-black text-lg w-10 text-right">{label}</span>
        </div>
    </div>
);

export default AdminDashboard;