import { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api'; // ตรวจสอบ path ให้ตรงกับโปรเจกต์คุณ
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis
} from 'recharts';
import { 
  Activity, ArrowRight, LayoutDashboard, Settings, AlertCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getStats();
      // จัดการโครงสร้างข้อมูลจาก axios response
      const data = response.data?.data || response.data;
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Dashboard Error:', err);
      setError('ไม่สามารถเชื่อมต่อข้อมูลสถิติได้');
    } finally {
      setLoading(false);
    }
  };

  // เตรียมข้อมูลตัวเลข
  const total = Number(stats?.total_bookings || 0);
  const approved = Number(stats?.approved_count || 0);
  const pending = Number(stats?.pending_count || 0);
  const rejected = Number(stats?.rejected_count || 0);

  // ข้อมูลกราฟวงกลม
  const donutData = total > 0 
    ? [
        { name: 'อนุมัติ', value: approved, color: '#f97316' }, 
        { name: 'รอ/ปฏิเสธ', value: (total - approved), color: '#fff7ed' }
      ]
    : [{ name: 'No Data', value: 1, color: '#f3f4f6' }];

  // ข้อมูลกราฟแท่ง
  const barData = [
    { name: 'จอง', value: total },
    { name: 'ข่าว', value: Number(stats?.news_count || 0) },
    { name: 'กิจกรรม', value: Number(stats?.events_count || 0) },
    { name: 'Q&A', value: Number(stats?.qa_count || 0) },
  ];

  const getPercent = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-orange-600">
      <AlertCircle size={40} />
      <p className="mt-2 font-bold">{error}</p>
      <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg">ลองใหม่</button>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 p-4 lg:p-6 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard className="text-orange-600" size={28} />
          <h2 className="text-3xl font-black text-gray-900">แผงควบคุมระบบ</h2>
        </div>
        <p className="text-gray-500">ข้อมูลอัปเดตเมื่อ: {new Date().toLocaleTimeString('th-TH')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Donut Chart */}
        <DashboardCard title="อัตราการอนุมัติ">
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} innerRadius={80} outerRadius={105} paddingAngle={5} dataKey="value" stroke="none">
                  {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-black text-gray-800">{getPercent(approved)}%</span>
              <span className="text-xs text-orange-500 font-bold tracking-widest uppercase">Approved</span>
            </div>
          </div>
        </DashboardCard>

        {/* Card 2: Status Progress */}
        <DashboardCard title="สถานะการจอง">
          <div className="space-y-6">
            <StatRow title="อนุมัติแล้ว" val={approved} percent={getPercent(approved)} color="bg-orange-500" />
            <StatRow title="รอการตรวจสอบ" val={pending} percent={getPercent(pending)} color="bg-amber-400" />
            <StatRow title="ยกเลิก/ปฏิเสธ" val={rejected} percent={getPercent(rejected)} color="bg-gray-300" />
          </div>
        </DashboardCard>

        {/* Card 3: Bar Chart */}
        <DashboardCard title="สถิติข้อมูลในระบบ">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ left: -30 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#fff7ed'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Card 4: Total Summary */}
        <div className="bg-gray-900 p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold opacity-60">ยอดรวมการจองทั้งหมด</h3>
            <div className="text-7xl font-black mt-4">{total.toLocaleString()}</div>
            <p className="mt-2 text-orange-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <Activity size={14} className="animate-pulse" /> System Live
            </p>
          </div>
          <ArrowRight className="absolute bottom-10 right-10 text-orange-500 group-hover:translate-x-3 transition-transform" size={48} />
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

// Helpers
const DashboardCard = ({ title, children }) => (
  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-500">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-black text-gray-800">{title}</h3>
      <Settings size={18} className="text-gray-300 rotate-0 hover:rotate-90 transition-transform" />
    </div>
    {children}
  </div>
);

const StatRow = ({ title, val, percent, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase"><span>{title}</span><span>{percent}%</span></div>
    <div className="flex items-center gap-4">
      <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
      </div>
      <span className="font-black text-lg w-10 text-right">{val}</span>
    </div>
  </div>
);

export default AdminDashboard;