const db = require("../config/database");
const fs = require("fs");
const path = require("path");

// ==========================================
// สำหรับ ADMIN
// ==========================================

// 1. สร้างอัลบั้มใหม่และอัปโหลดรูป
exports.createAlbum = async (req, res) => {
    try {
        const { title } = req.body;
        const files = req.files;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุชื่ออัลบั้ม"
            });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป"
            });
        }

        // สร้างอัลบั้ม
        const [albumResult] = await db.query(
            "INSERT INTO albums (title) VALUES (?)",
            [title]
        );

        const albumId = albumResult.insertId;

        // เตรียมข้อมูลรูปภาพ (เก็บแบบ /uploads/filename.jpg)
        const photoData = files.map(file => [
            albumId,
            `/uploads/${file.filename}`
        ]);

        await db.query(
            "INSERT INTO album_photos (album_id, file_path) VALUES ?",
            [photoData]
        );

        res.status(201).json({
            success: true,
            message: "สร้างอัลบั้มและอัปโหลดรูปเรียบร้อย"
        });

    } catch (error) {
        console.error("Create Album Error:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการสร้างอัลบั้ม"
        });
    }
};


// 2. ดึงอัลบั้มทั้งหมด (Admin เห็นทุกอย่าง)
exports.getAllAlbumsAdmin = async (req, res) => {
    try {
        const sql = `
            SELECT a.*, 
            (SELECT file_path FROM album_photos WHERE album_id = a.id LIMIT 1) as cover_img,
            (SELECT COUNT(*) FROM album_photos WHERE album_id = a.id) as photo_count
            FROM albums a 
            ORDER BY a.created_at DESC
        `;

        const [albums] = await db.query(sql);

        res.json({
            success: true,
            data: albums
        });

    } catch (error) {
        console.error("Get Admin Albums Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 3. ซ่อนหรือแสดงอัลบั้ม
exports.toggleHide = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_hidden } = req.body;

        await db.query(
            "UPDATE albums SET is_hidden = ? WHERE id = ?",
            [is_hidden, id]
        );

        res.json({
            success: true,
            message: "อัปเดตสถานะการมองเห็นแล้ว"
        });

    } catch (error) {
        console.error("Toggle Hide Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 4. ลบอัลบั้มและลบไฟล์จริงออกจากเครื่อง
exports.deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;

        // ดึงรูปทั้งหมดก่อนลบ
        const [photos] = await db.query(
            "SELECT file_path FROM album_photos WHERE album_id = ?",
            [id]
        );

        // ลบไฟล์จริงในเครื่อง
        photos.forEach(photo => {
            if (!photo.file_path) return;

            // ตัด /uploads/ ออกให้เหลือแค่ชื่อไฟล์
            const filename = path.basename(photo.file_path);
            const filePath = path.join(__dirname, "../../uploads", filename);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        // ลบข้อมูลใน DB (album_photos จะถูกลบถ้าตั้ง foreign key cascade)
        await db.query("DELETE FROM albums WHERE id = ?", [id]);

        res.json({
            success: true,
            message: "ลบอัลบั้มและไฟล์รูปภาพสำเร็จ"
        });

    } catch (error) {
        console.error("Delete Album Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// สำหรับ USER (หน้าบ้าน)
// ==========================================

// 5. ดึงเฉพาะอัลบั้มที่ไม่ได้ซ่อน
exports.getAllAlbumsUser = async (req, res) => {
    try {
        const sql = `
            SELECT a.*, 
            (SELECT file_path FROM album_photos WHERE album_id = a.id LIMIT 1) as cover_img,
            (SELECT COUNT(*) FROM album_photos WHERE album_id = a.id) as photo_count
            FROM albums a 
            WHERE a.is_hidden = 0
            ORDER BY a.created_at DESC
        `;

        const [albums] = await db.query(sql);

        res.json({
            success: true,
            data: albums
        });

    } catch (error) {
        console.error("Get User Albums Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 6. ดึงรูปภาพทั้งหมดในอัลบั้ม
exports.getPhotosByAlbumId = async (req, res) => {
    try {
        const { id } = req.params;

        const [photos] = await db.query(
            "SELECT * FROM album_photos WHERE album_id = ?",
            [id]
        );

        res.json({
            success: true,
            data: photos
        });

    } catch (error) {
        console.error("Get Photos Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};