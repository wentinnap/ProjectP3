import { useEffect, useMemo, useState } from "react";
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
  Calendar,
  User,
  CheckCircle2,
  AlertCircle
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
      toast.success("บันทึกคำตอบเรียบร้อย");
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
      toast.success("เปลี่ยนสถานะการแสดงผลสำเร็จ");
      fetchAll();
    } catch (err) {
      toast.error("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ยืนยันการลบคำถามนี้? ข้อมูลจะถูกลบถาวร")) return;
    try {
      await qnaAPI.delete(id);
      toast.success("ลบคำถามเรียบร้อย");
      fetchAll();
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen pb-10 animate-in fade-in duration-500 p-4 lg:p-8">
      {/* --- Page Header --- */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-cyan-100 rounded-2xl text-cyan-600 shadow-sm">
              <MessageCircleQuestion size={30} />
            </div>
            จัดการถาม-ตอบ (Q&A)
          </h2>
          <p className="text-slate-500 mt-1 ml-1 font-medium italic">ดูแลและตอบข้อซักถามจากญาติโยมและผู้เยี่ยมชมเว็บไซต์</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* --- Filter Bar --- */}
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/50 mb-10 transition-all hover:shadow-2xl hover:shadow-slate-200/60">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all"
                placeholder="ค้นหาตามข้อความคำถามหรือคำตอบ..."
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-4 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-cyan-500 transition-all">
              <Filter size={18} className="text-slate-400" />
              <select
                value={answerStatus}
                onChange={(e) => setAnswerStatus(e.target.value)}
                className="w-full py-3.5 bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="unanswered">🔴 รอดำเนินการ</option>
                <option value="answered">🟢 ตอบแล้ว</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-4 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-cyan-500 transition-all">
              <Eye size={18} className="text-slate-400" />
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full py-3.5 bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">การแสดง: ทั้งหมด</option>
                <option value="visible">สาธารณะ (Public)</option>
                <option value="hidden">ซ่อน (Hidden)</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- List Section --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-[5px] border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Fetching Inquiries...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-6">
            {filtered.map((item) => {
              const hasAnswer = !!(item.answer && item.answer.trim());
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-[2.25rem] overflow-hidden shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all group animate-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      
                      {/* Left: Content Area */}
                      <div className="flex-1 space-y-5 w-full">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            ID: #{item.id}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            <Calendar size={12} className="text-cyan-500" />
                            {new Date(item.created_at).toLocaleDateString("th-TH", { dateStyle: 'long' })}
                          </div>
                          {!hasAnswer && (
                            <span className="flex items-center gap-1.5 bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ring-1 ring-red-100 shadow-sm animate-pulse">
                              <AlertCircle size={12} /> Pending
                            </span>
                          )}
                          {hasAnswer && (
                             <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ring-1 ring-emerald-100 shadow-sm">
                             <CheckCircle2 size={12} /> Answered
                           </span>
                          )}
                        </div>

                        {/* Question Bubble */}
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black text-lg shrink-0 border border-cyan-100 shadow-sm">
                            Q
                          </div>
                          <div className="pt-1">
                            <h3 className="text-slate-800 text-lg font-extrabold leading-tight tracking-tight group-hover:text-cyan-600 transition-colors">
                              {item.question}
                            </h3>
                          </div>
                        </div>

                        {/* Answer Bubble */}
                        {hasAnswer ? (
                          <div className="flex gap-4 bg-slate-50/80 p-6 rounded-[1.75rem] border border-slate-100 ml-0 md:ml-16 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/30"></div>
                            <div className="w-8 h-8 rounded-xl bg-white text-slate-400 border border-slate-200 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                              A
                            </div>
                            <p className="text-slate-600 text-[15px] font-medium leading-relaxed whitespace-pre-wrap italic">
                              {item.answer}
                            </p>
                          </div>
                        ) : (
                          <div className="ml-0 md:ml-16 p-4 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center bg-slate-50/30 text-slate-300 font-bold text-sm">
                             ยังไม่มีการตอบกลับสำหรับคำถามนี้
                          </div>
                        )}
                      </div>

                      {/* Right: Modern Actions */}
                      <div className="flex flex-row md:flex-col items-center justify-end gap-3 shrink-0 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-slate-50 md:pl-8">
                        <button
                          onClick={() => handleToggleVisibility(item.id)}
                          className={`flex-1 md:flex-none p-4 rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95 ${
                            item.is_visible 
                            ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white' 
                            : 'text-slate-400 bg-slate-100 hover:bg-slate-500 hover:text-white'
                          }`}
                          title={item.is_visible ? "ซ่อนจากหน้าเว็บ" : "แสดงบนหน้าเว็บ"}
                        >
                          {item.is_visible ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                        <button
                          onClick={() => openModal(item)}
                          className="flex-1 md:flex-none p-4 text-cyan-600 bg-cyan-50 hover:bg-cyan-600 hover:text-white rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95"
                          title="ตอบคำถาม"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-1 md:flex-none p-4 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95"
                          title="ลบคำถาม"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] py-32 border border-dashed border-slate-200 flex flex-col items-center gap-6 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-4xl flex items-center justify-center shadow-sm">
              <MessageSquare className="text-slate-200" size={48} />
            </div>
            <div className="text-center">
              <h4 className="text-slate-800 font-black text-xl tracking-tight">ไม่พบข้อมูลที่ต้องการ</h4>
              <p className="text-slate-400 font-bold mt-1 uppercase tracking-tighter text-xs">No questions found matching your criteria</p>
            </div>
          </div>
        )}

        {/* --- Answer Modal --- */}
        {open && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-100 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-black text-slate-800 text-xl tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-cyan-500 text-white rounded-xl">
                    <Send size={18} />
                  </div>
                  ส่งคำตอบ/แก้ไขคำตอบ
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-white rounded-full transition-all shadow-sm">
                  <X size={22} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveAnswer} className="p-8 space-y-6">
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                     <MessageSquare size={80} />
                  </div>
                  <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] block mb-2">Question Inquiry</span>
                  <p className="text-slate-700 font-extrabold text-base leading-relaxed italic relative z-10">
                    "{editingItem?.question}"
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em] ml-1">คำตอบของคุณ (Admin Response)</label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-[15px] h-48 resize-none font-medium text-slate-700 leading-relaxed shadow-inner"
                    placeholder="พิมพ์ข้อความที่ต้องการตอบกลับ..."
                    required
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-[1.25rem] transition-all text-sm uppercase tracking-widest border border-transparent hover:border-slate-100"
                    disabled={saving}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-4 bg-slate-800 text-white font-black rounded-[1.25rem] hover:bg-slate-700 transition-all shadow-xl shadow-slate-200 text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={18} />
                        บันทึกคำตอบ
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQnA;