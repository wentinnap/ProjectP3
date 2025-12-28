import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import { eventAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Calendar,
  FileText,
  Filter,
  ArrowLeft, // Import ArrowLeft icon
} from "lucide-react";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all"); // all | visible | hidden

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    is_visible: true,
  });

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEvents = useMemo(() => {
    const s = search.trim().toLowerCase();

    return events
      .filter((e) => {
        // visibility filter
        if (visibility === "visible") return !!e.is_visible;
        if (visibility === "hidden") return !e.is_visible;
        return true;
      })
      .filter((e) => {
        if (!s) return true;
        return (
          (e.title || "").toLowerCase().includes(s) ||
          (e.description || "").toLowerCase().includes(s)
        );
      });
  }, [events, search, visibility]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventAPI.getAllAdmin(); // ✅ ดึงทั้งหมด (รวม hidden)
      setEvents(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("โหลดกิจกรรมไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingEvent(item);
      setFormData({
        title: item.title || "",
        description: item.description || "",
        start_date: toDateInput(item.start_date),
        end_date: item.end_date ? toDateInput(item.end_date) : "",
        is_visible: !!item.is_visible,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        is_visible: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      is_visible: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (!formData.title.trim() || !formData.start_date) {
      toast.error("กรุณากรอกชื่อกิจกรรมและวันที่เริ่ม");
      return;
    }
    if (formData.end_date && formData.end_date < formData.start_date) {
      toast.error("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม");
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        is_visible: formData.is_visible,
      };

      if (editingEvent) {
        await eventAPI.update(editingEvent.id, payload);
        toast.success("แก้ไขกิจกรรมสำเร็จ");
      } else {
        await eventAPI.create(payload);
        toast.success("เพิ่มกิจกรรมสำเร็จ");
      }

      handleCloseModal();
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "บันทึกไม่สำเร็จ");
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await eventAPI.toggleVisibility(id);
      toast.success("เปลี่ยนสถานะสำเร็จ");
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบกิจกรรมนี้?")) return;

    try {
      await eventAPI.delete(id);
      toast.success("ลบกิจกรรมสำเร็จ");
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error("ลบกิจกรรมไม่สำเร็จ");
    }
  };

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✅ ช่วยแปลงให้ input type=date ใช้ได้แน่นอน
  function toDateInput(value) {
    if (!value) return "";
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Title & Back Button */}
            <div className="flex items-center gap-4">
                <Link 
                    to="/admin" 
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all active:scale-95"
                    title="กลับไปหน้าแดชบอร์ด"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="text-orange-500" />
                        จัดการปฏิทินกิจกรรม
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        เพิ่ม/แก้ไข/ลบ กิจกรรมของวัด และกำหนดวันแสดงในปฏิทิน
                    </p>
                </div>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 active:scale-95 ml-auto md:ml-0"
            >
              <Plus size={20} />
              <span>เพิ่มกิจกรรม</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาด้วยชื่อกิจกรรมหรือรายละเอียด..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none cursor-pointer text-gray-700"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="visible">แสดงอยู่</option>
                <option value="hidden">ซ่อนอยู่</option>
              </select>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      กิจกรรม
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      วันที่
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredEvents.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 max-w-md">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0 border border-orange-100">
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 line-clamp-1 mb-1">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {item.description || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-orange-400" />
                          {formatThaiDate(item.start_date)}
                          {item.end_date ? (
                            <span className="text-gray-400">
                              {" "}
                              - {formatThaiDate(item.end_date)}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item.is_visible ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            แสดง
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                            ซ่อน
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleVisibility(item.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.is_visible
                                ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={item.is_visible ? "ซ่อนกิจกรรม" : "แสดงกิจกรรม"}
                          >
                            {item.is_visible ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>

                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <Edit size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบกิจกรรม</h3>
            <p className="text-gray-500">
              ยังไม่มีกิจกรรมในระบบ หรือไม่ตรงกับคำค้นหา
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {editingEvent ? <Edit className="text-orange-500" /> : <Plus className="text-orange-500" />}
                {editingEvent ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
              </h2>

              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ชื่อกิจกรรม <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800"
                    placeholder="เช่น ทำบุญวันพระ, งานทอดกฐิน..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">รายละเอียด</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="5"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800 resize-none"
                    placeholder="รายละเอียดกิจกรรม (ไม่บังคับ)"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      วันที่เริ่ม <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      วันที่สิ้นสุด <span className="text-gray-400">(ถ้ามี)</span>
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800"
                      min={formData.start_date || undefined}
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      ถ้าเป็นกิจกรรมวันเดียว ปล่อยว่างได้
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      id="is_visible"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 left-0"
                      style={{
                        left: formData.is_visible ? "1.5rem" : "0",
                        borderColor: formData.is_visible ? "#f97316" : "#d1d5db",
                      }}
                    />
                    <label
                      htmlFor="is_visible"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ${
                        formData.is_visible ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    ></label>
                  </div>
                  <label htmlFor="is_visible" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    แสดงกิจกรรมในปฏิทิน
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95"
                  >
                    {editingEvent ? "บันทึกการแก้ไข" : "บันทึกกิจกรรม"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;