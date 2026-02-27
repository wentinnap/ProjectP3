import { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis
} from 'recharts';
import { Activity, ArrowRight, LayoutDashboard, Settings, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getStats();
      setStats(response.data?.data || response.data);
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div></div>;

  const total = Number(stats?.total_bookings || 0);
  const approved = Number(stats?.approved_count || 0);
  const getPercent = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

 const barData = [
  { name: 'จอง', value: total },
  { name: 'ข่าว', value: Number(stats?.news_count || 0) }, // ต้องเป็น news_count เหมือน Backend
  { name: 'กิจกรรม', value: Number(stats?.events_count || 0) },
  { name: 'Q&A', value: Number(stats?.qa_count || 0) },
];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black flex items-center gap-2">
          <LayoutDashboard className="text-orange-600" /> แผงควบคุมระบบ
        </h2>
        <p className="text-gray-500 text-sm">อัปเดต: {new Date().toLocaleTimeString('th-TH')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* กราฟวงกลม อัตราการอนุมัติ */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
          <h3 className="font-bold mb-4 text-lg">อัตราการอนุมัติการจอง</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{value: approved}, {value: total-approved}]} innerRadius={80} outerRadius={100} dataKey="value" stroke="none">
                  <Cell fill="#f97316" />
                  <Cell fill="#f3f4f6" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-4xl font-black">{getPercent(approved)}%</span>
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Approved</span>
            </div>
          </div>
        </div>

        {/* กราฟแท่ง สถิติรวม */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4 text-lg">ข้อมูลทั้งหมดในระบบ</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#fff7ed'}} contentStyle={{borderRadius: '15px', border: 'none'}} />
                <Bar dataKey="value" fill="#f97316" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* สรุปยอดรวม (Card สีดำ) */}
        <div className="bg-gray-900 p-10 rounded-[3rem] text-white flex flex-col justify-between relative overflow-hidden">
          <div>
            <p className="opacity-50 font-bold uppercase tracking-widest text-xs">Total Bookings</p>
            <h1 className="text-7xl font-black mt-2">{total.toLocaleString()}</h1>
            <div className="flex items-center gap-2 text-orange-400 mt-4 text-xs font-bold">
              <Activity size={14} className="animate-pulse" /> SYSTEM ACTIVE
            </div>
          </div>
          <ArrowRight className="absolute bottom-10 right-10 text-orange-500" size={48} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;