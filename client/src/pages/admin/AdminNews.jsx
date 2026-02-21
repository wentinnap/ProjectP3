import { useEffect, useState } from "react";
import { newsAPI, toAssetUrl } from "../../services/api";
import { toast } from "react-toastify";
import { 
  Plus, Edit, Trash2, Search, X, 
  Image as ImageIcon, Newspaper, Filter 
} from "lucide-react";

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  
  // Search & Filter State
  const [filters, setFilters] = useState({ search: "", visibility: "all" });

  // Form State
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
        toast.success("แก้ไขเรียบร้อย");
      } else {
        await newsAPI.create(payload);
        toast.success("เพิ่มข่าวใหม่แล้ว");
      }

      setShowModal(false);
      fetchNews();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ต้องการลบข่าวนี้ใช่หรือไม่?")) return;
    try {
      await newsAPI.delete(id);
      toast.success("ลบสำเร็จ");
      fetchNews();
    } catch (error) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Newspaper className="text-cyan-500" size={28} />
            จัดการข่าวสาร
          </h2>
          <p className="text-gray-500 text-sm">อัปเดตข่าวประชาสัมพันธ์และกิจกรรมล่าสุดของวัด</p>
        </div>

        <button 
          onClick={() => handleOpenModal()} 
          className="w-full md:w-auto px-6 py-2.5 bg-[#343d52] hover:bg-[#3e485f] text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20}/> เพิ่มข่าวใหม่
        </button>
      </div>

      {/* --- Filter Bar --- */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={18}/>
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
            placeholder="ค้นหาหัวข้อข่าว..."
            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl">
            <Filter size={16} className="ml-2 text-gray-400" />
            <select 
                className="pr-4 py-1.5 text-sm font-bold text-gray-600 outline-none bg-transparent cursor-pointer"
                onChange={(e) => setFilters(prev => ({...prev, visibility: e.target.value}))}
            >
                <option value="all">ทั้งหมด</option>
                <option value="visible">เผยแพร่แล้ว</option>
                <option value="hidden">ซ่อนอยู่</option>
            </select>
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">กำลังโหลดข่าวสาร...</p>
          </div>
        ) : news.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">เนื้อหาข่าวสาร</th>
                  <th className="px-6 py-4 text-center">สถานะ</th>
                  <th className="px-6 py-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                            <img 
                                src={toAssetUrl(item.image_url) || "https://placehold.co/600x400?text=News"} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                alt=""
                            />
                        </div>
                        <div>
                          <div className="font-bold text-gray-700 line-clamp-1 group-hover:text-cyan-600 transition-colors">{item.title}</div>
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                            สร้างเมื่อ: {new Date(item.created_at).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.is_visible ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.is_visible ? 'Public' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(item)} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <Newspaper size={48} className="text-gray-200" />
            <p className="text-gray-400 font-medium">ไม่พบข้อมูลข่าวสาร</p>
          </div>
        )}
      </div>

      {/* --- Action Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-[#343d52]/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800 text-lg">{editingNews ? 'แก้ไขข่าวสาร' : 'สร้างข่าวใหม่'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-400"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload Area */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">รูปภาพหน้าปก</label>
                <div className="relative group aspect-21/9 bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-cyan-300 transition-all flex flex-col items-center justify-center cursor-pointer">
                    {(imageFile || formData.image_url) ? (
                    <img 
                        src={imageFile ? URL.createObjectURL(imageFile) : toAssetUrl(formData.image_url)} 
                        className="w-full h-full object-cover" 
                        alt="preview"
                    />
                    ) : (
                    <div className="text-center text-gray-400">
                        <ImageIcon className="mx-auto mb-2 text-gray-300" size={40}/>
                        <p className="text-xs font-bold">อัปโหลดรูปภาพข่าว (1200 x 600 px)</p>
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

              <div className="space-y-4">
                <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block tracking-widest">หัวข้อข่าวสาร</label>
                    <input 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-cyan-500 focus:bg-white transition-all text-sm font-medium"
                        placeholder="พิมพ์หัวข้อข่าวที่นี่..."
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>
                
                <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block tracking-widest">เนื้อหาข่าวอย่างย่อ</label>
                    <textarea 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-cyan-500 focus:bg-white transition-all text-sm h-32 resize-none"
                        placeholder="เขียนรายละเอียดข่าวสาร..."
                        required
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                    />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <input 
                  type="checkbox" 
                  id="news-vis"
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({...formData, is_visible: e.target.checked})}
                />
                <label htmlFor="news-vis" className="text-sm font-bold text-gray-600 cursor-pointer">แสดงข่าวนี้บนหน้าเว็บไซต์ทันที</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm">ยกเลิก</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-2 py-3 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition-all shadow-lg shadow-cyan-100 text-sm"
                >
                  {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข่าวสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;