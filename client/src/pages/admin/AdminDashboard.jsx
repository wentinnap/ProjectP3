import { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis
} from 'recharts';
import { Activity, ArrowRight, LayoutDashboard, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getStats();
      // ดึงข้อมูลจากก้อน data ที่ Backend ส่งมา
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

  // จัดข้อมูลสำหรับกราฟแท่ง (ต้องสะกดให้ตรงกับ Backend)
  const barData = [
    { name: 'จอง', value: total },
    { name: 'ข่าว', value: Number(stats?.news_count || 0) },
    { name: 'กิจกรรม', value: Number(stats?.events_count || 0) },
    { name: 'Q&A', value: Number(stats?.qa_count || 0) },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black flex items-center gap-2">
        <LayoutDashboard className="text-orange-600" /> แผงควบคุมระบบ
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* อัตราอนุมัติ */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative h-80">
          <h3 className="font-bold mb-4">อัตราการอนุมัติการจอง</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[{value: approved}, {value: total-approved}]} innerRadius={80} outerRadius={100} dataKey="value" stroke="none">
                <Cell fill="#f97316" />
                <Cell fill="#f3f4f6" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
            <span className="text-4xl font-black">{getPercent(approved)}%</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Approved</span>
          </div>
        </div>

        {/* กราฟแท่งสถิติรวม */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-80">
          <h3 className="font-bold mb-4">ข้อมูลทั้งหมดในระบบ</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#fff7ed'}} />
              <Bar dataKey="value" fill="#f97316" radius={[10, 10, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* การจองทั้งหมด */}
        <div className="bg-gray-900 p-10 rounded-[3rem] text-white relative overflow-hidden h-64 flex flex-col justify-between">
          <div>
            <p className="opacity-50 text-xs font-bold uppercase tracking-widest">Total Bookings</p>
            <h1 className="text-7xl font-black mt-2">{total.toLocaleString()}</h1>
          </div>
          <Activity className="text-orange-500 animate-pulse" size={32} />
          <ArrowRight className="absolute bottom-10 right-10 text-orange-500" size={48} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;