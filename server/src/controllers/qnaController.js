const db = require("../config/database");

// ===== PUBLIC (pagination + search) =====
exports.getPublicQnA = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const search = (req.query.search || "").trim();
    const offset = (page - 1) * limit;

    // ✅ public: แสดงเฉพาะ "visible" และ "ตอบแล้ว"
    let whereSql = `WHERE is_visible = TRUE AND answer IS NOT NULL AND answer <> ''`;
    const params = [];

    if (search) {
      whereSql += ` AND (question LIKE ? OR answer LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // data
    const [rows] = await db.query(
      `
      SELECT id, question, answer, created_at
      FROM qna
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    // count
    const [countRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM qna
      ${whereSql}
      `,
      params
    );

    const total = Number(countRows?.[0]?.total || 0);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.json({
      success: true,
      data: {
        items: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (err) {
    console.error("getPublicQnA error:", err);
    res.status(500).json({ success: false, message: "โหลด Q&A ไม่สำเร็จ" });
  }
};

// ===== PUBLIC: user submit question =====
exports.createQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "กรุณากรอกคำถาม" });
    }

    await db.query(`INSERT INTO qna (question) VALUES (?)`, [question.trim()]);

    res.json({ success: true, message: "ส่งคำถามแล้ว" });
  } catch (err) {
    console.error("createQuestion error:", err);
    res.status(500).json({ success: false, message: "ส่งคำถามไม่สำเร็จ" });
  }
};

// ===== ADMIN =====
exports.getAllQnAAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM qna
      ORDER BY created_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getAllQnAAdmin error:", err);
    res.status(500).json({ success: false, message: "โหลดรายการแอดมินไม่สำเร็จ" });
  }
};

// ✅ admin answer (and can set visible)
exports.answerQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, is_visible } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: "กรุณากรอกคำตอบ" });
    }

    const visibleValue = typeof is_visible === "boolean" ? is_visible : true;

    const [result] = await db.query(
      `UPDATE qna SET answer=?, is_visible=? WHERE id=?`,
      [answer.trim(), visibleValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบคำถามนี้" });
    }

    res.json({ success: true, message: "ตอบคำถามแล้ว" });
  } catch (err) {
    console.error("answerQuestion error:", err);
    res.status(500).json({ success: false, message: "ตอบคำถามไม่สำเร็จ" });
  }
};

exports.toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`SELECT is_visible FROM qna WHERE id=?`, [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "ไม่พบคำถามนี้" });
    }

    const newValue = !rows[0].is_visible;

    await db.query(`UPDATE qna SET is_visible=? WHERE id=?`, [newValue, id]);

    res.json({ success: true, data: { is_visible: newValue } });
  } catch (err) {
    console.error("toggleVisibility error:", err);
    res.status(500).json({ success: false, message: "เปลี่ยนสถานะไม่สำเร็จ" });
  }
};

exports.deleteQnA = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(`DELETE FROM qna WHERE id=?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบคำถามนี้" });
    }

    res.json({ success: true, message: "ลบแล้ว" });
  } catch (err) {
    console.error("deleteQnA error:", err);
    res.status(500).json({ success: false, message: "ลบไม่สำเร็จ" });
  }
};
