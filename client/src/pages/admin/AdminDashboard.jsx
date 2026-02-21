import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { 
  ChevronDown
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
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* ส่วนหัวของหน้า Dashboard */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">แผงควบคุมระบบ</h2>
        <p className="text-gray-500 text-sm">ภาพรวมข้อมูลและการจัดการระบบจัดการวัด</p>
      </div>

      {/* Grid Layout สำหรับ Widget (ตามสไตล์ภาพต้นฉบับ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* วิดเจ็ตแบบที่ 1: Donut Chart Look */}
        <DashboardCard title="สถิติการอนุมัติ">
           <div className="flex justify-center items-center py-4">
              <div className="relative w-32 h-32 rounded-full border-12 border-gray-100 flex items-center justify-center">
                {/* คำนวณเปอร์เซ็นต์จริงจาก API หรือใช้ค่าจำลองตามดีไซน์ */}
                <div className="absolute inset-0 rounded-full border-12 border-cyan-500 border-t-transparent border-l-transparent transform rotate-45"></div>
                <span className="text-2xl font-bold text-gray-700">75%</span>
              </div>
           </div>
        </DashboardCard>

        {/* วิดเจ็ตแบบที่ 2: Progress Bars */}
        <DashboardCard title="สถานะการจอง">
            <div className="space-y-6 py-4">
                <ProgressBar label={stats?.approved_count || '0'} color="bg-cyan-500" percent="75%" title="อนุมัติแล้ว" />
                <ProgressBar label={stats?.pending_count || '0'} color="bg-red-500" percent="50%" title="รอตรวจสอบ" />
                <ProgressBar label={stats?.rejected_count || '0'} color="bg-orange-500" percent="35%" title="ยกเลิก/ปฏิเสธ" />
            </div>
        </DashboardCard>

        {/* วิดเจ็ตแบบที่ 3: Bar Chart Look */}
        <DashboardCard title="ปริมาณการใช้งาน">
            <div className="flex items-end justify-between h-32 px-4 py-2 border-l border-b border-gray-100">
                <div className="w-6 bg-cyan-400 h-[60%] rounded-t-sm" title="จอง"></div>
                <div className="w-6 bg-red-500 h-[90%] rounded-t-sm" title="ข่าวสาร"></div>
                <div className="w-6 bg-[#343d52] h-[50%] rounded-t-sm" title="กิจกรรม"></div>
                <div className="w-6 bg-orange-400 h-[30%] rounded-t-sm" title="ถาม-ตอบ"></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold">
                <span>จอง</span>
                <span>ข่าว</span>
                <span>งาน</span>
                <span>Q&A</span>
            </div>
        </DashboardCard>

        {/* วิดเจ็ตแบบที่ 4: Menu Shortcut */}
        <DashboardCard title="ทางลัดการจัดการ">
           <div className="grid grid-cols-2 gap-4 py-2">
             <QuickMenu to="/admin/bookings" label="ตรวจสอบการจอง" count={stats?.pending_count} color="bg-orange-500" />
             <QuickMenu to="/admin/news" label="ประกาศข่าวสาร" color="bg-blue-500" />
             <QuickMenu to="/admin/events" label="ตารางกิจกรรม" color="bg-purple-500" />
             <QuickMenu to="/admin/albums" label="คลังรูปภาพ" color="bg-green-500" />
           </div>
        </DashboardCard>

        {/* วิดเจ็ตแบบที่ 5: Total Count */}
        <DashboardCard title="รายการจองทั้งหมด">
            <div className="bg-cyan-500 text-white p-6 rounded-lg mt-4 flex justify-between items-center shadow-lg shadow-cyan-500/20">
                <span className="text-4xl font-light">{stats?.total_bookings || '0'} รายการ</span>
                <ChevronDown size={24} />
            </div>
            <div className="mt-4 inline-block bg-gray-100 px-3 py-1 text-[10px] rounded text-gray-500 uppercase font-bold tracking-wider">Update: Just now</div>
        </DashboardCard>

        {/* วิดเจ็ตแบบที่ 6: System Status */}
        <DashboardCard title="สถานะเซิร์ฟเวอร์">
            <ul className="space-y-4 mt-2">
                <StatusItem label="ฐานข้อมูล (Database)" status="Online" color="text-blue-500" />
                <StatusItem label="API เชื่อมต่อปกติ" status="Connected" color="text-cyan-500" />
                <StatusItem label="พื้นที่จัดเก็บรูปภาพ" status="Normal" color="text-red-500" />
            </ul>
        </DashboardCard>

      </div>
    </div>
  );
};

// --- Sub Components (Internal) ---

const DashboardCard = ({ title, children }) => (
  <div className="bg-white p-6 shadow-sm border border-gray-200 min-h-[280px] flex flex-col hover:shadow-md transition-shadow">
    <h3 className="text-gray-400 text-lg font-light mb-1">{title}</h3>
    <p className="text-[10px] text-gray-300 uppercase tracking-wider mb-4 font-bold">Smart Temple Management System Platform</p>
    <div className="flex-1">
        {children}
    </div>
  </div>
);

const ProgressBar = ({ label, color, percent, title }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold">
            <span>{title}</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex-1 h-8 bg-gray-100 rounded-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 h-full ${color} transition-all duration-1000`} style={{ width: percent }}></div>
            </div>
            <span className="text-gray-500 font-bold w-8 text-right">{label}</span>
        </div>
    </div>
);

const QuickMenu = ({ to, label, count, color }) => (
    <Link to={to} className="flex flex-col gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-100">
        <div className={`w-2 h-2 ${color} rounded-full`}></div>
        <span className="text-xs font-bold text-gray-600 group-hover:text-black">{label}</span>
        {count > 0 && <span className="text-[10px] text-red-500 font-bold">{count} รายการใหม่</span>}
    </Link>
);

const StatusItem = ({ label, status, color }) => (
    <li className="flex justify-between items-center text-sm text-gray-500 border-b border-gray-50 pb-2">
        <span>{label}</span>
        <div className="flex items-center gap-2 font-bold">
            <span className={color}>{status}</span>
            <ChevronDown size={14} className={color} />
        </div>
    </li>
);

export default AdminDashboard;