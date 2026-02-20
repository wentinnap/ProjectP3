import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { albumAPI, toAssetUrl } from '../../services/api';
import { BsArrowLeft, BsImage } from 'react-icons/bs';

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [albumInfo, setAlbumInfo] = useState(null); // เพิ่ม State เก็บชื่ออัลบั้ม
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await albumAPI.getPhotos(id);
        if (res.data.success) {
          setPhotos(res.data.data);
          // ถ้า Backend ส่งชื่ออัลบั้มมาด้วยให้นำมาแสดง (ถ้ามี)
          if(res.data.album) setAlbumInfo(res.data.album);
        }
      } catch (err) {
        console.error("Error loading photos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // ฟังก์ชันดูรูปใหญ่
  const handleViewImage = (url) => {
    window.open(url, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium">กำลังเปิดคลังภาพ...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold transition-all group w-fit"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-orange-50 transition-colors">
              <BsArrowLeft size={20} />
            </div>
            ย้อนกลับ
          </button>
          
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight leading-tight">
              {albumInfo?.title || "รูปภาพกิจกรรม"}
            </h1>
            <p className="text-orange-600 font-bold">ทั้งหมด {photos.length} รูปภาพ</p>
          </div>
        </div>

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {photos.map((photo, index) => {
              const imageUrl = toAssetUrl(`${photo.file_path}`);
              return (
                <div 
                  key={photo.id || index} 
                  onClick={() => handleViewImage(imageUrl)}
                  className="group relative bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 cursor-zoom-in aspect-square transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <img 
                    src={imageUrl} 
                    alt={`คลังภาพที่ ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy" // ช่วยให้โหลดหน้าเว็บเร็วขึ้น
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-xs font-medium">คลิกเพื่อดูรูปขยาย</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl py-20 text-center border-2 border-dashed border-gray-200">
            <BsImage size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium text-lg">อัลบั้มนี้ยังไม่มีรูปภาพ</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 text-orange-600 hover:underline font-bold"
            >
              กลับไปดูอัลบั้มอื่น
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetail;