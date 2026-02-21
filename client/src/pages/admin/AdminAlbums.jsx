import React, { useState, useEffect } from "react";
import { albumAPI, toAssetUrl } from "../../services/api";
import { 
  BsPlusLg, 
  BsEyeFill, 
  BsEyeSlashFill, 
  BsTrash3Fill, 
  BsImage,
  BsX,
  BsImages,
  BsCloudUpload
} from "react-icons/bs";

const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // States สำหรับสร้างอัลบั้มใหม่
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await albumAPI.getAllAdmin();
      if (res.data.success) {
        setAlbums(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching albums:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return alert("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป");

    const formData = new FormData();
    formData.append("title", title);
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setLoading(true);
      const res = await albumAPI.create(formData);
      if (res.data.success) {
        setShowModal(false);
        setTitle("");
        setSelectedFiles([]);
        fetchAlbums();
      }
    } catch (err) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างอัลบั้ม");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHide = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await albumAPI.toggleHide(id, newStatus);
      fetchAlbums(); 
    } catch (err) {
      alert("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ คุณแน่ใจหรือไม่ที่จะลบอัลบั้มนี้? รูปภาพทั้งหมดในอัลบั้มจะถูกลบถาวร")) return;
    try {
      await albumAPI.delete(id);
      fetchAlbums();
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BsImages className="text-cyan-500" size={28} />
            จัดการอัลบั้มรูปภาพ
          </h2>
          <p className="text-gray-500 text-sm font-medium">จัดการคลังภาพกิจกรรมและรูปภาพสื่อประชาสัมพันธ์</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#343d52] hover:bg-[#3e485f] text-white px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm font-bold"
        >
          <BsPlusLg strokeWidth={1} /> 
          เพิ่มอัลบั้มใหม่
        </button>
      </div>

      {/* --- Album Grid --- */}
      {loading && albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium tracking-wide">กำลังเข้าถึงคลังภาพ...</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
           <BsImage className="text-gray-200" size={64} />
           <p className="text-gray-400 font-bold">ยังไม่มีอัลบั้มรูปภาพในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album) => (
            <div 
              key={album.id} 
              className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${album.is_hidden ? 'opacity-80' : ''}`}
            >
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                  src={toAssetUrl(album.cover_img || "/placeholder.png")}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${album.is_hidden ? 'grayscale' : ''}`}
                  alt={album.title}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Image Count Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#343d52] text-[10px] font-black px-2 py-1 rounded-lg shadow-sm border border-white/50">
                   {album.photo_count || 0} PHOTOS
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-gray-800 truncate text-base mb-4 group-hover:text-cyan-600 transition-colors" title={album.title}>
                  {album.title}
                </h3>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleHide(album.id, album.is_hidden)}
                      className={`p-2.5 rounded-xl transition-all ${
                        album.is_hidden 
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                        : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
                      }`}
                      title={album.is_hidden ? "แสดงบนหน้าเว็บ" : "ซ่อนจากหน้าเว็บ"}
                    >
                      {album.is_hidden ? <BsEyeSlashFill size={16} /> : <BsEyeFill size={16} />}
                    </button>

                    <button
                      onClick={() => handleDelete(album.id)}
                      className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                      title="ลบอัลบั้ม"
                    >
                      <BsTrash3Fill size={15} />
                    </button>
                  </div>

                  <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-lg ${
                    album.is_hidden ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {album.is_hidden ? 'Private' : 'Published'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Modal: Create Album --- */}
      {showModal && (
        <div className="fixed inset-0 bg-[#343d52]/60 z-100 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BsCloudUpload className="text-cyan-500" />
                สร้างอัลบั้มใหม่
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:bg-gray-200 p-1 rounded-full transition-all">
                <BsX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateAlbum} className="p-6">
              <div className="mb-6">
                <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">ชื่อหัวข้ออัลบั้ม</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ระบุชื่ออัลบั้มกิจกรรม..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="mb-8">
                <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">อัปโหลดรูปภาพ</label>
                <div className="group border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-cyan-400 hover:bg-cyan-50/30 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="bg-cyan-100 text-cyan-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <BsImage size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-600">คลิกหรือลากรูปภาพมาวางที่นี่</p>
                  <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tighter">JPG, PNG, WEBP (เลือกได้หลายไฟล์)</p>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 py-1.5 px-4 bg-cyan-600 text-white rounded-full text-[11px] font-black shadow-lg inline-block">
                      SELECTED: {selectedFiles.length} IMAGES
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading || !title || selectedFiles.length === 0}
                  className="flex-2 py-3 bg-[#343d52] text-white rounded-xl font-bold hover:bg-[#3e485f] transition-all disabled:bg-gray-200 disabled:text-gray-400 shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : "ยืนยันการสร้าง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlbums;