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
    <div className="min-h-screen pb-10 animate-in fade-in duration-500 p-4 lg:p-8">
      {/* --- Page Header --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-cyan-100 rounded-2xl text-cyan-600">
              <Newspaper size={30} />
            </div>
            จัดการข่าวสาร
          </h2>
          <p className="text-slate-500 mt-1 ml-1 font-medium">ประชาสัมพันธ์ข่าวสารและกิจกรรมสำคัญของทางวัด</p>
        </div>

        <button 
          onClick={() => handleOpenModal()} 
          className="w-full md:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-[1.25rem] font-bold shadow-xl shadow-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> เพิ่มข่าวใหม่
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* --- Filter Bar --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={20}/>
            <input 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.25rem] text-sm focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all shadow-sm font-medium"
              placeholder="ค้นหาตามชื่อข่าว..."
              onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-[1.25rem] shadow-sm min-w-[180px]">
            <div className="p-2 bg-slate-50 rounded-xl">
              <Filter size={18} className="text-slate-400" />
            </div>
            <select 
              className="flex-1 pr-4 py-1 text-sm font-bold text-slate-600 outline-none bg-transparent cursor-pointer"
              onChange={(e) => setFilters(prev => ({...prev, visibility: e.target.value}))}
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="visible">เผยแพร่ (Public)</option>
              <option value="hidden">ซ่อน (Hidden)</option>
            </select>
          </div>
        </div>

        {/* --- Data Table --- */}
        <div className="bg-white rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden transition-all">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-12 h-12 border-[5px] border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading News...</p>
            </div>
          ) : news.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">ข้อมูลข่าวสาร</th>
                    <th className="px-8 py-5 text-center">การแสดงผล</th>
                    <th className="px-8 py-5 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {news.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative w-24 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-md ring-2 ring-white ring-offset-2 ring-offset-slate-50">
                            <img 
                              src={toAssetUrl(item.image_url) || "https://placehold.co/600x400?text=Temple+News"} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              alt={item.title}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-700 text-lg line-clamp-1 group-hover:text-cyan-600 transition-colors tracking-tight">
                              {item.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              <Calendar size={12} className="text-cyan-500" />
                              วันที่สร้าง: {new Date(item.created_at).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.is_visible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {item.is_visible ? <Eye size={12} strokeWidth={3} /> : <EyeOff size={12} strokeWidth={3} />}
                          {item.is_visible ? 'Public' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button onClick={() => handleOpenModal(item)} className="p-3 text-cyan-600 hover:bg-cyan-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95"><Edit size={18}/></button>
                          <button onClick={() => handleDelete(item.id)} className="p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-32 text-center flex flex-col items-center gap-4">
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <Newspaper size={60} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold tracking-tight">ยังไม่พบข้อมูลข่าวสารที่คุณค้นหา</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Action Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${editingNews ? 'bg-blue-100 text-blue-600' : 'bg-cyan-100 text-cyan-600'}`}>
                  <Newspaper size={20} />
                </div>
                <h2 className="font-extrabold text-slate-800 text-xl tracking-tight">
                  {editingNews ? 'แก้ไขข้อมูลข่าวสาร' : 'สร้างข่าวสารประชาสัมพันธ์ใหม่'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-all shadow-sm"><X size={20} className="text-slate-400"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Image Upload Area */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em] ml-1">รูปภาพประกอบข่าวสาร</label>
                <div className="relative group aspect-video bg-slate-50 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-cyan-400 transition-all flex flex-col items-center justify-center cursor-pointer shadow-inner">
                  {(imageFile || formData.image_url) ? (
                    <>
                      <img 
                        src={imageFile ? URL.createObjectURL(imageFile) : toAssetUrl(formData.image_url)} 
                        className="w-full h-full object-cover" 
                        alt="preview"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-xs border border-white/30">คลิกเพื่อเปลี่ยนรูปภาพ</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center group-hover:scale-110 transition-transform">
                      <div className="mx-auto mb-3 w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                        <ImageIcon size={32}/>
                      </div>
                      <p className="text-xs font-bold text-slate-500">อัปโหลดรูปภาพข่าว (อัตราส่วน 16:9)</p>
                      <p className="text-[10px] text-slate-300 font-bold uppercase mt-1 tracking-wider italic">Recommended size: 1280x720 px</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => setImageFile(e.target.files[0])}
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-[0.2em] ml-1">หัวข้อข่าวสาร</label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white transition-all text-sm font-bold text-slate-700"
                    placeholder="พิมพ์หัวข้อข่าวที่นี่..."
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-[0.2em] ml-1">เนื้อหาข่าวสาร</label>
                  <textarea 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white transition-all text-sm h-48 resize-none font-medium text-slate-600 leading-relaxed"
                    placeholder="พิมพ์รายละเอียดข่าวสารเพิ่มเติม..."
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.25rem] border border-slate-100">
                <input 
                  type="checkbox" 
                  id="news-vis"
                  className="w-6 h-6 accent-cyan-500 cursor-pointer rounded-lg shadow-sm"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({...formData, is_visible: e.target.checked})}
                />
                <div>
                   <label htmlFor="news-vis" className="text-sm font-black text-slate-700 cursor-pointer block leading-none">แสดงข่าวบนเว็บไซต์ทันที (Public)</label>
                   <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Visible to all visitors</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-50">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-[1.25rem] transition-all text-sm border border-transparent hover:border-slate-200">ยกเลิก</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-2 py-4 bg-cyan-500 text-white font-black rounded-[1.25rem] hover:bg-cyan-600 disabled:opacity-50 transition-all shadow-xl shadow-cyan-500/20 text-sm uppercase tracking-widest active:scale-[0.98]"
                >
                  {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข่าวสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default AdminNews;