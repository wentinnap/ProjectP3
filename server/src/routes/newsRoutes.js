const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const { authenticate, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/uploadNewsImage");

// =====================
// PUBLIC
// =====================
router.get("/", newsController.getAllNews);

// =====================
// ADMIN
// =====================

// ✅ แยกกลุ่ม admin ให้ชัด (ปลอดภัยกว่า)
router.get("/admin/all", authenticate, isAdmin, newsController.getAllNewsAdmin);

// ✅ upload image (ต้องอยู่ก่อน /:id เสมอ)
router.post(
  "/admin/upload-image",
  authenticate,
  isAdmin,
  upload.single("image"),
  newsController.uploadNewsImage
);

// ✅ create / update / toggle / delete
router.post("/admin", authenticate, isAdmin, newsController.createNews);
router.put("/admin/:id", authenticate, isAdmin, newsController.updateNews);
router.patch(
  "/admin/:id/toggle-visibility",
  authenticate,
  isAdmin,
  newsController.toggleVisibility
);
router.delete("/admin/:id", authenticate, isAdmin, newsController.deleteNews);

// =====================
// PUBLIC (ไว้ล่างสุด)
// =====================
router.get("/:id", newsController.getNewsById);

// =====================
// ✅ multer error handler (สำคัญ)
// =====================
router.use((err, req, res, next) => {
  // multer จะโยน error มา
  if (err) {
    const msg =
      err.code === "LIMIT_FILE_SIZE"
        ? "ไฟล์รูปใหญ่เกิน 3MB"
        : err.message || "อัปโหลดรูปไม่สำเร็จ";
    return res.status(400).json({ success: false, message: msg });
  }
  next();
});

module.exports = router;
