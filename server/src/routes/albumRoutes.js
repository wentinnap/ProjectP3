const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const albumController = require("../controllers/albumController");

// ==========================================
// 1. การตั้งค่า MULTER (จัดการไฟล์อัปโหลด)
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // ตรวจสอบว่ามีโฟลเดอร์ uploads ที่ root project
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์: timestamp-สุ่มตัวเลข.นามสกุลเดิม
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาด 5MB ต่อไฟล์
    fileFilter: (req, file, cb) => {
        // รับเฉพาะไฟล์รูปภาพเท่านั้น
        const fileTypes = /jpeg|jpg|png|webp/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("รองรับเฉพาะไฟล์รูปภาพ (jpg, jpeg, png, webp) เท่านั้น!"));
        }
    }
});

// ==========================================
// 2. กำหนด ROUTES
// ==========================================

// --- สำหรับ USER ทั่วไป (หน้าบ้าน) ---
// ดึงเฉพาะอัลบั้มที่ไม่ได้ซ่อน (is_hidden = 0)
router.get("/user", albumController.getAllAlbumsUser); 

// ดึงรูปภาพทั้งหมดที่อยู่ในอัลบั้มนั้นๆ (ใช้ตอนคลิกเข้าดูอัลบั้ม)
router.get("/:id/photos", albumController.getPhotosByAlbumId); 


// --- สำหรับ ADMIN (หลังบ้าน) ---
// ดึงทุกอัลบั้มรวมที่ซ่อนอยู่ เพื่อให้ Admin จัดการ
router.get("/admin", albumController.getAllAlbumsAdmin); 

// สร้างอัลบั้มใหม่พร้อมอัปโหลดรูป (สูงสุด 20 รูปต่อครั้ง)
router.post("/", upload.array("images", 20), albumController.createAlbum); 

// อัปเดตสถานะการมองเห็น (ซ่อน/แสดง)
router.patch("/:id/hide", albumController.toggleHide); 

// ลบอัลบั้ม (ลบข้อมูลใน DB และลบไฟล์จริงออกจาก Folder uploads)
router.delete("/:id", albumController.deleteAlbum); 

module.exports = router;