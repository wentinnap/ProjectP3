import React, { useState, useEffect } from "react";
import { albumAPI, toAssetUrl } from "../../services/api";
import { toast } from "react-toastify";
import { 
  BsPlusLg, BsEyeFill, BsEyeSlashFill, BsTrash3Fill, 
  BsImage, BsX, BsImages, BsCloudUpload, BsPencilSquare 
} from "react-icons/bs";
import { Plus, Trash2, X, Image as ImageIcon, UploadCloud, Edit3, Eye, EyeOff } from "lucide-react";

const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
      toast.error("โหลดข้อมูลอัลบั้มล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (album) => {
    setCurrentAlbum(album);
    setTitle(album.title);
    setSelectedFiles([]);
    setShowEditModal(true);
    try {
      const res = await albumAPI.getPhotos(album.id);
      if (res.data.success) setExistingPhotos(res.data.data);
    } catch (err) {
      toast.error("โหลดรูปภาพล้มเหลว");
    }
  };

  const handleUpdateAlbum = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    selectedFiles.forEach(file => formData.append("images", file));

    try {
      setLoading(true);
      const res = await albumAPI.update(currentAlbum.id, formData);
      if (res.data.success) {
        toast.success("อัปเดตอัลบั้มเรียบร้อย");
        setShowEditModal(false);
        fetchAlbums();
      }
    } catch (err) {
      toast.error("แก้ไขไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("ลบรูปภาพนี้ใช่หรือไม่?")) return;
    try {
      const res = await albumAPI.deletePhoto(photoId);
      if (res.data.success) {
        setExistingPhotos(existingPhotos.filter(p => p.id !== photoId));
        toast.success("ลบรูปภาพแล้ว");
        fetchAlbums(); // อัปเดตจำนวนรูปหน้าแรก
      }
    } catch (err) {
      toast.error("ลบรูปภาพล้มเหลว");
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return toast.warning("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป");
    const formData = new FormData();
    formData.append("title", title);
    selectedFiles.forEach((file) => formData.append("images", file));
    try {
      setLoading(true);
      const res = await albumAPI.create(formData);
      if (res.data.success) {
        toast.success("สร้างอัลบั้มใหม่สำเร็จ");
        setShowModal(false);
        setTitle("");
        setSelectedFiles([]);
        fetchAlbums();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาด");
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
      toast.error("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ยืนยันการลบอัลบั้มนี้ถาวร?")) return;
    try {
      await albumAPI.delete(id);
      toast.success("ลบอัลบั้มเรียบร้อย");
      fetchAlbums();
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20 p-4 lg:p-8">
      {/* --- Page Header --- */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-2xl text-orange-600">
                <BsImages size={32} />
              </div>
              จัดการอัลบั้มรูปภาพ
            </h2>
            <p className="text-slate-500 mt-1 ml-14 font-medium">จัดการคลังภาพกิจกรรมและรูปภาพสื่อประชาสัมพันธ์วัด</p>
          </div>
          <button
            onClick={() => { setTitle(""); setSelectedFiles([]); setShowModal(true); }}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-3xl transition-all shadow-lg shadow-orange-500/25 active:scale-95 text-sm font-black tracking-wide uppercase"
          >
            <Plus size={20} strokeWidth={3} /> 
            เพิ่มอัลบั้มใหม่
          </button>
        </div>
      </div>

      {/* --- Album Grid --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {albums.map((album) => (
          <div key={album.id} className="group bg-white rounded-4xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="relative aspect-4/3 overflow-hidden">
              <img 
                src={toAssetUrl(album.cover_img || "/placeholder.png")} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={album.title} 
              />
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/20 uppercase tracking-tighter">
                {album.photo_count} Photos
              </div>
              {album.is_hidden === 1 && (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[2px]">
                   <EyeOff className="text-white/80" size={32} />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-slate-800 truncate mb-5 text-lg tracking-tight">{album.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(album)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <Edit3 size={18}/>
                  </button>
                  <button onClick={() => handleToggleHide(album.id, album.is_hidden)} className={`p-3 rounded-2xl transition-all shadow-sm ${album.is_hidden ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}>
                    {album.is_hidden ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                  <button onClick={() => handleDelete(album.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                    <Trash2 size={18}/>
                  </button>
                </div>
                <div className={`h-2 w-2 rounded-full ${album.is_hidden ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'}`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Modal: Edit Album --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-100 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Edit3 size={20} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">แก้ไขอัลบั้ม</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUpdateAlbum} className="p-8 overflow-y-auto custom-scrollbar">
              <div className="mb-8">
                <label className="text-xs font-black text-slate-400 uppercase mb-3 block tracking-widest ml-1">ชื่ออัลบั้ม</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700" 
                  required 
                />
              </div>

              <div className="mb-8">
                <label className="text-xs font-black text-slate-400 uppercase mb-4 block tracking-widest ml-1">
                  รูปภาพในอัลบั้ม ({existingPhotos.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {existingPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-[1.25rem] overflow-hidden group border-2 border-slate-100 shadow-sm">
                      <img src={toAssetUrl(photo.file_path)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                        <button 
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 active:scale-90 transition-all"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Button in Grid */}
                  <label className="aspect-square border-2 border-dashed border-slate-200 rounded-[1.25rem] flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 transition-all group text-slate-400">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-orange-100 transition-colors">
                        <Plus size={24} />
                    </div>
                    <span className="text-[10px] font-black mt-2 tracking-tighter uppercase">Add New</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
                  </label>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 animate-pulse">
                    <div className="p-2 bg-orange-500 text-white rounded-lg"><UploadCloud size={16}/></div>
                    <p className="text-xs text-orange-700 font-black">
                       มีการเลือกรูปภาพใหม่เพิ่ม {selectedFiles.length} รูป (กดบันทึกเพื่ออัปโหลด)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 sticky bottom-0 bg-white pt-4 border-t border-slate-50">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[1.25rem] font-bold hover:bg-slate-200 transition-all">ยกเลิก</button>
                <button type="submit" disabled={loading} className="flex-2 py-4 bg-orange-500 text-white rounded-[1.25rem] font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 active:scale-95 disabled:bg-slate-200 disabled:shadow-none">
                  {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal: Create New Album --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-100 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                    <UploadCloud size={20} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">สร้างอัลบั้มใหม่</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateAlbum} className="p-8">
              <div className="mb-8">
                <label className="text-xs font-black text-slate-400 uppercase mb-3 block tracking-widest ml-1">ชื่อหัวข้ออัลบั้ม</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น กิจกรรมวันอาสาฬหบูชา 2567"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <div className="mb-10">
                <label className="text-xs font-black text-slate-400 uppercase mb-3 block tracking-widest ml-1">อัปโหลดรูปภาพ</label>
                <div className="group border-3 border-dashed border-slate-100 rounded-4xl p-10 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer relative bg-slate-50/50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="bg-white text-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                    <ImageIcon size={32} />
                  </div>
                  <p className="text-sm font-black text-slate-600 tracking-tight uppercase">คลิกหรือลากรูปภาพมาวาง</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-60">JPG, PNG, WEBP (เลือกได้หลายไฟล์)</p>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-6 py-2 px-6 bg-orange-500 text-white rounded-full text-xs font-black shadow-lg shadow-orange-500/30 inline-flex items-center gap-2 animate-bounce">
                      <ImageIcon size={14}/> {selectedFiles.length} รูปที่เลือกไว้
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[1.25rem] font-bold hover:bg-slate-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading || !title || selectedFiles.length === 0}
                  className="flex-2 py-4 bg-slate-800 text-white rounded-[1.25rem] font-bold hover:bg-slate-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Plus size={18} strokeWidth={3}/> ยืนยันการสร้าง
                    </>
                  )}
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