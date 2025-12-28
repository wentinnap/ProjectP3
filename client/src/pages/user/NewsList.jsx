import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { newsAPI, toAssetUrl } from "../../services/api";
import { Search, Clock, Eye, Newspaper, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Pagination from "../../components/commom/Pagination"; // ✅ เพิ่ม

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState(""); // ✅ input แยก
  const [search, setSearch] = useState(""); // ✅ ตัวที่ยิงไป backend จริง

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, search]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await newsAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });

      setNews(response.data.data.news || []);
      setPagination((prev) => ({
        ...prev,
        ...(response.data.data.pagination || {}),
      }));
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearch(searchInput.trim()); // ✅ ค่อยยิงตอนกดค้นหา
  };

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
    setPagination((prev) => ({ ...prev, page: 1 }));
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

      <div className="min-h-screen bg-gray-50 font-sans pb-0">
        {/* Header Section */}
        <section className="relative bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 pt-32 pb-24 text-white overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300 opacity-20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="text-sm font-medium tracking-wide">อัปเดตเรื่องราวดีๆ</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-sm">
              ข่าวสารและกิจกรรม
            </h1>

            <p className="text-xl text-orange-50 max-w-2xl mx-auto font-light leading-relaxed">
              ติดตามข่าวสาร ความเคลื่อนไหว และกิจกรรมที่เป็นมงคลจากทางวัด
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1">
            <svg viewBox="0 0 1440 80" fill="none" className="w-full h-[60px]" preserveAspectRatio="none">
              <path d="M0 0C240 80 480 80 720 60C960 40 1200 20 1440 80V80H0V0Z" fill="#f9fafb" />
            </svg>
          </div>
        </section>

        {/* Search Section */}
        <section className="relative z-20 -mt-10 px-4 mb-10">
          <div className="container mx-auto max-w-3xl">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-3xl transform translate-y-4"></div>

              <div className="relative bg-white p-2 rounded-4xl shadow-2xl flex items-center border border-gray-100 focus-within:border-orange-200 transition-colors">
                <div className="pl-6 text-gray-400">
                  <Search className="w-6 h-6" />
                </div>

                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ค้นหาข่าวสาร, กิจกรรม..."
                  className="flex-1 px-4 py-4 text-gray-700 placeholder-gray-400 bg-transparent text-lg focus:outline-none font-medium"
                />

                <button
                  type="submit"
                  className="bg-linear-to-r from-orange-500 to-amber-500 text-white px-8 py-3.5 rounded-3xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95"
                >
                  ค้นหา
                </button>
              </div>

              {search && (
                <div className="mt-3 text-sm text-gray-500">
                  กำลังค้นหา: <span className="font-bold">{search}</span>
                  <button type="button" onClick={clearSearch} className="ml-3 text-orange-600 font-bold hover:underline">
                    ล้างคำค้นหา
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* News Grid Section */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</p>
              </div>
            ) : news.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                  {news.map((item) => {
                    const imgSrc = toAssetUrl(item.image_url);

                    return (
                      <Link
                        key={item.id}
                        to={`/news/${item.id}`}
                        className="group bg-white rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]
                                   hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] overflow-hidden
                                   transition-all duration-500 hover:-translate-y-2 border border-transparent
                                   hover:border-orange-100 flex flex-col h-full"
                      >
                        <div className="relative h-64 overflow-hidden bg-gray-100 rounded-t-[2.5rem] m-2 mb-0">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-t-4xl"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-50 rounded-t-4xl">
                              <Newspaper className="w-16 h-16 text-orange-200" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 rounded-t-4xl" />

                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-gray-800 flex items-center gap-1.5 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            {formatDate(item.created_at)}
                          </div>
                        </div>

                        <div className="p-8 flex flex-col grow">
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-4 group-hover:text-orange-600 transition-colors leading-relaxed">
                            {item.title}
                          </h3>

                          <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed grow font-light">
                            {item.content}
                          </p>

                          <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                            <div className="flex items-center text-gray-400 gap-2 text-xs font-medium bg-gray-50 px-3 py-1 rounded-full">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{Number(item.view_count || 0).toLocaleString()} เข้าชม</span>
                            </div>

                            <div className="flex items-center text-orange-500 font-bold text-sm group-hover:translate-x-1 transition-transform">
                              <span>อ่านต่อ</span>
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* ✅ Pagination (แบบในรูป) */}
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
                  variant="light"
                />
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-gray-100 max-w-4xl mx-auto">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-50 rounded-full mb-6">
                  <Newspaper className="w-10 h-10 text-orange-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {search ? "ไม่พบข่าวสารที่ค้นหา" : "ยังไม่มีข่าวสาร"}
                </h3>
                <p className="text-gray-500 text-lg mb-8 font-light">
                  {search ? "ลองค้นหาด้วยคำอื่นๆ" : "โปรดติดตามข่าวสารอัปเดตจากเราเร็วๆ นี้"}
                </p>
                {search && (
                  <button
                    onClick={clearSearch}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    ล้างคำค้นหา
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default NewsList;
