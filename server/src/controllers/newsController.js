const db = require('../config/database');

// Get all news (public)
exports.getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT n.*, u.full_name as author_name 
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.is_visible = TRUE
    `;

    const queryParams = [];

    if (search) {
      query += ' AND (n.title LIKE ? OR n.content LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [news] = await db.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM news WHERE is_visible = TRUE';
    const countParams = [];

    if (search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        news,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข่าว'
    });
  }
};

// Get news by ID
exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const [news] = await db.query(
      `SELECT n.*, u.full_name as author_name 
       FROM news n
       LEFT JOIN users u ON n.author_id = u.id
       WHERE n.id = ? AND n.is_visible = TRUE`,
      [id]
    );

    if (news.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข่าวที่ต้องการ'
      });
    }

    // Increment view count
    await db.query(
      'UPDATE news SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: news[0]
    });
  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข่าว'
    });
  }
};

// Get all news for admin (including hidden)
exports.getAllNewsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', visibility = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT n.*, u.full_name as author_name 
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (visibility === 'visible') {
      query += ' AND n.is_visible = TRUE';
    } else if (visibility === 'hidden') {
      query += ' AND n.is_visible = FALSE';
    }

    if (search) {
      query += ' AND (n.title LIKE ? OR n.content LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [news] = await db.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM news WHERE 1=1';
    const countParams = [];

    if (visibility === 'visible') {
      countQuery += ' AND is_visible = TRUE';
    } else if (visibility === 'hidden') {
      countQuery += ' AND is_visible = FALSE';
    }

    if (search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        news,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all news admin error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข่าว'
    });
  }
};

// Create news
exports.createNews = async (req, res) => {
  try {
    const { title, content, image_url } = req.body;
    const author_id = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกหัวข้อและเนื้อหาข่าว'
      });
    }

    const [result] = await db.query(
      'INSERT INTO news (title, content, image_url, author_id) VALUES (?, ?, ?, ?)',
      [title, content, image_url || null, author_id]
    );

    const [news] = await db.query(
      'SELECT * FROM news WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'เพิ่มข่าวสำเร็จ',
      data: news[0]
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มข่าว'
    });
  }
};

// Update news
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image_url, is_visible } = req.body;

    // Check if news exists
    const [existingNews] = await db.query('SELECT id FROM news WHERE id = ?', [id]);

    if (existingNews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข่าวที่ต้องการแก้ไข'
      });
    }

    await db.query(
      'UPDATE news SET title = ?, content = ?, image_url = ?, is_visible = ? WHERE id = ?',
      [title, content, image_url || null, is_visible !== undefined ? is_visible : true, id]
    );

    const [news] = await db.query('SELECT * FROM news WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'แก้ไขข่าวสำเร็จ',
      data: news[0]
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขข่าว'
    });
  }
};

// Toggle news visibility
exports.toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const [news] = await db.query('SELECT is_visible FROM news WHERE id = ?', [id]);

    if (news.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข่าวที่ต้องการ'
      });
    }

    const newVisibility = !news[0].is_visible;

    await db.query('UPDATE news SET is_visible = ? WHERE id = ?', [newVisibility, id]);

    res.json({
      success: true,
      message: newVisibility ? 'แสดงข่าวแล้ว' : 'ซ่อนข่าวแล้ว',
      data: { is_visible: newVisibility }
    });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะข่าว'
    });
  }
};

// Delete news
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const [news] = await db.query('SELECT id FROM news WHERE id = ?', [id]);

    if (news.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข่าวที่ต้องการลบ'
      });
    }

    await db.query('DELETE FROM news WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'ลบข่าวสำเร็จ'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบข่าว'
    });
  }
};


exports.uploadNewsImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "กรุณาอัปโหลดไฟล์รูปภาพ",
    });
  }

  res.json({
    success: true,
    data: {
      image_url: `/uploads/news/${req.file.filename}`,
    },
  });
};
