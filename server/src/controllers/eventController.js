const db = require("../config/database");

//
// ================== PUBLIC ==================
//

// GET events (public calendar)
exports.getAllEvents = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, description, start_date, end_date
      FROM events
      WHERE is_visible = TRUE
      ORDER BY start_date ASC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("getAllEvents error:", error);
    res.status(500).json({ success: false, message: "โหลดกิจกรรมไม่สำเร็จ" });
  }
};


//
// ================== ADMIN ==================
//

// GET all events (admin)
exports.getAllEventsAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, description, start_date, end_date, is_visible, created_at
      FROM events
      ORDER BY start_date ASC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("getAllEventsAdmin error:", error);
    res.status(500).json({ success: false, message: "โหลดกิจกรรมไม่สำเร็จ" });
  }
};

// CREATE event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, start_date, end_date, is_visible = true } = req.body;

    if (!title || !start_date) {
      return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
    }

    await db.query(
      `INSERT INTO events (title, description, start_date, end_date, is_visible)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, start_date, end_date || null, is_visible]
    );

    res.json({ success: true, message: "เพิ่มกิจกรรมสำเร็จ" });
  } catch (error) {
    console.error("createEvent error:", error);
    res.status(500).json({ success: false, message: "เพิ่มกิจกรรมไม่สำเร็จ" });
  }
};

// UPDATE event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, is_visible } = req.body;

    await db.query(
      `UPDATE events 
       SET title=?, description=?, start_date=?, end_date=?, is_visible=?
       WHERE id=?`,
      [title, description || null, start_date, end_date || null, is_visible, id]
    );

    res.json({ success: true, message: "แก้ไขกิจกรรมสำเร็จ" });
  } catch (error) {
    console.error("updateEvent error:", error);
    res.status(500).json({ success: false, message: "แก้ไขกิจกรรมไม่สำเร็จ" });
  }
};

// TOGGLE visibility
exports.toggleEventVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const [[event]] = await db.query(
      "SELECT is_visible FROM events WHERE id = ?",
      [id]
    );

    if (!event) {
      return res.status(404).json({ message: "ไม่พบกิจกรรม" });
    }

    const newStatus = !event.is_visible;

    await db.query(
      "UPDATE events SET is_visible = ? WHERE id = ?",
      [newStatus, id]
    );

    res.json({
      success: true,
      message: newStatus ? "แสดงกิจกรรมแล้ว" : "ซ่อนกิจกรรมแล้ว",
      data: { is_visible: newStatus },
    });
  } catch (error) {
    console.error("toggleEventVisibility error:", error);
    res.status(500).json({ success: false, message: "เปลี่ยนสถานะไม่สำเร็จ" });
  }
};

// DELETE event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM events WHERE id = ?", [id]);

    res.json({ success: true, message: "ลบกิจกรรมสำเร็จ" });
  } catch (error) {
    console.error("deleteEvent error:", error);
    res.status(500).json({ success: false, message: "ลบกิจกรรมไม่สำเร็จ" });
  }
};
