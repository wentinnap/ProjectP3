import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { newsAPI, toAssetUrl } from "../../services/api";
import { toast } from "react-toastify";
import { Plus, Edit, Trash2, Eye, EyeOff, Search, X, Image as ImageIcon, FileText, Filter, Calendar, ArrowLeft } from "lucide-react";

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

      // ถ้ามีการเลือกไฟล์ใหม่ ให้จัดการอัปโหลดก่อน
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
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Top Header */}
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20}/></Link>
            <h1 className="text-xl font-bold text-gray-800">จัดการข่าวสาร</h1>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-md shadow-orange-100">
            <Plus size={18}/> เพิ่มข่าว
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none"
              placeholder="ค้นหาหัวข้อข่าว..."
              onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
            />
          </div>
          <select 
            className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-white"
            onChange={(e) => setFilters(prev => ({...prev, visibility: e.target.value}))}
          >
            <option value="all">ทั้งหมด</option>
            <option value="visible">แสดงอยู่</option>
            <option value="hidden">ซ่อนอยู่</option>
          </select>
        </div>

        {/* Data List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-gray-400">กำลังโหลด...</div>
          ) : news.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">หัวข้อ</th>
                    <th className="px-6 py-4 font-semibold">สถานะ</th>
                    <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {news.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={toAssetUrl(item.image_url) || "https://placehold.co/600x400?text=No+Image"} 
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100" 
                            alt=""
                          />
                          <div>
                            <div className="font-bold text-gray-800 line-clamp-1">{item.title}</div>
                            <div className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('th-TH')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.is_visible ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {item.is_visible ? 'เผยแพร่' : 'ซ่อน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center text-gray-400">ไม่พบข้อมูล</div>
          )}
        </div>
      </main>

      {/* Simplified Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-800">{editingNews ? 'แก้ไขข่าวสาร' : 'เพิ่มข่าวใหม่'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload Area */}
              <div className="relative group aspect-video bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                {(imageFile || formData.image_url) ? (
                  <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : toAssetUrl(formData.image_url)} 
                    className="w-full h-full object-cover" 
                    alt="preview"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="mx-auto mb-2" size={32}/>
                    <p className="text-sm">คลิกเพื่อเพิ่มรูปภาพ</p>
                  </div>
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => setImageFile(e.target.files[0])}
                  accept="image/*"
                />
              </div>

              <input 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                placeholder="หัวข้อข่าว *"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              
              <textarea 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500 h-32 resize-none"
                placeholder="เนื้อหาข่าว *"
                required
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />

              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-orange-500"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({...formData, is_visible: e.target.checked})}
                />
                <span className="text-sm font-medium text-gray-700">แสดงข่าวนี้บนเว็บไซต์</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">ยกเลิก</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-2 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-100"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
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