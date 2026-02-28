import { useEffect, useState } from "react";
import { newsAPI, toAssetUrl } from "../../services/api";
import { toast } from "react-toastify";
import { 
  Plus, Edit, Trash2, Search, X, 
  Image as ImageIcon, Newspaper, Filter, Eye, EyeOff, Calendar
} from "lucide-react";

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  
  const [filters, setFilters] = useState({ search: "", visibility: "all" });
  const [formData, setFormData] = useState({ title: "", content: "", image_url: "", is_visible: true });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [filters]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await newsAPI.getAllAdmin(filters);
      setNews(response.data.data.news);
    } catch (error) {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingNews(item);
    setFormData(item ? { ...item } : { title: "", content: "", image_url: "", is_visible: true });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image_url;
      if (imageFile) {
        const res = await newsAPI.uploadImage(imageFile);
        finalImageUrl = res.data?.data?.image_url;
      }
      const payload = { ...formData, image_url: finalImageUrl };
      if (editingNews) {
        await newsAPI.update(editingNews.id, payload);
        toast.success("อัปเดตข่าวสารเรียบร้อย");
      } else {
        await newsAPI.create(payload);
        toast.success("สร้างข่าวสารใหม่เรียบร้อย");
      }
      setShowModal(false);
      fetchNews();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ยืนยันการลบข่าวสารนี้? ข้อมูลจะไม่สามารถกู้คืนได้")) return;
    try {
      await newsAPI.delete(id);
      toast.success("ลบข่าวเรียบร้อย");
      fetchNews();
    } catch (error) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-500 p-3 md:p-6 lg:p-8">
      {/* --- Page Header --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 md:p-3 bg-cyan-100 rounded-2xl text-cyan-600 shadow-sm">
            <Newspaper className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              จัดการข่าวสาร
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium">ประชาสัมพันธ์ข่าวสารและกิจกรรมสำคัญของทางวัด</p>
          </div>
        </div>

        <button 
          onClick={() => handleOpenModal()} 
          className="w-full md:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-[1.25rem] font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={3} /> เพิ่มข่าวใหม่
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* --- Filter Bar --- */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={18}/>
            <input 
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all shadow-sm font-medium"
              placeholder="ค้นหาตามชื่อข่าว..."
              onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm sm:min-w-[200px]">
            <div className="p-2 bg-slate-50 rounded-xl">
              <Filter size={16} className="text-slate-400" />
            </div>
            <select 
              className="flex-1 pr-4 py-1 text-sm font-bold text-slate-600 outline-none bg-transparent cursor-pointer"
              onChange={(e) => setFilters(prev => ({...prev, visibility: e.target.value}))}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="visible">Public</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        {/* --- Data Display --- */}
        <div className="bg-white rounded-3xl md:rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 md:py-32 gap-4">
              <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading...</p>
            </div>
          ) : news.length > 0 ? (
            <div className="overflow-x-auto">
              {/* Table version for desktop, Card-like for mobile via CSS if needed, 
                  but here we use a responsive-friendly table */}
              <table className="w-full text-left min-w-[600px] md:min-w-full">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-wider font-black border-b border-slate-100">
                  <tr>
                    <th className="px-5 md:px-8 py-4">ข้อมูลข่าวสาร</th>
                    <th className="px-5 md:px-8 py-4 text-center w-32">การแสดงผล</th>
                    <th className="px-5 md:px-8 py-4 text-right w-32">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {news.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 md:px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-12 md:w-24 md:h-16 rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-sm ring-2 ring-white ring-offset-1 ring-offset-slate-100">
                            <img 
                              src={toAssetUrl(item.image_url) || "https://placehold.co/600x400?text=News"} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              alt={item.title}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-700 text-sm md:text-lg line-clamp-1 group-hover:text-cyan-600 transition-colors tracking-tight">
                              {item.title}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] md:text-[11px] font-bold text-slate-400 uppercase">
                              <Calendar size={10} className="text-cyan-500" />
                              {new Date(item.created_at).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 md:px-8 py-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider ${
                          item.is_visible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {item.is_visible ? <Eye size={10} strokeWidth={3} /> : <EyeOff size={10} strokeWidth={3} />}
                          <span className="hidden sm:inline ml-1">{item.is_visible ? 'Public' : 'Hidden'}</span>
                        </span>
                      </td>
                      <td className="px-5 md:px-8 py-5 text-right">
                        <div className="flex justify-end gap-1.5 md:gap-2.5">
                          <button onClick={() => handleOpenModal(item)} className="p-2 md:p-3 text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all active:scale-90"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 md:p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <Newspaper size={48} className="text-slate-200" />
              <p className="text-slate-400 font-bold text-sm">ยังไม่พบข้อมูลข่าวสาร</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Action Modal (Responsive) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-t-4xl sm:rounded-[2.5rem] w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 flex flex-col">
            
            <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${editingNews ? 'bg-blue-100 text-blue-600' : 'bg-cyan-100 text-cyan-600'}`}>
                  <Newspaper size={18} />
                </div>
                <h2 className="font-extrabold text-slate-800 text-lg md:text-xl tracking-tight">
                  {editingNews ? 'แก้ไขข่าวสาร' : 'สร้างข่าวสารใหม่'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20} className="text-slate-400"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 md:space-y-6 overflow-y-auto custom-scrollbar flex-1 text-left">
              {/* Image Upload Area */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest ml-1">รูปภาพประกอบ</label>
                <div className="relative group aspect-video bg-slate-50 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-cyan-400 transition-all flex flex-col items-center justify-center cursor-pointer">
                  {(imageFile || formData.image_url) ? (
                    <>
                      <img 
                        src={imageFile ? URL.createObjectURL(imageFile) : toAssetUrl(formData.image_url)} 
                        className="w-full h-full object-cover" 
                        alt="preview"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">เปลี่ยนรูปภาพ</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon size={32} className="mx-auto mb-2 text-slate-300"/>
                      <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">อัปโหลดรูปภาพ (16:9)</p>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest ml-1">หัวข้อข่าว</label>
                  <input 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white transition-all text-sm font-bold text-slate-700"
                    placeholder="หัวข้อข่าวสาร..."
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest ml-1">รายละเอียดเนื้อหา</label>
                  <textarea 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white transition-all text-sm h-32 md:h-48 resize-none font-medium text-slate-600 leading-relaxed"
                    placeholder="พิมพ์เนื้อหาข่าวสารที่นี่..."
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer group hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-cyan-500 rounded-md shadow-sm"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({...formData, is_visible: e.target.checked})}
                />
                <span className="text-xs font-black text-slate-700 uppercase tracking-tight">เผยแพร่ทันที (Public)</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-50 pb-4">
                <button type="button" onClick={() => setShowModal(false)} className="order-2 sm:order-1 flex-1 py-4 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all">ยกเลิก</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="order-1 sm:order-2 flex-2 py-4 bg-cyan-500 text-white font-black rounded-2xl hover:bg-cyan-600 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20 text-sm uppercase tracking-widest"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @media (max-width: 640px) {
            .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        }
      `}</style>
    </div>
  );
};

export default AdminNews;