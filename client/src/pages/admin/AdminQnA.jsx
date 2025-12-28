import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import { qnaAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  Search,
  Filter,
  MessageCircleQuestion,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  X,
  Send,
  ArrowLeft, // Import ArrowLeft
  MessageSquare
} from "lucide-react";

const AdminQnA = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [answerStatus, setAnswerStatus] = useState("all");

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await qnaAPI.getAllAdmin();
      setList(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("โหลด Q&A ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return list
      .filter((item) => {
        if (visibility === "visible") return !!item.is_visible;
        if (visibility === "hidden") return !item.is_visible;
        return true;
      })
      .filter((item) => {
        const hasAnswer = !!(item.answer && item.answer.trim());
        if (answerStatus === "answered") return hasAnswer;
        if (answerStatus === "unanswered") return !hasAnswer;
        return true;
      })
      .filter((item) => {
        if (!s) return true;
        return (
          (item.question || "").toLowerCase().includes(s) ||
          (item.answer || "").toLowerCase().includes(s)
        );
      });
  }, [list, search, visibility, answerStatus]);

  const openModal = (item) => {
    setEditingItem(item);
    setAnswerText(item.answer || "");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingItem(null);
    setAnswerText("");
    setSaving(false);
  };

  const handleSaveAnswer = async (e) => {
    e?.preventDefault();
    if (!editingItem) return;

    try {
      setSaving(true);
      await qnaAPI.answer(editingItem.id, {
        answer: answerText,
        is_visible: editingItem.is_visible ?? true,
      });
      toast.success("บันทึกคำตอบสำเร็จ");
      closeModal();
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "บันทึกคำตอบไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await qnaAPI.toggleVisibility(id);
      toast.success("เปลี่ยนสถานะสำเร็จ");
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบคำถามนี้?")) return;

    try {
      await qnaAPI.delete(id);
      toast.success("ลบสำเร็จ");
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("ลบไม่สำเร็จ");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
                        <MessageCircleQuestion className="text-orange-500" />
                        จัดการถาม-ตอบ
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        ตอบคำถามจากทางบ้าน และจัดการสถานะการแสดงผล
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาคำถาม/คำตอบ..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={answerStatus}
                onChange={(e) => setAnswerStatus(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none cursor-pointer text-gray-700"
              >
                <option value="all">สถานะการตอบ (ทั้งหมด)</option>
                <option value="unanswered">ยังไม่ตอบ</option>
                <option value="answered">ตอบแล้ว</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none cursor-pointer text-gray-700"
              >
                <option value="all">สถานะการแสดง (ทั้งหมด)</option>
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
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 max-w-5xl mx-auto">
            {filtered.map((item) => {
              const hasAnswer = !!(item.answer && item.answer.trim());
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Status Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      item.is_visible ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>

                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-bold text-gray-400">#{item.id}</span>
                            <span className="text-xs text-gray-400 border-l border-gray-200 pl-3">
                                {formatDate(item.created_at)}
                            </span>
                            
                            {hasAnswer ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                    ตอบแล้ว
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
                                    ยังไม่ตอบ
                                </span>
                            )}
                        </div>

                        <div className="flex gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                                Q
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 leading-relaxed pt-1.5">
                                {item.question}
                            </h3>
                        </div>

                        {hasAnswer && (
                            <div className="flex gap-4 ml-4 md:ml-0 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">
                                    A
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed pt-1 whitespace-pre-wrap">
                                    {item.answer}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-2 md:items-end justify-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                        <button
                            onClick={() => handleToggleVisibility(item.id)}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                                item.is_visible
                                ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                            }`}
                        >
                            {item.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            {item.is_visible ? "แสดงอยู่" : "ซ่อนอยู่"}
                        </button>

                        <button
                            onClick={() => openModal(item)}
                            className="flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit size={14} />
                            {hasAnswer ? "แก้ไข" : "ตอบ"}
                        </button>

                        <button
                            onClick={() => handleDelete(item.id)}
                            className="flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={14} />
                            ลบ
                        </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
              <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              ไม่พบคำถาม
            </h3>
            <p className="text-gray-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะครับ</p>
          </div>
        )}
      </div>

      {/* Answer Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageCircleQuestion className="text-orange-500" />
                ตอบคำถาม
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <form onSubmit={handleSaveAnswer} className="space-y-6">
                
                {/* Question Display */}
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5">
                  <div className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-wide">
                    คำถามจากทางบ้าน
                  </div>
                  <div className="text-gray-800 font-bold text-lg leading-relaxed">
                    "{editingItem?.question}"
                  </div>
                </div>

                {/* Answer Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    คำตอบจากทางวัด
                  </label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-800 resize-none text-base"
                    placeholder="พิมพ์คำตอบที่นี่..."
                    required
                  />
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Eye size={12} />
                    คำตอบจะแสดงหน้าเว็บทันทีเมื่อกดบันทึก (หากสถานะเป็น "แสดง")
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                    disabled={saving}
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                    disabled={saving}
                  >
                    <Send size={18} />
                    {saving ? "กำลังบันทึก..." : "บันทึกคำตอบ"}
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

export default AdminQnA;