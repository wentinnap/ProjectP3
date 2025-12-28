import { useEffect, useState } from "react";
import { qnaAPI } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Pagination from "../../components/commom/Pagination"; // ✅ เพิ่ม

import {
  MessageCircleQuestion,
  Send,
  Sparkles,
  MessageSquare,
  User,
  ShieldCheck,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";

const QnA = () => {
  const [list, setList] = useState([]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await qnaAPI.getAll({ page, limit, search });

      const data = res.data?.data;
      const items = data?.items || data || [];
      const pagination = data?.pagination;

      setList(items);
      setTotalPages(pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load QnA:", error);
      toast.error("โหลด Q&A ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const submit = async () => {
    if (!question.trim()) {
      toast.warning("กรุณาพิมพ์คำถามก่อนส่ง");
      return;
    }

    setSubmitting(true);
    try {
      await qnaAPI.ask({ question });
      setQuestion("");
      toast.success("ส่งคำถามเรียบร้อยแล้ว รอทางวัดตอบกลับนะครับ");

      setSearch("");
      setSearchInput("");
      setPage(1);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการส่งคำถาม");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 font-sans pb-0">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300 opacity-20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

          <div className="container mx-auto px-4 relative z-10 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6">
              <MessageCircleQuestion className="w-5 h-5 text-amber-200" />
              <span className="text-sm font-medium tracking-wide">สอบถามข้อสงสัย</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-md">
              ถาม - ตอบ (Q&A)
            </h1>
            <p className="text-lg md:text-xl text-orange-50 max-w-2xl mx-auto font-light leading-relaxed">
              พื้นที่สำหรับไขข้อข้องใจเกี่ยวกับพิธีกรรม กิจกรรม หรือข้อมูลต่างๆ ของวัดพระธาตุ
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1">
            <svg viewBox="0 0 1440 120" fill="none" className="w-full h-[60px] md:h-[100px]" preserveAspectRatio="none">
              <path d="M0 0C240 100 480 120 720 100C960 80 1200 60 1440 90V120H0V0Z" fill="#f9fafb" />
            </svg>
          </div>
        </section>

        <div className="container mx-auto px-4 relative z-20 -mt-10 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Ask Box */}
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 mb-8 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-orange-400 to-amber-400"></div>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">มีข้อสงสัย? ถามเราได้เลย</h2>
                  <p className="text-gray-500">เจ้าหน้าที่จะเข้ามาตอบคำถามของท่านโดยเร็วที่สุด</p>
                </div>
              </div>

              <div className="relative group">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                  placeholder="พิมพ์คำถามของคุณที่นี่..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none text-gray-700"
                />
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="absolute bottom-3 right-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>ส่งคำถาม</span>
                      <Send size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="mb-10">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
                <div className="pl-3 text-gray-400">
                  <Search size={20} />
                </div>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ค้นหาในคำถาม/คำตอบ..."
                  className="flex-1 px-2 py-3 bg-transparent outline-none text-gray-700"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800"
                >
                  ค้นหา
                </button>
              </div>

              {search && (
                <div className="mt-2 text-sm text-gray-500">
                  กำลังค้นหา: <span className="font-bold">{search}</span>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="ml-3 text-orange-600 font-bold hover:underline"
                  >
                    ล้างคำค้นหา
                  </button>
                </div>
              )}
            </form>

            {/* Q&A List */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 px-2">
                <MessageSquare className="text-gray-400" size={20} />
                <h3 className="font-bold text-gray-600">คำถามล่าสุด</h3>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
                </div>
              ) : list.length > 0 ? (
                list.map((q) => (
                  <div key={q.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex gap-4 mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0 mt-1">
                        <User size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="font-bold text-gray-800 text-lg leading-relaxed">{q.question}</h4>
                          {q.answer ? (
                            <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                              <ShieldCheck size={12} /> ตอบแล้ว
                            </span>
                          ) : (
                            <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full border border-gray-200">
                              <Clock size={12} /> รอการตอบ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          ถามเมื่อ: {new Date(q.created_at || Date.now()).toLocaleDateString("th-TH")}
                        </p>
                      </div>
                    </div>

                    {q.answer && (
                      <div className="ml-14 relative bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
                        <div className="absolute -top-4 left-6 w-0.5 h-4 bg-orange-200"></div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                            ว
                          </div>
                          <div>
                            <p className="font-bold text-orange-800 text-sm mb-1">วัดพระธาตุ</p>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <MessageCircleQuestion size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">{search ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีคำถาม"}</p>
                  <p className="text-sm text-gray-400">{search ? "ลองค้นหาด้วยคำอื่น" : "เป็นคนแรกที่ส่งคำถามถึงเรา"}</p>
                </div>
              )}

              {/* ✅ ใช้ Pagination component */}
              {!loading && totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default QnA;
