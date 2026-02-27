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
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
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
router.get("/user", albumController.getAllAlbumsUser); 
router.get("/:id/photos", albumController.getPhotosByAlbumId); 


// --- สำหรับ ADMIN (หลังบ้าน) ---
router.get("/admin", albumController.getAllAlbumsAdmin); 

// สร้างอัลบั้มใหม่
router.post("/", upload.array("images", 20), albumController.createAlbum); 

// [เพิ่มใหม่] แก้ไขชื่ออัลบั้มและอัปโหลดรูปเพิ่มเข้าไปในอัลบั้มเดิม
router.put("/:id", upload.array("images", 20), albumController.updateAlbum);

// [เพิ่มใหม่] ลบรูปภาพเฉพาะใบที่เลือกภายในอัลบั้ม
router.delete("/photo/:photoId", albumController.deletePhoto);

// อัปเดตสถานะการมองเห็น
router.patch("/:id/hide", albumController.toggleHide); 

// ลบอัลบั้มทั้งชุด
router.delete("/:id", albumController.deleteAlbum); 

module.exports = router;