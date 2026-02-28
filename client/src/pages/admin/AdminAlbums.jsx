import React, { useState, useEffect } from "react";
import { albumAPI, toAssetUrl } from "../../services/api";
import { toast } from "react-toastify";
import { 
  BsImages
} from "react-icons/bs";
import { Plus, Trash2, X, Image as ImageIcon, UploadCloud, Edit3, Eye, EyeOff, FolderOpen } from "lucide-react";

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
        fetchAlbums();
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
    <div className="min-h-screen bg-[#FDFCFB] pb-20 p-4 md:p-6 lg:p-8">
      {/* --- Page Header --- */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 shrink-0">
              <BsImages className="text-2xl sm:text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                จัดการอัลบั้มรูปภาพ
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">จัดการคลังภาพกิจกรรมและรูปภาพสื่อประชาสัมพันธ์</p>
            </div>
          </div>
          <button
            onClick={() => { setTitle(""); setSelectedFiles([]); setShowModal(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl sm:rounded-3xl transition-all shadow-lg shadow-orange-500/25 active:scale-95 text-sm font-black uppercase"
          >
            <Plus size={20} strokeWidth={3} /> 
            เพิ่มอัลบั้มใหม่
          </button>
        </div>
      </div>

      {/* --- Album Grid & Empty State --- */}
      <div className="max-w-7xl mx-auto">
        {loading && albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
             <p className="font-bold uppercase tracking-widest text-xs">กำลังโหลดข้อมูล...</p>
          </div>
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {albums.map((album) => (
              <div key={album.id} className="group bg-white rounded-3xl sm:rounded-4xl shadow-md sm:shadow-xl shadow-slate-200/50 border border-white overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-video sm:aspect-4/3 overflow-hidden">
                  <img 
                    src={toAssetUrl(album.cover_img || "/placeholder.png")} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={album.title} 
                  />
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full border border-white/20 uppercase">
                    {album.photo_count} Photos
                  </div>
                  {album.is_hidden === 1 && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[2px]">
                       <EyeOff className="text-white/80" size={32} />
                    </div>
                  )}
                </div>
                
                <div className="p-4 sm:p-6">
                  <h3 className="font-bold text-slate-800 truncate mb-4 sm:mb-5 text-base sm:text-lg tracking-tight">{album.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(album)} className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <Edit3 size={16}/>
                      </button>
                      <button onClick={() => handleToggleHide(album.id, album.is_hidden)} className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all shadow-sm ${album.is_hidden ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}>
                        {album.is_hidden ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                      <button onClick={() => handleDelete(album.id)} className="p-2.5 sm:p-3 bg-red-50 text-red-500 rounded-xl sm:rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${album.is_hidden ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500">
            <div className="p-6 bg-slate-50 rounded-full mb-6">
              <FolderOpen size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">ไม่พบอัลบั้มรูปภาพ</h3>
            <p className="text-slate-500 text-sm mb-8 text-center max-w-xs font-medium">
              คุณยังไม่มีอัลบั้มรูปภาพในขณะนี้ เริ่มต้นสร้างอัลบั้มแรกของคุณได้เลย
            </p>
            <button
              onClick={() => { setTitle(""); setSelectedFiles([]); setShowModal(true); }}
              className="flex items-center gap-2 bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-lg text-sm"
            >
              <Plus size={18} /> สร้างอัลบั้มแรกของคุณ
            </button>
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      {(showEditModal || showModal) && (
        <div className="fixed inset-0 bg-slate-900/70 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-t-4xl sm:rounded-[2.5rem] w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${showEditModal ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'} rounded-xl`}>
                    {showEditModal ? <Edit3 size={20} /> : <UploadCloud size={20} />}
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 uppercase tracking-tight">
                  {showEditModal ? "แก้ไขอัลบั้ม" : "สร้างอัลบั้มใหม่"}
                </h2>
              </div>
              <button onClick={() => { setShowEditModal(false); setShowModal(false); }} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"><X size={24} /></button>
            </div>

            {/* Modal Content */}
            <form onSubmit={showEditModal ? handleUpdateAlbum : handleCreateAlbum} className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              <div className="mb-6">
                <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest ml-1">ชื่ออัลบั้ม / หัวข้อกิจกรรม</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-[1.25rem] outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 text-sm sm:text-base" 
                  required 
                  placeholder="ระบุชื่ออัลบั้ม..."
                />
              </div>

              {showEditModal ? (
                <div className="mb-6">
                  <label className="text-xs font-black text-slate-400 uppercase mb-4 block tracking-widest ml-1">
                    รูปภาพในอัลบั้ม ({existingPhotos.length})
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
                    {existingPhotos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg sm:rounded-[1.25rem] overflow-hidden group border-2 border-slate-100 shadow-sm">
                        <img src={toAssetUrl(photo.file_path)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="album-photo" />
                        <div className="absolute inset-0 bg-black/20 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-1 sm:p-2">
                          <button 
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="bg-red-500 text-white p-1.5 sm:p-2 rounded-lg shadow-lg hover:bg-red-600 active:scale-90 transition-all"
                          >
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-slate-200 rounded-lg sm:rounded-[1.25rem] flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 transition-all group text-slate-400">
                      <Plus size={20} />
                      <span className="text-[8px] sm:text-[10px] font-black mt-1 uppercase">เพิ่มรูป</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <label className="text-xs font-black text-slate-400 uppercase mb-3 block tracking-widest ml-1">อัปโหลดรูปภาพ</label>
                  <div className="group border-3 border-dashed border-slate-100 rounded-3xl sm:rounded-4xl p-6 sm:p-10 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer relative bg-slate-50/50">
                    <input
                      type="file" multiple accept="image/*"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="bg-white text-orange-500 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                      <ImageIcon size={24} className="sm:hidden" />
                      <ImageIcon size={32} className="hidden sm:block" />
                    </div>
                    <p className="text-xs sm:text-sm font-black text-slate-600 tracking-tight uppercase">คลิกหรือลากรูปภาพมาวาง</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-60">JPG, PNG, WEBP (เลือกได้หลายไฟล์)</p>
                  </div>
                </div>
              )}

              {/* Selection Notification */}
              {selectedFiles.length > 0 && (
                <div className="mb-6 p-3 sm:p-4 bg-orange-50 border border-orange-100 rounded-xl sm:rounded-2xl flex items-center gap-3 animate-pulse">
                  <div className="p-2 bg-orange-500 text-white rounded-lg shrink-0"><UploadCloud size={16}/></div>
                  <p className="text-[10px] sm:text-xs text-orange-700 font-black">
                      มีการเลือกรูปภาพใหม่ {selectedFiles.length} รูป (กดบันทึกเพื่ออัปโหลด)
                  </p>
                  <button type="button" onClick={() => setSelectedFiles([])} className="ml-auto text-orange-400 hover:text-orange-600"><X size={16}/></button>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sticky bottom-0 bg-white pt-4 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => { setShowEditModal(false); setShowModal(false); }} 
                  className="order-2 sm:order-1 flex-1 py-3 sm:py-4 bg-slate-100 text-slate-600 rounded-xl sm:rounded-[1.25rem] font-bold hover:bg-slate-200 transition-all text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={loading || (showModal && (!title || selectedFiles.length === 0))} 
                  className="order-1 sm:order-2 flex-2 py-3 sm:py-4 bg-slate-800 text-white rounded-xl sm:rounded-[1.25rem] font-bold hover:bg-slate-700 transition-all shadow-lg active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    showEditModal ? "บันทึกการเปลี่ยนแปลง" : "ยืนยันการสร้างอัลบั้ม"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Custom CSS for Scrollbar */}
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default AdminAlbums;