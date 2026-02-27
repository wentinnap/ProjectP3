import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { newsAPI, toAssetUrl } from "../../services/api";
import { Calendar, Newspaper, ArrowRight, Clock, Sparkles } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const Home = () => {
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestNews();
  }, []);

  const fetchLatestNews = async () => {
    try {
      const response = await newsAPI.getAll({ page: 1, limit: 3 });
      setLatestNews(response.data.data.news);
    } catch (error) {
      console.error("Failed to fetch news:", error);
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

  return (
    <>
      <Navbar />

      {/* กำหนดฟอนต์หลักทั้งหน้าเป็น font-sans (Kanit) */}
      <div className="min-h-screen font-sans">
        
        {/* --- Hero Section --- */}
        <section className="relative h-[600px] md:h-[700px] flex items-center justify-center text-white overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed z-0 scale-105"
            style={{ backgroundImage: "url('/hero.png')" }}
          ></div>
          <div className="absolute inset-0 bg-linear-to-b from-gray-900/40 via-gray-900/20 to-gray-900/40 z-1"></div>

          <div className="container mx-auto px-4 relative z-10 text-center pt-20">
            <div className="max-w-4xl mx-auto">
              
              {/* Badge - ใช้ font-serif เพื่อความอ่อนช้อย */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-6 py-2 rounded-full mb-8 shadow-2xl animate-fade-in-up">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="text-sm font-semibold tracking-wide text-amber-50 font-serif">
                  ดินแดนแห่งความศรัทธา
                </span>
              </div>

              {/* Title - ใช้ font-serif (Sarabun) เพื่อความน่าเชื่อถือและเป็นทางการ */}
              <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-tight drop-shadow-lg font-serif">
                วัดกำแพง
              </h1>
              
              {/* Description - ใช้ font-sans แบบ light เพื่อให้อ่านง่าย */}
              <p className="text-xl md:text-2xl mb-12 text-gray-100 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
                ศูนย์รวมจิตใจพุทธศาสนิกชน สืบสานวัฒนธรรมล้านนา <br className="hidden md:block" />
                ร่วมสร้างกุศลและทำนุบำรุงพระพุทธศาสนา
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 font-sans">
                <Link
                  to="/booking"
                  className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <Calendar className="w-6 h-6" />
                  <span>จองพิธีทางศาสนา</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/donate"
                  className="group bg-white/10 backdrop-blur-md text-white border border-white/40 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <span>ร่วมทำบุญ</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1">
            <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-[60px] md:h-[100px]">
              <path d="M0 0C240 100 480 120 720 100C960 80 1200 60 1440 90V120H0V0Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* Services */}
        <section className="py-24 bg-white relative z-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <span className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-2 block font-sans">
                Our Services
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
                บริการที่เป็นเลิศ
              </h2>
              <div className="w-24 h-1 bg-linear-to-r from-orange-500 to-amber-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
              {/* บริการจองพิธีกรรม */}
              <Link to="/booking" className="group relative bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 hover:border-orange-200 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="bg-linear-to-br from-orange-500 to-amber-500 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <Calendar className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-3 text-gray-800 group-hover:text-orange-600 font-serif">จองพิธีกรรม</h3>
                    <p className="text-gray-500 mb-6 leading-relaxed text-lg font-light font-sans">
                      บริการจัดเตรียมงานบุญ งานมงคล และพิธีกรรมต่างๆ แบบครบวงจร สะดวกและรวดเร็ว
                    </p>
                    <div className="flex items-center text-orange-600 font-bold gap-2">
                      <span>ดำเนินการจอง</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* ข่าวสารและกิจกรรม */}
              <Link to="/news" className="group relative bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="bg-linear-to-br from-blue-500 to-indigo-500 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <Newspaper className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 font-serif">ข่าวสารและกิจกรรม</h3>
                    <p className="text-gray-500 mb-6 leading-relaxed text-lg font-light font-sans">
                      ติดตามความเคลื่อนไหว กิจกรรมทำบุญ และประกาศสำคัญจากทางวัดได้ที่นี่
                    </p>
                    <div className="flex items-center text-blue-600 font-bold gap-2">
                      <span>อ่านทั้งหมด</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Latest News */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3 font-serif">ข่าวสารล่าสุด</h2>
                <p className="text-gray-500 text-lg font-light font-sans">อัปเดตเรื่องราวดีๆ จากทางวัด</p>
              </div>
              <Link to="/news" className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-white text-orange-600 border border-gray-100 font-semibold font-sans">
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div></div>
            ) : latestNews.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {latestNews.map((n) => {
                  const imgSrc = toAssetUrl(n.image_url);
                  return (
                    <Link key={n.id} to={`/news/${n.id}`} className="group bg-white rounded-4xl overflow-hidden shadow-lg transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
                      {imgSrc ? (
                        <div className="relative h-64 overflow-hidden">
                          <img src={imgSrc} alt={n.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1 font-sans">
                            <Clock className="w-3 h-3" /> {formatDate(n.created_at)}
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 bg-orange-100 flex items-center justify-center"><Newspaper className="w-20 h-20 text-orange-400" /></div>
                      )}
                      <div className="p-8 flex flex-col grow">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 font-serif leading-relaxed line-clamp-2 group-hover:text-orange-600">{n.title}</h3>
                        <p className="text-gray-500 mb-6 text-sm grow font-light font-sans line-clamp-3 leading-relaxed">{n.content}</p>
                        <div className="flex items-center justify-end font-sans">
                          <span className="text-orange-500 font-semibold text-sm flex items-center gap-1">อ่านเพิ่มเติม <ArrowRight className="w-3 h-3" /></span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-4xl font-sans"><p className="text-gray-500 text-lg">ยังไม่มีข่าวสารในขณะนี้</p></div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Home;