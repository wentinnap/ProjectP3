import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { albumAPI, toAssetUrl } from "../../services/api";
import { BsArrowLeft, BsX, BsChevronLeft, BsChevronRight, BsDownload } from "react-icons/bs"; // เพิ่ม BsDownload

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [downloading, setDownloading] = useState(false); // เพิ่มสถานะการโหลด

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await albumAPI.getPhotos(id);
        if (res?.data?.success) {
          setPhotos(res.data.data || []);
        } else if (Array.isArray(res?.data)) {
          setPhotos(res.data);
        } else {
          setPhotos([]);
        }
      } catch (err) {
        setError("ไม่สามารถโหลดรูปภาพได้");
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [id]);

  // --- ฟังก์ชันดาวน์โหลดรูปภาพ ---
  const handleDownload = async (url, filename) => {
    try {
      setDownloading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("ไม่สามารถดาวน์โหลดรูปภาพได้");
    } finally {
      setDownloading(false);
    }
  };

  const showNext = useCallback((e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const showPrev = useCallback((e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const closeModal = () => setSelectedIndex(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showNext, showPrev]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-orange-600 font-semibold hover:underline">
          <BsArrowLeft /> ย้อนกลับ
        </button>

        <h1 className="text-3xl font-bold mb-6 text-gray-800">รูปภาพทั้งหมด ({photos.length})</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setSelectedIndex(index)}
              className="group relative aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
            >
              <img
                src={toAssetUrl(photo.file_path)}
                alt="album"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- Lightbox Modal --- */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 transition-all"
          onClick={closeModal}
        >
          {/* แถบเครื่องมือด้านบน (ปิด + ดาวน์โหลด) */}
          <div className="absolute top-5 right-5 z-110 flex items-center gap-4">
            <button 
              className={`text-white/70 hover:text-white transition-all flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg ${downloading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(toAssetUrl(photos[selectedIndex].file_path), `photo-${photos[selectedIndex].id}.jpg`);
              }}
              disabled={downloading}
            >
              <BsDownload size={20} />
              <span className="hidden sm:inline">{downloading ? 'กำลังโหลด...' : 'ดาวน์โหลด'}</span>
            </button>
            
            <button className="text-white/70 hover:text-white text-4xl" onClick={closeModal}>
              <BsX />
            </button>
          </div>

          <button className="absolute left-4 z-110 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition" onClick={showPrev}>
            <BsChevronLeft size={40} />
          </button>

          <div className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center">
            <img
              src={toAssetUrl(photos[selectedIndex].file_path)}
              alt="Full size"
              className="max-w-full max-h-[80vh] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
            <p className="text-white/60 mt-4 font-light">
              {selectedIndex + 1} / {photos.length}
            </p>
          </div>

          <button className="absolute right-4 z-110 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition" onClick={showNext}>
            <BsChevronRight size={40} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AlbumDetail;