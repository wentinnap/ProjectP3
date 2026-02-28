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
    <div className="min-h-screen pb-10 animate-in fade-in duration-500 p-3 sm:p-4 lg:p-8 bg-slate-50/50">
      {/* --- Page Header --- */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-cyan-100 rounded-2xl text-cyan-600 shadow-sm shrink-0">
            <MessageCircleQuestion className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              จัดการถาม-ตอบ (Q&A)
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium italic">ดูแลและตอบข้อซักถามจากญาติโยม</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* --- Filter Bar --- */}
        <div className="bg-white p-4 sm:p-6 rounded-4xl sm:rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/50 mb-6 md:mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-transparent rounded-xl sm:rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all"
                placeholder="ค้นหาข้อความ..."
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-xl sm:rounded-2xl border border-transparent focus-within:bg-white focus-within:border-cyan-500 transition-all">
              <Filter size={16} className="text-slate-400 shrink-0" />
              <select
                value={answerStatus}
                onChange={(e) => setAnswerStatus(e.target.value)}
                className="w-full py-3 bg-transparent text-xs sm:text-sm font-bold text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="unanswered">🔴 รอดำเนินการ</option>
                <option value="answered">🟢 ตอบแล้ว</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-xl sm:rounded-2xl border border-transparent focus-within:bg-white focus-within:border-cyan-500 transition-all">
              <Eye size={16} className="text-slate-400 shrink-0" />
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full py-3 bg-transparent text-xs sm:text-sm font-bold text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">การแสดง: ทั้งหมด</option>
                <option value="visible">สาธารณะ</option>
                <option value="hidden">ซ่อน</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- List Section --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Inquiries...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {filtered.map((item) => {
              const hasAnswer = !!(item.answer && item.answer.trim());
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-3xl sm:rounded-[2.25rem] overflow-hidden shadow-md hover:shadow-xl transition-all group animate-in slide-in-from-bottom-2 duration-500"
                >
                  <div className="p-5 sm:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
                      
                      {/* Left: Content Area */}
                      <div className="flex-1 space-y-4 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-slate-800 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            #{item.id}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                            <Calendar size={10} className="text-cyan-500" />
                            {new Date(item.created_at).toLocaleDateString("th-TH", { dateStyle: 'medium' })}
                          </div>
                          {!hasAnswer ? (
                            <span className="flex items-center gap-1 bg-red-50 text-red-600 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase animate-pulse ring-1 ring-red-100">
                              <AlertCircle size={10} /> Pending
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ring-1 ring-emerald-100">
                              <CheckCircle2 size={10} /> Answered
                            </span>
                          )}
                        </div>

                        {/* Question Bubble */}
                        <div className="flex gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black text-base sm:text-lg shrink-0 border border-cyan-100">
                            Q
                          </div>
                          <div className="pt-0.5">
                            <h3 className="text-slate-800 text-base sm:text-lg font-extrabold leading-tight tracking-tight group-hover:text-cyan-600 transition-colors">
                              {item.question}
                            </h3>
                          </div>
                        </div>

                        {/* Answer Bubble */}
                        {hasAnswer ? (
                          <div className="flex gap-3 bg-slate-50/80 p-4 sm:p-6 rounded-2xl sm:rounded-[1.75rem] border border-slate-100 ml-0 md:ml-16 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/30"></div>
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white text-slate-400 border border-slate-200 flex items-center justify-center font-black text-[10px] shrink-0">
                              A
                            </div>
                            <p className="text-slate-600 text-sm sm:text-[15px] font-medium leading-relaxed whitespace-pre-wrap italic">
                              {item.answer}
                            </p>
                          </div>
                        ) : (
                          <div className="ml-0 md:ml-16 p-4 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center bg-slate-50/30 text-slate-300 font-bold text-xs">
                            ยังไม่มีการตอบกลับ
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row md:flex-col items-center justify-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-50 md:pl-8">
                        <button
                          onClick={() => handleToggleVisibility(item.id)}
                          className={`flex-1 md:flex-none p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all shadow-sm active:scale-95 ${
                            item.is_visible 
                            ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white' 
                            : 'text-slate-400 bg-slate-100 hover:bg-slate-500 hover:text-white'
                          }`}
                        >
                          {item.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => openModal(item)}
                          className="flex-1 md:flex-none p-3 sm:p-4 text-cyan-600 bg-cyan-50 hover:bg-cyan-600 hover:text-white rounded-xl sm:rounded-2xl transition-all shadow-sm active:scale-95"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-1 md:flex-none p-3 sm:p-4 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl sm:rounded-2xl transition-all shadow-sm active:scale-95"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-4xl py-20 border border-dashed border-slate-200 flex flex-col items-center gap-4 shadow-sm">
            <MessageSquare className="text-slate-100" size={60} />
            <div className="text-center">
              <h4 className="text-slate-800 font-black text-lg">ไม่พบข้อมูล</h4>
              <p className="text-slate-400 font-bold uppercase text-[10px]">No questions found</p>
            </div>
          </div>
        )}

        {/* --- Answer Modal --- */}
        {open && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-100 p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-t-4xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
              <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-black text-slate-800 text-lg sm:text-xl tracking-tight flex items-center gap-2">
                  <Send size={18} className="text-cyan-500" />
                  ส่งคำตอบ
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveAnswer} className="p-6 sm:p-8 space-y-5 sm:space-y-6 max-h-[85vh] overflow-y-auto">
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4 sm:p-6">
                  <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest block mb-1">Inquiry</span>
                  <p className="text-slate-700 font-bold text-sm sm:text-base italic leading-relaxed">
                    "{editingItem?.question}"
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">คำตอบของคุณ</label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-sm h-40 sm:h-48 resize-none font-medium text-slate-700 leading-relaxed shadow-inner"
                    placeholder="พิมพ์ข้อความตอบกลับ..."
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="order-2 sm:order-1 flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all text-xs uppercase tracking-widest"
                    disabled={saving}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="order-1 sm:order-2 flex-2 py-3.5 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-all shadow-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={16} />
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