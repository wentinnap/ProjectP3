import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { newsAPI } from "../../services/api";
import { Clock, Eye, User, ArrowLeft, Share2, Sparkles } from "lucide-react";
import Navbar from "../../components/layout/Navbar";

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ backend base url (ปรับได้จาก .env)
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  // ✅ ทำให้รองรับทั้ง 3 แบบ:
  // 1) /uploads/news/xxx.jpg  -> ต่อ SERVER_URL
  // 2) http(s)://...          -> ใช้ตรงๆ
  // 3) "" / null              -> ไม่มีรูป
  const getImageSrc = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${SERVER_URL}${url}`;
  };

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 animate-pulse">กำลังโหลดเนื้อหา...</p>
        </div>
      </>
    );
  }

  if (!news) return null;

  const heroImg = getImageSrc(news.image_url);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 font-sans pb-20 pt-24">
        {/* Hero / Header Image Section */}
        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
          {heroImg ? (
            <img src={heroImg} alt={news.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-orange-100 to-amber-50 flex items-center justify-center">
              <div className="text-center opacity-20">
                <div className="text-9xl font-bold text-orange-900">ว</div>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Content Over Image (Mobile/Tablet) */}
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white z-10">
            <div className="container mx-auto max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-lg shadow-orange-500/30">
                <Sparkles size={12} />
                <span>ข่าวประชาสัมพันธ์</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-md">
                {news.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-200 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <User size={14} />
                  </div>
                  <span>{news.author_name}</span>
                </div>
                <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{formatDate(news.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="container mx-auto px-4 -mt-10 relative z-20">
          <div className="max-w-4xl mx-auto">
            {/* Content Card */}
            <article className="bg-white rounded-4xl shadow-xl p-8 md:p-12">
              {/* Meta Bar */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-8">
                <Link
                  to="/news"
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                  <span className="font-medium text-sm">กลับไปหน้าข่าวสาร</span>
                </Link>

                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1.5" title="จำนวนผู้เข้าชม">
                    <Eye size={16} />
                    <span>{Number(news.view_count || 0).toLocaleString()}</span>
                  </div>
                  <button className="flex items-center gap-1.5 hover:text-orange-500 transition-colors" title="แชร์">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-img:rounded-2xl">
                <div className="whitespace-pre-wrap leading-relaxed">{news.content}</div>
              </div>

              {/* Footer / Last Updated */}
              {news.updated_at !== news.created_at && (
                <div className="mt-12 pt-6 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-400 italic">
                  <Clock size={14} />
                  <span>แก้ไขล่าสุดเมื่อ: {formatDate(news.updated_at)}</span>
                </div>
              )}
            </article>

            {/* Bottom Navigation */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 mb-6 text-sm">สนใจเข้าร่วมกิจกรรมหรือมีข้อสงสัย?</p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/contact"
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  ติดต่อสอบถาม
                </Link>
                <Link
                  to="/booking"
                  className="px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                >
                  จองพิธีกรรม
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetail;
