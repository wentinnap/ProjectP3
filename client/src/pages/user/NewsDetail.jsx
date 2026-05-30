import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { newsAPI, toAssetUrl } from "../../services/api";
import { Clock, Eye, User, ArrowLeft, Share2, Sparkles, CalendarDays } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer"; // นำเข้า Footer เรียบร้อย
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchNewsDetail = async () => {
    setLoading(true);
    try {
      const response = await newsAPI.getById(id);
      setNews(response.data.data);
    } catch (error) {
      console.error("Failed to fetch news detail:", error);
      if (error.response?.status === 404) {
        navigate("/news");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว!");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7]">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute w-8 h-8 bg-orange-500/10 rounded-full animate-pulse"></div>
          </div>
          <p className="text-orange-800/60 font-medium mt-4 animate-pulse tracking-wide text-sm">กำลังเปิดอ่านข่าวสาร...</p>
        </div>
      </>
    );
  }

  if (!news) return null;

  const heroImg = toAssetUrl(news.image_url);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="grow pt-24 pb-24">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 max-w-4xl mb-6">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors group text-sm font-semibold"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-xs group-hover:bg-orange-50 group-hover:border-orange-100 flex items-center justify-center transition-colors">
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>กลับไปหน้าข่าวสาร</span>
          </Link>
        </div>

        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Card (Title & Meta) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100/80 p-6 md:p-8 shadow-xs mb-8"
          >
            <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-2xs">
              <Sparkles size={12} className="animate-pulse" />
              <span>ข่าวประชาสัมพันธ์</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-gray-800 leading-tight mb-6">
              {news.title}
            </h1>

            {/* Meta Information Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                    <User size={14} />
                  </div>
                  <span className="font-semibold text-gray-700">{news.author_name || "ผู้ดูแลระบบ"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <CalendarDays size={15} />
                  <span>{formatDate(news.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-gray-500" title="จำนวนผู้เข้าชม">
                  <Eye size={15} />
                  <span className="font-bold text-xs">{Number(news.view_count || 0).toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 hover:bg-orange-50 hover:border-orange-100 hover:text-orange-600 transition-colors cursor-pointer" 
                  title="คัดลอกลิงก์แชร์ข่าว"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Hero Banner Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full h-[260px] sm:h-[380px] md:h-[460px] rounded-3xl overflow-hidden shadow-md shadow-orange-900/5 mb-8 border border-white"
          >
            {heroImg ? (
              <img src={heroImg} alt={news.title} className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                <span className="text-8xl font-black text-orange-900/10">ข่าวสาร</span>
              </div>
            )}
          </motion.div>

          {/* Content Body */}
          <motion.article 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-100/80 shadow-xs p-8 md:p-12 mb-12"
          >
            <div className="prose prose-orange max-w-none">
              <p className="whitespace-pre-wrap leading-loose text-gray-600 text-base md:text-lg tracking-wide font-normal">
                {news.content}
              </p>
            </div>

            {/* Last Updated Label */}
            {news.updated_at !== news.created_at && (
              <div className="mt-12 pt-6 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-medium italic">
                <Clock size={13} />
                <span>แก้ไขข้อมูลล่าสุดเมื่อ: {formatDate(news.updated_at)}</span>
              </div>
            )}
          </motion.article>

          {/* Bottom Action Cards (CTA) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-linear-to-br from-orange-900 to-amber-950 rounded-3xl p-8 text-center shadow-lg shadow-orange-950/20 relative overflow-hidden text-white"
          >
            {/* Background Decorative Circles */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>

            <p className="text-orange-200/90 text-sm font-semibold tracking-wider uppercase mb-2">สนใจเข้าร่วมกิจกรรมหรือมีข้อสงสัย?</p>
            <h3 className="text-xl md:text-2xl font-black mb-6 text-amber-100">ติดต่อสอบถาม หรือ จองคิวล่วงหน้าได้ทันที</h3>
            
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-xl transition-all shadow-2xs text-sm"
              >
                ติดต่อสอบถาม
              </Link>
              <Link
                to="/booking"
                className="px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white font-black rounded-xl hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all text-sm"
              >
                จองคิวพิธีสงฆ์
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* 🌟 วาง Footer ไว้ด้านล่างสุดของเว็บเรียบร้อยครับ */}
      <Footer />
    </div>
  );
};

export default NewsDetail;