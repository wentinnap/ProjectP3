import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  MessageSquare,
  ChevronRight
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
      toast.error("โหลดข้อมูลไม่สำเร็จ");
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
      toast.error("บันทึกไม่สำเร็จ");
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
      toast.error("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircleQuestion className="text-cyan-500" size={28} />
            จัดการถาม-ตอบ
          </h2>
          <p className="text-gray-500 text-sm font-medium">ตอบคำถามและจัดการข้อความจากหน้าเว็บไซต์</p>
        </div>
      </div>

      {/* --- Filter Bar --- */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all"
              placeholder="ค้นหาข้อความ..."
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 rounded-xl border border-transparent focus-within:bg-white focus-within:border-cyan-500 transition-all">
            <Filter size={16} className="text-gray-400" />
            <select
              value={answerStatus}
              onChange={(e) => setAnswerStatus(e.target.value)}
              className="w-full py-2.5 bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer"
            >
              <option value="all">สถานะการตอบ (ทั้งหมด)</option>
              <option value="unanswered">รอดำเนินการ</option>
              <option value="answered">ตอบแล้ว</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 rounded-xl border border-transparent focus-within:bg-white focus-within:border-cyan-500 transition-all">
            <Eye size={16} className="text-gray-400" />
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full py-2.5 bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer"
            >
              <option value="all">การแสดงผล (ทั้งหมด)</option>
              <option value="visible">สาธารณะ</option>
              <option value="hidden">ซ่อนไว้</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- List Section --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium tracking-wide">กำลังดึงข้อมูล...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => {
            const hasAnswer = !!(item.answer && item.answer.trim());
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6">
                  {/* Left: Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#343d52] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                        Q-{item.id}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400 uppercase">
                        {new Date(item.created_at).toLocaleDateString("th-TH")}
                      </span>
                      {!hasAnswer && (
                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-black text-xs shrink-0">
                        Q
                      </div>
                      <h3 className="text-gray-800 font-bold leading-relaxed pt-1">
                        {item.question}
                      </h3>
                    </div>

                    {hasAnswer && (
                      <div className="flex gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100 ml-12">
                        <div className="w-6 h-6 rounded-full bg-white text-gray-400 border border-gray-200 flex items-center justify-center font-black text-[10px] shrink-0">
                          A
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row md:flex-col items-center justify-end gap-2 shrink-0 md:min-w-[120px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-50 md:pl-6">
                    <button
                      onClick={() => handleToggleVisibility(item.id)}
                      className={`flex-1 md:flex-none p-2 rounded-xl transition-all ${
                        item.is_visible 
                        ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' 
                        : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                      }`}
                      title={item.is_visible ? "ซ่อนจากหน้าเว็บ" : "แสดงบนหน้าเว็บ"}
                    >
                      {item.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => openModal(item)}
                      className="flex-1 md:flex-none p-2 text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-all"
                      title="ตอบคำถาม"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 md:flex-none p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                      title="ลบคำถาม"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-20 border border-dashed border-gray-200 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <MessageSquare className="text-gray-200" size={32} />
          </div>
          <p className="text-gray-400 font-bold">ไม่พบข้อมูลการถาม-ตอบ</p>
        </div>
      )}

      {/* --- Answer Modal --- */}
      {open && (
        <div className="fixed inset-0 bg-[#343d52]/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Send className="text-cyan-500" size={18} />
                ส่งคำตอบ
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSaveAnswer} className="p-6 space-y-5">
              <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-4">
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mb-1">Question</span>
                <p className="text-gray-700 font-bold text-sm leading-relaxed italic">
                  "{editingItem?.question}"
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">คำตอบสำหรับข้อความนี้</label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-sm h-40 resize-none font-medium"
                  placeholder="พิมพ์ข้อความตอบกลับที่นี่..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm"
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 bg-[#343d52] text-white font-bold rounded-xl hover:bg-[#3e485f] transition-all shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  disabled={saving}
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกคำตอบ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQnA;