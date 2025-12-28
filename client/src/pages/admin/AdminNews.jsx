import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// ✅ 1. นำเข้า toAssetUrl จาก api.js
import { newsAPI, toAssetUrl } from "../../services/api";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Image as ImageIcon,
  FileText,
  Filter,
  Calendar,
  ArrowLeft,
} from "lucide-react";

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    is_visible: true,
  });

  // ❌ ลบส่วนที่เขียนเองออกให้หมดครับ เพราะเราจะใช้ toAssetUrl แทน
  /*
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
  const getImageSrc = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${SERVER_URL}${url}`;
  };
  */

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, visibility]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await newsAPI.getAllAdmin({ search, visibility });
      setNews(response.data.data.news);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข่าว");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (newsItem = null) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setFormData({
        title: newsItem.title,
        content: newsItem.content,
        image_url: newsItem.image_url || "",
        is_visible: newsItem.is_visible,
      });
    } else {
      setEditingNews(null);
      setFormData({
        title: "",
        content: "",
        image_url: "",
        is_visible: true,
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNews(null);
    setFormData({
      title: "",
      content: "",
      image_url: "",
      is_visible: true,
    });
    setImageFile(null);
    setUploading(false);
  };

  const handleUploadImage = async () => {
    if (!imageFile) return null;

    try {
      setUploading(true);
      const res = await newsAPI.uploadImage(imageFile);
      const url = res.data?.data?.image_url;
      if (!url) throw new Error("No image_url returned");
      setFormData((prev) => ({ ...prev, image_url: url }));
      return url;
    } catch (error) {
      toast.error("อัปโหลดรูปไม่สำเร็จ");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        const uploadedUrl = await handleUploadImage();
        if (!uploadedUrl) return;
        imageUrl = uploadedUrl;
      }

      const payload = {
        ...formData,
        image_url: imageUrl,
      };

      if (editingNews) {
        await newsAPI.update(editingNews.id, payload);
        toast.success("แก้ไขข่าวสำเร็จ");
      } else {
        await newsAPI.create(payload);
        toast.success("เพิ่มข่าวสำเร็จ");
      }

      handleCloseModal();
      fetchNews();
    } catch (error) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await newsAPI.toggleVisibility(id);
      toast.success("เปลี่ยนสถานะสำเร็จ");
      fetchNews();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบข่าวนี้?")) return;

    try {
      await newsAPI.delete(id);
      toast.success("ลบข่าวสำเร็จ");
      fetchNews();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Title & Back Button */}
            <div className="flex items-center gap-4">
                <Link 
                    to="/admin" 
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all active:scale-95"
                    title="กลับไปหน้าแดชบอร์ด"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-orange-500" />
                        จัดการข่าวสาร
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        เพิ่ม ลบ แก้ไข ข่าวประชาสัมพันธ์และกิจกรรมของวัด
                    </p>
                </div>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 active:scale-95 ml-auto md:ml-0"
            >
              <Plus size={20} />
              <span>เพิ่มข่าวใหม่</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาข่าวด้วยหัวข้อ..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none cursor-pointer text-gray-700"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="visible">แสดงอยู่</option>
                <option value="hidden">ซ่อนอยู่</option>
              </select>
            </div>
          </div>
        </div>

        {/* News List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
          </div>
        ) : news.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      หัวข้อข่าว
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      วันที่ลงข่าว
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {news.map((item) => {
                    // ✅ 2. เรียกใช้ toAssetUrl ตรงนี้
                    const thumbSrc = toAssetUrl(item.image_url);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-orange-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4 max-w-md">
                          <div className="flex gap-4">
                            {thumbSrc ? (
                              <img
                                src={thumbSrc}
                                alt=""
                                className="w-16 h-12 object-cover rounded-lg shadow-sm shrink-0 border border-gray-100"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0 border border-gray-200">
                                <ImageIcon size={20} />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-800 line-clamp-1 mb-1">
                                {item.title}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {item.content}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} className="text-orange-400" />
                            {formatDate(item.created_at)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {item.is_visible ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-200">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                              เผยแพร่
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                              ซ่อน
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleToggleVisibility(item.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                item.is_visible
                                  ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={item.is_visible ? "ซ่อนข่าว" : "แสดงข่าว"}
                            >
                              {item.is_visible ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>

                            <button
                              onClick={() => handleOpenModal(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="แก้ไข"
                            >
                              <Edit size={18} />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="ลบ"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข่าวสาร</h3>
            <p className="text-gray-500">ยังไม่มีข่าวสารในระบบ หรือไม่ตรงกับคำค้นหา</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {editingNews ? <Edit className="text-orange-500" /> : <Plus className="text-orange-500" />}
                {editingNews ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารใหม่"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Image Preview */}
                {formData.image_url && (
                  <div className="relative h-48 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 group">
                    {/* ✅ 3. เรียกใช้ toAssetUrl ตรงนี้ด้วย */}
                    <img
                      src={toAssetUrl(formData.image_url)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">ตัวอย่างรูปภาพปก</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพปกข่าว</label>
                  
                  <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-orange-200 transition-colors cursor-pointer text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center py-2">
                          <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                          <span className="text-sm text-gray-500">คลิกเพื่ออัปโหลดรูปภาพ</span>
                          <span className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, WEBP (ไม่เกิน 3MB)</span>
                      </div>
                  </div>

                  {uploading && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-orange-500 font-medium">
                        <div className="w-3 h-3 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                        กำลังอัปโหลดรูป...
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    หัวข้อข่าว <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800"
                    placeholder="ใส่หัวข้อข่าวที่น่าสนใจ..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    เนื้อหาข่าว <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="6"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800 resize-none"
                    placeholder="รายละเอียดข่าวสาร กิจกรรม..."
                    required
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      name="toggle"
                      id="is_visible"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 left-0"
                      style={{
                        left: formData.is_visible ? "1.5rem" : "0",
                        borderColor: formData.is_visible ? "#f97316" : "#d1d5db",
                      }}
                    />
                    <label
                      htmlFor="is_visible"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ${
                        formData.is_visible ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    ></label>
                  </div>
                  <label htmlFor="is_visible" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    เผยแพร่ข่าวทันที
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                    disabled={uploading}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-60"
                    disabled={uploading}
                  >
                    {editingNews ? "บันทึกการแก้ไข" : "เผยแพร่ข่าว"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
