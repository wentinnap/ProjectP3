import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { albumAPI, toAssetUrl } from "../../services/api";
import { BsArrowLeft } from "react-icons/bs";

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await albumAPI.getPhotosByAlbumId(id);

        // ✅ ดึงเฉพาะ array
        if (res?.data?.success) {
          setPhotos(res.data.data || []);
        } else if (Array.isArray(res?.data)) {
          setPhotos(res.data);
        } else {
          setPhotos([]);
        }
      } catch (err) {
        console.error("Error loading photos:", err);
        setError("ไม่สามารถโหลดรูปภาพได้");
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [id]);

  // ===============================
  // Loading
  // ===============================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // ===============================
  // Error
  // ===============================
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-orange-600 font-semibold hover:underline"
        >
          <BsArrowLeft />
          ย้อนกลับ
        </button>

        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          รูปภาพทั้งหมด ({photos.length})
        </h1>

        {photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.isArray(photos) &&
              photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={toAssetUrl(photo.file_path)}
                      alt="album"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            ยังไม่มีรูปภาพในอัลบั้มนี้
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetail;