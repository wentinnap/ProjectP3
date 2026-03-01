import { useEffect, useState, useCallback } from "react";
import { bookingAPI, analyticsAPI } from "../../services/api";
import {
  PieChart, Pie, Cell, XAxis, Tooltip,
  ResponsiveContainer, YAxis, LineChart, Line, CartesianGrid
} from "recharts";
import {
  Activity, LayoutDashboard, Users, Eye, RefreshCw, Smartphone, Download
} from "lucide-react";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#6366f1"];

const formatDate = (dateString) => {
  if (!dateString || dateString.length !== 8) return dateString;
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  return new Date(`${year}-${month}-${day}`).toLocaleDateString('th-TH', { 
    day: 'numeric', 
    month: 'short' 
  });
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dailyUsers, setDailyUsers] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

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
          analyticsAPI.getByDevice(params),
        ]);

      setStats(statsRes.data?.data || statsRes.data);
      setAnalytics(overviewRes.data);
      setDailyUsers(dailyRes.data || []);
      setTopPages(topPagesRes.data || []);
      setDeviceData(deviceRes.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- ฟังก์ชันสำหรับโหลด CSV ---
  const downloadCSV = () => {
    // 1. เตรียมหัวตาราง
    const headers = ["Date", "Active Users", "Page Views"];
    
    // 2. รวมข้อมูลจาก dailyUsers (หรือข้อมูลอื่นๆ ที่ต้องการ)
    const rows = dailyUsers.map(item => [
      item.date,
      item.users,
      // คุณสามารถเพิ่ม column อื่นๆ ได้ที่นี่
    ]);

    // 3. สร้างเนื้อหา CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    // 4. สร้างไฟล์และดาวน์โหลด
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dashboard_report_${days}days.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <RefreshCw className="animate-spin text-orange-500" size={40} />
      </div>
    );

  const total = Number(stats?.total_bookings || 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 bg-[#FDFCFB] min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-black flex items-center gap-2 text-slate-800">
            <LayoutDashboard className="text-orange-600" size={24} />
            แผงควบคุมระบบ
          </h2>
          <p className="text-slate-500 text-sm mt-1">ภาพรวมการใช้งานและสถิติย้อนหลัง</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* ปุ่มดาวน์โหลด CSV */}
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} className="text-orange-500" />
            ส่งออก CSV
          </button>

          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 w-fit">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  days === d
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                {d} วัน
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50">
          <p className="text-[10px] md:text-xs font-black uppercase text-slate-400 tracking-widest">
            Active Users ({days}D)
          </p>
          <h1 className="text-3xl md:text-4xl font-black mt-2 text-slate-800">
            {Number(analytics?.activeUsers || 0).toLocaleString()}
          </h1>
          <div className="p-2 bg-orange-100 rounded-xl w-fit mt-4">
            <Users className="text-orange-500" size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50">
          <p className="text-[10px] md:text-xs font-black uppercase text-slate-400 tracking-widest">
            Page Views
          </p>
          <h1 className="text-3xl md:text-4xl font-black mt-2 text-slate-800">
            {Number(analytics?.pageViews || 0).toLocaleString()}
          </h1>
          <div className="p-2 bg-blue-100 rounded-xl w-fit mt-4">
            <Eye className="text-blue-500" size={20} />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
          <p className="opacity-50 text-[10px] md:text-xs font-black uppercase tracking-widest">
            Total Bookings
          </p>
          <h1 className="text-3xl md:text-4xl font-black mt-2">
            {total.toLocaleString()}
          </h1>
          <div className="p-2 bg-orange-500/20 rounded-xl w-fit mt-4">
            <Activity className="text-orange-400" size={20} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-orange-500" />
            สถิติผู้ใช้งานรายวัน
          </h3>
          <div className="h-64 w-full" style={{ minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyUsers} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 600}}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 600}}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  labelFormatter={formatDate}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#f97316"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart (Device Stats) */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <Smartphone size={20} className="text-orange-500" />
            อุปกรณ์ที่ใช้
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  dataKey="users"
                  nameKey="device"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                >
                  {deviceData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-3">
            {deviceData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.device}
                </span>
                <span className="text-sm font-black text-slate-800">{item.users}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <h3 className="font-black text-slate-800 mb-6">หนายอดนิยม (Most Visited)</h3>
        <div className="space-y-4">
          {topPages.map((page, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-5 hover:bg-orange-50/50 rounded-2xl transition-all border border-transparent hover:border-orange-100 group"
            >
              <span className="text-sm font-bold text-slate-600 group-hover:text-orange-700">
                {page.page}
              </span>
              <div className="text-right">
                <span className="font-black text-orange-600 text-sm block">
                  {Number(page.views).toLocaleString()} VIEWS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;