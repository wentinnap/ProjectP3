import { useEffect, useState, useCallback } from "react";
import { bookingAPI, analyticsAPI } from "../../services/api";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip,
  ResponsiveContainer, YAxis, LineChart, Line, CartesianGrid
} from "recharts";
import {
  Activity, LayoutDashboard, Users, Eye, RefreshCw, Smartphone
} from "lucide-react";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#6366f1"];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dailyUsers, setDailyUsers] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [deviceData, setDeviceData] = useState([]); // เก็บสถิติอุปกรณ์
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7); // ตัวเลือกช่วงเวลา (7, 30, 90)

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { startDate: `${days}daysAgo`, endDate: "today" };

      const [statsRes, overviewRes, dailyRes, topPagesRes, deviceRes] =
        await Promise.all([
          bookingAPI.getStats(),
          analyticsAPI.getOverview(params),
          analyticsAPI.getDailyStats(params),
          analyticsAPI.getTopPages(params),
          analyticsAPI.getByDevice(params), // เรียก API อุปกรณ์
        ]);

      setStats(statsRes.data?.data || statsRes.data);
      setAnalytics(overviewRes.data);
      setDailyUsers(dailyRes.data);
      setTopPages(topPagesRes.data);
      setDeviceData(deviceRes.data); // เซตข้อมูลอุปกรณ์
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <RefreshCw className="animate-spin text-orange-500" size={40} />
    </div>
  );

  const total = Number(stats?.total_bookings || 0);
  const approved = Number(stats?.approved_count || 0);

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header & Date Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black flex items-center gap-2">
          <LayoutDashboard className="text-orange-600" /> แผงควบคุมระบบ
        </h2>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                days === d ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {d} วัน
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold uppercase opacity-50">Active Users ({days}D)</p>
          <h1 className="text-4xl font-black mt-2">{Number(analytics?.activeUsers || 0).toLocaleString()}</h1>
          <Users className="text-orange-500 mt-4" />
        </div>
        <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold uppercase opacity-50">Page Views</p>
          <h1 className="text-4xl font-black mt-2">{Number(analytics?.pageViews || 0).toLocaleString()}</h1>
          <Eye className="text-orange-500 mt-4" />
        </div>
        <div className="bg-gray-900 p-6 rounded-4xl text-white shadow-xl">
          <p className="opacity-50 text-xs font-bold uppercase">Total Bookings</p>
          <h1 className="text-4xl font-black mt-2">{total.toLocaleString()}</h1>
          <Activity className="text-orange-500 mt-4" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* กราฟผู้ใช้รายวัน (Daily Users) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-4xl shadow-sm border">
          <h3 className="font-bold mb-6 text-gray-700">สถิติผู้ใช้งานรายวัน</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyUsers}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#f97316" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* กราฟอุปกรณ์ (Device Chart) */}
        <div className="bg-white p-8 rounded-4xl shadow-sm border">
          <h3 className="font-bold mb-6 flex items-center gap-2"><Smartphone size={18}/> อุปกรณ์ที่ใช้</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={deviceData} 
                  dataKey="users" 
                  nameKey="device" 
                  innerRadius={50} 
                  outerRadius={70} 
                  paddingAngle={5}
                >
                  {deviceData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {deviceData.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs font-bold text-gray-500">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                  {item.device}
                </span>
                <span>{item.users} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages List */}
      <div className="bg-white p-8 rounded-4xl shadow-sm border">
        <h3 className="font-bold mb-6">หน้ายอดนิยม (Most Visited)</h3>
        <div className="space-y-4">
          {topPages.map((page, index) => (
            <div key={index} className="flex justify-between items-center p-3 hover:bg-orange-50 rounded-xl transition-all">
              <span className="text-sm font-medium text-gray-600 truncate max-w-[70%]">{page.page}</span>
              <span className="font-black text-orange-600">{Number(page.views).toLocaleString()} <small className="text-gray-400">VIEWS</small></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;