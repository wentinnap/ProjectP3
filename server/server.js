const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const newsRoutes = require("./src/routes/newsRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const qnaRoutes = require("./src/routes/qnaRoutes");
const albumRoutes = require("./src/routes/albumRoutes");
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// Middleware
// =====================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ serve static uploads (สำคัญมาก)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// =====================
// Health check
// =====================
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// API Routes
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/qna", qnaRoutes);
app.use("/api/albums", albumRoutes);
app.use('/api/notifications', notificationRoutes);


// =====================
// 404 handler
// =====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// =====================
// Global error handler
// =====================
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // ✅ ถ้าเป็น error จาก multer (อัปโหลดรูป)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "ไฟล์รูปใหญ่เกิน 3MB",
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// =====================
// Start server
// =====================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🏛️  Temple Website API Server       ║
║   🚀 Server running on port ${PORT}      ║
║   🌍 Environment: ${process.env.NODE_ENV || "development"}        ║
║   📝 API: http://localhost:${PORT}        ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received, shutting down gracefully...");
  process.exit(0);
});
