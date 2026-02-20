import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { albumAPI } from "../../services/api";
import { toAssetUrl } from "../../services/api";

const AlbumDetail = () => {
  const { id } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await albumAPI.getPhotos(id);
        setPhotos(res.data);
      } catch (err) {
        setError("ไม่สามารถโหลดรูปภาพได้");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [id]);

  if (loading) return <div className="text-center mt-10">กำลังโหลด...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">รูปภาพในอัลบั้ม</h1>

      {photos.length === 0 ? (
        <p>ยังไม่มีรูปภาพในอัลบั้มนี้</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-lg shadow">
              <img
                src={toAssetUrl(photo.image_url)}
                alt="album"
                className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumDetail;