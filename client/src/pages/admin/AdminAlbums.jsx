import React, { useState, useEffect } from "react";
import { albumAPI, toAssetUrl } from "../../services/api";
import { 
  BsPlusLg, 
  BsEyeFill, 
  BsEyeSlashFill, 
  BsTrash3Fill, 
  BsImage 
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

  // 1. ดึงข้อมูลอัลบั้มทั้งหมด (Admin เห็นทุกอย่าง)
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await albumAPI.getAllAdmin();
      if (res.data.success) {
        setAlbums(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching albums:", err);
      alert("ไม่สามารถโหลดข้อมูลอัลบั้มได้");
    } finally {
      setLoading(false);
    }
  };

  // 2. ฟังก์ชันอัปโหลดอัลบั้มใหม่
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
        alert("สร้างอัลบั้มสำเร็จ");
        setShowModal(false);
        setTitle("");
        setSelectedFiles([]);
        fetchAlbums(); // Refresh รายการ
      }
    } catch (err) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // 3. ฟังก์ชันสลับสถานะ ซ่อน/แสดง
  const handleToggleHide = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await albumAPI.toggleHide(id, newStatus);
      fetchAlbums(); // Refresh เพื่ออัปเดต UI
    } catch (err) {
      alert("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  // 4. ฟังก์ชันลบอัลบั้ม
  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบอัลบั้มนี้และไฟล์รูปภาพทั้งหมด?")) return;
    try {
      await albumAPI.delete(id);
      fetchAlbums();
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการอัลบั้มรูปภาพ</h1>
          <p className="text-gray-500 text-sm">จัดการการแสดงผลอัลบั้มรูปภาพสำหรับหน้าเว็บไซต์</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition shadow-md"
        >
          <BsPlusLg /> เพิ่มอัลบั้มใหม่
        </button>
      </div>

      {/* Album List */}
      {loading && albums.length === 0 ? (
        <div className="text-center py-10">กำลังโหลด...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <div 
              key={album.id} 
              className={`bg-white rounded-xl shadow-sm border overflow-hidden transition ${album.is_hidden ? 'opacity-60 grayscale' : ''}`}
            >
              <div className="relative group">
                <img
                  src={toAssetUrl(`/uploads/${album.cover_img}`)}
                  className="w-full h-48 object-cover"
                  alt={album.title}
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                   {album.photo_count} รูป
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate mb-4">{album.title}</h3>
                
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex gap-2">
                    {/* ปุ่มซ่อน/แสดง */}
                    <button
                      onClick={() => handleToggleHide(album.id, album.is_hidden)}
                      className={`p-2 rounded-lg transition ${
                        album.is_hidden 
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                      title={album.is_hidden ? "แสดงรูปภาพ" : "ซ่อนรูปภาพ"}
                    >
                      {album.is_hidden ? <BsEyeSlashFill size={18} /> : <BsEyeFill size={18} />}
                    </button>

                    {/* ปุ่มลบ */}
                    <button
                      onClick={() => handleDelete(album.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      title="ลบอัลบั้ม"
                    >
                      <BsTrash3Fill size={18} />
                    </button>
                  </div>

                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    album.is_hidden ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
                  }`}>
                    {album.is_hidden ? 'ซ่อนอยู่' : 'แสดงผล'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal เพิ่มอัลบั้ม */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">สร้างอัลบั้มใหม่</h2>
            </div>
            
            <form onSubmit={handleCreateAlbum} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่ออัลบั้ม</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น กิจกรรมวันมาฆบูชา 2567"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">เลือกรูปภาพ</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-500 transition cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <BsImage className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500">คลิกเพื่อเลือกรูปภาพ (เลือกได้หลายรูป)</p>
                  {selectedFiles.length > 0 && (
                    <p className="mt-2 text-orange-600 font-bold text-sm">
                      เลือกแล้ว {selectedFiles.length} รูป
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400"
                >
                  {loading ? "กำลังบันทึก..." : "ตกลง"}
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