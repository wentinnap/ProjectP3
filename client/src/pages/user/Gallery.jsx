import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { albumAPI, toAssetUrl } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Images, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react';

const Gallery = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await albumAPI.getAllUser();
        if (res?.data?.success) {
          setAlbums(res.data.data || []);
        } else if (Array.isArray(res?.data)) {
          setAlbums(res.data);
        } else {
          setAlbums([]);
        }
      } catch (err) {
        console.error("Error loading albums:", err);
        setError("ไม่สามารถโหลดอัลบั้มได้");
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
        <p className="text-orange-600 font-medium animate-pulse">กำลังเปิดคลังภาพ...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 font-sans pb-20">
        
        {/* --- ส่วนหัว (Hero Header) ตามธีม Donate --- */}
        <section className="relative pt-32 pb-32 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            {/* Blobs ตกแต่ง */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300 opacity-20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto px-4 relative z-10 text-center text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Images className="w-5 h-5 text-amber-200" />
                    <span className="text-sm font-medium tracking-wide">อัลบั้มภาพกิจกรรม</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-md">
                    ประมวลภาพกิจกรรมวัด
                </h1>
                
                <p className="text-lg md:text-xl text-orange-50 max-w-2xl mx-auto font-light leading-relaxed">
                    รวบรวมภาพความประทับใจในงานบุญและกิจกรรมต่างๆ ของทางวัด เพื่อให้ศรัทธาสาธุชนได้ร่วมอนุโมทนาบุญ
                </p>
            </div>
            
            {/* เส้นโค้ง (Curve Divider) */}
            <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1">
                <svg viewBox="0 0 1440 120" fill="none" className="w-full h-20 md:h-[120px]" preserveAspectRatio="none">
                    <path d="M0 0C240 100 480 120 720 100C960 80 1200 60 1440 90V120H0V0Z" fill="#f9fafb"/>
                </svg>
            </div>
        </section>

        {/* --- ส่วนเนื้อหา (Gallery Grid) --- */}
        <div className="container mx-auto px-4 relative z-20 -mt-10">
            {error ? (
                <div className="bg-white p-8 rounded-4xl shadow-xl text-center border border-red-100 max-w-md mx-auto">
                    <p className="text-red-500 font-semibold">{error}</p>
                </div>
            ) : albums.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {albums.map((album) => {
                        const coverUrl = album.cover_img ? toAssetUrl(album.cover_img) : null;
                        
                        return (
                            <div
                                key={album.id}
                                onClick={() => navigate(`/gallery/${album.id}`)}
                                className="group cursor-pointer bg-white rounded-[2.5rem] shadow-xl shadow-orange-500/5 border border-white overflow-hidden transform hover:-translate-y-2 transition-all duration-500"
                            >
                                {/* Thumbnail Container */}
                                <div className="aspect-4/3 overflow-hidden relative">
                                    {coverUrl ? (
                                        <img
                                            src={coverUrl}
                                            alt={album.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-200">
                                            <ImageIcon size={64} />
                                        </div>
                                    )}
                                    
                                    {/* Overlay Badge */}
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Sparkles size={12} className="text-amber-400" />
                                        ดูรูปภาพ
                                    </div>
                                    
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                        <div className="text-white flex items-center gap-2 font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <span>เข้าชมอัลบั้ม</span>
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* Album Info */}
                                <div className="p-6 relative">
                                    {/* แถบสีตกแต่ง */}
                                    <div className="absolute top-0 left-6 right-6 h-1 bg-linear-to-r from-orange-400 to-amber-400 rounded-full transform -translate-y-1/2"></div>
                                    
                                    <h2 className="font-bold text-gray-800 text-lg leading-tight mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                        {album.title}
                                    </h2>
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-400 text-sm flex items-center gap-1">
                                            <ImageIcon size={14} />
                                            <span>{album.photo_count || 0} รูปภาพ</span>
                                        </p>
                                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="max-w-2xl mx-auto text-center py-24 bg-white rounded-[3rem] shadow-xl shadow-orange-500/5 border-2 border-dashed border-orange-100">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-300">
                        <Images size={40} />
                    </div>
                    <p className="text-gray-500 font-medium text-xl">ยังไม่มีอัลบั้มภาพในขณะนี้</p>
                    <p className="text-gray-400 mt-2">โปรดติดตามภาพกิจกรรมงานบุญเร็วๆ นี้</p>
                </div>
            )}
        </div>

      </div>
      <Footer />
    </>
  );
};

export default Gallery;