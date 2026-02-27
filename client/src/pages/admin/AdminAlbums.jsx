import React, { useState, useEffect } from "react";
import { albumAPI, toAssetUrl } from "../../services/api";
import { 
  BsPlusLg, BsEyeFill, BsEyeSlashFill, BsTrash3Fill, 
  BsImage, BsX, BsImages, BsCloudUpload, BsPencilSquare 
} from "react-icons/bs";

const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // States สำหรับสร้าง/แก้ไข
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [existingPhotos, setExistingPhotos] = useState([]);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await albumAPI.getAllAdmin();
      if (res.data.success) setAlbums(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- ฟังก์ชันเปิดหน้าแก้ไข ---
  const handleEditClick = async (album) => {
    setCurrentAlbum(album);
    setTitle(album.title);
    setSelectedFiles([]);
    setShowEditModal(true);
    // ดึงรูปภาพทั้งหมดในอัลบั้มนี้
    try {
      const res = await albumAPI.getPhotos(album.id);
      if (res.data.success) setExistingPhotos(res.data.data);
    } catch (err) {
      console.error("Error fetching photos:", err);
    }
  };

  // --- ฟังก์ชันบันทึกการแก้ไข (Update) ---
  const handleUpdateAlbum = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    selectedFiles.forEach(file => formData.append("images", file));

    try {
      setLoading(true);
      const res = await albumAPI.update(currentAlbum.id, formData);
      if (res.data.success) {
        setShowEditModal(false);
        fetchAlbums();
      }
    } catch (err) {
      alert("แก้ไขไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // --- ฟังก์ชันลบรูปภาพรายใบ ---
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("ลบรูปภาพนี้ใช่หรือไม่?")) return;
    try {
      const res = await albumAPI.deletePhoto(photoId);
      if (res.data.success) {
        setExistingPhotos(existingPhotos.filter(p => p.id !== photoId));
      }
    } catch (err) {
      alert("ลบรูปภาพล้มเหลว");
    }
  };

  // ... (handleCreateAlbum, handleToggleHide, handleDelete เหมือนเดิมที่คุณเขียนไว้) ...

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return alert("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป");
    const formData = new FormData();
    formData.append("title", title);
    selectedFiles.forEach((file) => formData.append("images", file));
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
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
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
    if (!window.confirm("⚠️ คุณแน่ใจหรือไม่ที่จะลบอัลบั้มนี้?")) return;
    try {
      await albumAPI.delete(id);
      fetchAlbums();
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BsImages className="text-orange-500" size={28} />
            จัดการอัลบั้มรูปภาพ
          </h2>
          <p className="text-gray-500 text-sm font-medium">จัดการคลังภาพกิจกรรมและรูปภาพสื่อประชาสัมพันธ์</p>
        </div>
        <button
          onClick={() => { setTitle(""); setSelectedFiles([]); setShowModal(true); }}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm font-bold"
        >
          <BsPlusLg strokeWidth={1} /> 
          เพิ่มอัลบั้มใหม่
        </button>
      </div>

      {/* --- Album Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album) => (
          <div key={album.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
            <div className="relative aspect-video overflow-hidden">
              <img src={toAssetUrl(album.cover_img || "/placeholder.png")} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={album.title} />
              <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm">
                {album.photo_count} PHOTOS
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 truncate mb-4">{album.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(album)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><BsPencilSquare size={16}/></button>
                  <button onClick={() => handleToggleHide(album.id, album.is_hidden)} className={`p-2 rounded-lg ${album.is_hidden ? 'bg-amber-50 text-amber-600' : 'bg-cyan-50 text-cyan-600'}`}>
                    {album.is_hidden ? <BsEyeSlashFill size={16}/> : <BsEyeFill size={16}/>}
                  </button>
                  <button onClick={() => handleDelete(album.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><BsTrash3Fill size={15}/></button>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-md ${album.is_hidden ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-600'}`}>
                  {album.is_hidden ? 'HIDDEN' : 'PUBLIC'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Modal: Edit Album --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#343d52]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BsPencilSquare className="text-orange-500" /> แก้ไขอัลบั้ม
              </h2>
              <button onClick={() => setShowEditModal(false)}><BsX size={28} /></button>
            </div>
            
            <form onSubmit={handleUpdateAlbum} className="p-6">
              <div className="mb-6">
                <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">ชื่ออัลบั้ม</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:border-orange-500" required />
              </div>

              <div className="mb-6">
                <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">รูปภาพในอัลบั้ม ({existingPhotos.length})</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {existingPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={toAssetUrl(photo.file_path)} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <BsX size={16}/>
                      </button>
                    </div>
                  ))}
                  {/* ปุ่มเพิ่มรูปใหม่ใน Grid */}
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-all">
                    <BsPlusLg className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-bold mt-1">ADD NEW</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-orange-600 font-bold mt-2 animate-pulse">
                    + มีการเลือกรูปภาพใหม่เพิ่ม {selectedFiles.length} รูป
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 border rounded-xl font-bold text-gray-500">ยกเลิก</button>
                <button type="submit" disabled={loading} className="flex-2 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg">
                  {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ... (Modal สร้างใหม่ ShowModal ส่วนเดิมของคุณ) ... */}
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