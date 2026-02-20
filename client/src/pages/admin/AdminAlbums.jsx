import React, { useState, useEffect } from "react";
import { albumAPI, toAssetUrl } from "../../services/api";
import { 
  BsPlusLg, 
  BsEyeFill, 
  BsEyeSlashFill, 
  BsTrash3Fill, 
  BsImage,
  BsX
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
      // ไม่ใช้ alert เพื่อให้ UI ไม่โดนขัดจังหวะ แต่แสดงผ่าน Console หรือ Toast ในอนาคต
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
      // API คาดหวัง 0 (แสดง) หรือ 1 (ซ่อน)
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
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">จัดการอัลบั้มรูปภาพ</h1>
          <p className="text-gray-500 text-sm mt-1">อัปโหลดกิจกรรมและจัดการคลังภาพหน้าเว็บไซต์</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-95"
        >
          <BsPlusLg strokeWidth={1} /> 
          <span className="font-bold">เพิ่มอัลบั้มใหม่</span>
        </button>
      </div>

      {/* Album Grid */}
      {loading && albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 font-medium">กำลังโหลดข้อมูลคลังภาพ...</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
           <BsImage className="mx-auto text-gray-300 mb-4" size={48} />
           <p className="text-gray-500">ยังไม่มีอัลบั้มรูปภาพในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album) => (
            <div 
              key={album.id} 
              className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl ${album.is_hidden ? 'opacity-75' : ''}`}
            >
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                  src={toAssetUrl(album.cover_img ? `/uploads/${album.cover_img}` : '/placeholder.png')}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${album.is_hidden ? 'grayscale' : ''}`}
                  alt={album.title}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                   {album.photo_count || 0} รูปภาพ
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-gray-800 truncate text-lg mb-4" title={album.title}>
                  {album.title}
                </h3>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleHide(album.id, album.is_hidden)}
                      className={`p-2.5 rounded-xl transition-colors ${
                        album.is_hidden 
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                      title={album.is_hidden ? "แสดงบนหน้าเว็บ" : "ซ่อนจากหน้าเว็บ"}
                    >
                      {album.is_hidden ? <BsEyeSlashFill size={18} /> : <BsEyeFill size={18} />}
                    </button>

                    <button
                      onClick={() => handleDelete(album.id)}
                      className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                      title="ลบอัลบั้ม"
                    >
                      <BsTrash3Fill size={17} />
                    </button>
                  </div>

                  <span className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full ${
                    album.is_hidden ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                  }`}>
                    {album.is_hidden ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Album */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-extrabold text-gray-800">สร้างอัลบั้มใหม่</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <BsX size={28} />
              </button>
            </div>
            
            <form onSubmit={handleCreateAlbum} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อหัวข้ออัลบั้ม</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ประมวลภาพงานบุญประจำปี..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">อัปโหลดรูปภาพ</label>
                <div className="group border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <BsImage size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-600">กดที่นี่เพื่อเลือกรูปภาพ</p>
                  <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG (เลือกได้หลายไฟล์)</p>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 p-2 bg-orange-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-orange-200">
                      เลือกแล้ว {selectedFiles.length} รูปภาพ
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading || !title || selectedFiles.length === 0}
                  className="flex-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:shadow-none shadow-lg shadow-orange-200"
                >
                  {loading ? "กำลังประมวลผล..." : "ยืนยันการสร้าง"}
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