import { useEffect, useState } from "react";
import { bookingAPI, analyticsAPI } from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import {
  Activity,
  ArrowRight,
  LayoutDashboard,
  Users,
  Eye,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dailyUsers, setDailyUsers] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [statsRes, overviewRes, dailyRes, topPagesRes] =
        await Promise.all([
          bookingAPI.getStats(),
          analyticsAPI.getOverview({
            startDate: "7daysAgo",
            endDate: "today",
          }),
          analyticsAPI.getDailyStats(),
          analyticsAPI.getTopPages(),
        ]);

      setStats(statsRes.data?.data || statsRes.data);
      setAnalytics(overviewRes.data);
      setDailyUsers(dailyRes.data);
      setTopPages(topPagesRes.data);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโหลดข้อมูล Dashboard ได้");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-[60vh] items-center justify-center text-red-500">
        {error}
      </div>
    );

  const total = Number(stats?.total_bookings || 0);
  const approved = Number(stats?.approved_count || 0);
  const getPercent = (val) =>
    total > 0 ? Math.round((val / total) * 100) : 0;

  const barData = [
    { name: "จอง", value: total },
    { name: "ข่าว", value: Number(stats?.news_count || 0) },
    { name: "กิจกรรม", value: Number(stats?.events_count || 0) },
    { name: "Q&A", value: Number(stats?.qa_count || 0) },
  ];

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black flex items-center gap-2">
        <LayoutDashboard className="text-orange-600" />
        แผงควบคุมระบบ
      </h2>

      {/* ================== SUMMARY CARDS ================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Total Bookings */}
        <div className="bg-gray-900 p-8 rounded-3xl text-white flex flex-col justify-between">
          <div>
            <p className="opacity-50 text-xs font-bold uppercase">
              Total Bookings
            </p>
            <h1 className="text-5xl font-black mt-2">
              {total.toLocaleString()}
            </h1>
          </div>
          <Activity className="text-orange-500" size={28} />
        </div>

        {/* Active Users */}
        <div className="bg-white p-8 rounded-3xl shadow border">
          <p className="text-xs font-bold uppercase opacity-50">
            Active Users (7 Days)
          </p>
          <h1 className="text-5xl font-black mt-2">
            {Number(analytics?.activeUsers || 0).toLocaleString()}
          </h1>
          <Users className="text-orange-500 mt-4" />
        </div>

        {/* Page Views */}
        <div className="bg-white p-8 rounded-3xl shadow border">
          <p className="text-xs font-bold uppercase opacity-50">
            Page Views (7 Days)
          </p>
          <h1 className="text-5xl font-black mt-2">
            {Number(analytics?.pageViews || 0).toLocaleString()}
          </h1>
          <Eye className="text-orange-500 mt-4" />
        </div>

        {/* Approval Rate */}
        <div className="bg-white p-8 rounded-3xl shadow border relative">
          <p className="text-xs font-bold uppercase opacity-50 mb-2">
            Approval Rate
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={[{ value: approved }, { value: total - approved }]}
                innerRadius={40}
                outerRadius={60}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#f97316" />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-black">
            {getPercent(approved)}%
          </div>
        </div>
      </div>

      {/* ================== CHARTS ================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Daily Users */}
        <div className="bg-white p-8 rounded-3xl shadow border h-96">
          <h3 className="font-bold mb-4">ผู้ใช้งานย้อนหลัง 7 วัน</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyUsers}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#f97316"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System Data Bar */}
        <div className="bg-white p-8 rounded-3xl shadow border h-96">
          <h3 className="font-bold mb-4">ข้อมูลทั้งหมดในระบบ</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#f97316"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================== TOP PAGES ================== */}
      <div className="bg-white p-8 rounded-3xl shadow border">
        <h3 className="font-bold mb-6">Top Pages (7 Days)</h3>
        <div className="space-y-3">
          {topPages.map((page, index) => (
            <div
              key={index}
              className="flex justify-between border-b pb-2 text-sm"
            >
              <span className="truncate">{page.page}</span>
              <span className="font-bold">
                {Number(page.views).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;