import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { albumAPI, toAssetUrl } from '../../services/api';
import { BsArrowLeft } from 'react-icons/bs';

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const res = await albumAPI.getPhotos(id);
        if (res.data.success) {
          setPhotos(res.data.data);
        }
      } catch (err) {
        console.error("Error loading photos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPhotos();
  }, [id]);

  if (loading) return <div className="text-center py-20">กำลังโหลดรูปภาพ...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ปุ่มย้อนกลับ */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold mb-6 transition"
      >
        <BsArrowLeft size={20} /> ย้อนกลับไปหน้าอัลบั้ม
      </button>

      <h1 className="text-2xl font-bold mb-8 text-gray-800 border-l-4 border-orange-500 pl-4">
        รูปภาพทั้งหมด ({photos.length} รูป)
      </h1>

      {/* Grid แสดงรูปภาพแบบเรียบง่าย */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="group relative bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
          >
            <img 
              src={toAssetUrl(`/uploads/${photo.file_path}`)} 
              alt="กิจกรรม"
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay บางๆ เวลา Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-20 text-gray-500">ยังไม่มีรูปภาพในอัลบั้มนี้</div>
      )}
    </div>
  );
};

export default AlbumDetail;