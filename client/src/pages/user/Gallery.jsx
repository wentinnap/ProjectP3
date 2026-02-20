import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { albumAPI, toAssetUrl } from "../../services/api";
import { BsImages } from "react-icons/bs";

const Gallery = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await albumAPI.getAll(); // ต้องมี API นี้
        if (res.data.success) {
          setAlbums(res.data.data);
        }
      } catch (err) {
        console.error("Error loading albums:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">กำลังโหลดอัลบั้ม...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
            คลังภาพกิจกรรม
          </h1>
          <p className="text-orange-600 font-semibold mt-2">
            ทั้งหมด {albums.length} อัลบั้ม
          </p>
        </div>

        {albums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums.map((album) => {
              const coverUrl = album.cover_img
                ? toAssetUrl(album.cover_img)
                : null;

              return (
                <div
                  key={album.id}
                  onClick={() => navigate(`/gallery/${album.id}`)}
                  className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                >
                  <div className="aspect-video bg-gray-100 overflow-hidden relative">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <BsImages size={40} />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h2 className="font-bold text-gray-800 text-lg truncate">
                      {album.title}
                    </h2>
                    <p className="text-orange-600 text-sm font-semibold mt-1">
                      {album.photo_count || 0} รูปภาพ
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <BsImages size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium text-lg">
              ยังไม่มีอัลบั้มในขณะนี้
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;