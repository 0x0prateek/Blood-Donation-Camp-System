const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, dataTablePaging } = require('../utils/functions');

// POST /api/camps/list
router.post('/list', authMiddleware, async (req, res) => {
  try {
    const draw = parseInt(req.body.draw) || 1;
    const { start, length } = dataTablePaging(req);
    const searchValue = sanitize(req.body.search?.value || '');
    
    let orderColIdx = 0;
    let orderDir = 'DESC';
    if (req.body.order && req.body.order[0]) {
       orderColIdx = parseInt(req.body.order[0].column) || 0;
       orderDir = (req.body.order[0].dir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    }
    
    const columns = ['title', 'camp_date', 'start_time', 'location', 'status', 'id'];
    const orderColumn = columns[orderColIdx] || 'camp_date';
    const filter = req.body.filter || '';

    let whereClauses = [];
    let queryParams = [];

    if (searchValue) {
      const searchCols = ['title', 'location', 'description'];
      const clauses = searchCols.map(col => `${col} LIKE ?`);
      whereClauses.push(`(${clauses.join(' OR ')})`);
      const sp = `%${searchValue}%`;
      queryParams.push(sp, sp, sp);
    }

    if (filter === 'upcoming') {
      whereClauses.push("camp_date >= CURDATE() AND status = 'Upcoming'");
    } else if (filter === 'past') {
      whereClauses.push("(camp_date < CURDATE() OR status IN ('Completed','Cancelled'))");
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM blood_camps');
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM blood_camps ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM blood_camps ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: filtered,
      data
    });
  } catch (error) {
    console.error('Camp list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/camps/save
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.body.id) || 0;
    const title = sanitize(req.body.title);
    const camp_date = sanitize(req.body.camp_date);
    const start_time = req.body.start_time || null;
    const end_time = req.body.end_time || null;
    const location = sanitize(req.body.location);
    const description = sanitize(req.body.description);
    const status = sanitize(req.body.status) || 'Upcoming';

    if (!title || !camp_date || !location) {
      return sendJsonResponse(res, false, 'Required fields missing', {}, 400);
    }

    if (id > 0) {
      await pool.execute(
        `UPDATE blood_camps SET title=?, camp_date=?, start_time=?, end_time=?, location=?, description=?, status=? WHERE id=?`,
        [title, camp_date, start_time, end_time, location, description, status, id]
      );
      return sendJsonResponse(res, true, 'Camp updated successfully');
    } else {
      await pool.execute(
        `INSERT INTO blood_camps (title, camp_date, start_time, end_time, location, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, camp_date, start_time, end_time, location, description, status]
      );
      return sendJsonResponse(res, true, 'Camp added successfully');
    }
  } catch (error) {
    console.error('Camp save error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/camps/delete
router.post('/delete', authMiddleware, async (req, res) => {
  const id = parseInt(req.body.id);
  if (!id) return sendJsonResponse(res, false, 'Invalid ID', {}, 400);

  try {
    await pool.execute('DELETE FROM blood_camps WHERE id = ?', [id]);
    return sendJsonResponse(res, true, 'Camp deleted successfully');
  } catch (error) {
    console.error('Camp delete error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/camps/budget-save
router.post('/budget-save', authMiddleware, async (req, res) => {
  const camp_id = parseInt(req.body.camp_id);
  const budget_amount = parseFloat(req.body.budget_amount) || 0;

  if (!camp_id || budget_amount < 0) {
    return sendJsonResponse(res, false, 'Invalid parameters', {}, 400);
  }

  try {
    await pool.execute('UPDATE blood_camps SET budget_amount = ? WHERE id = ?', [budget_amount, camp_id]);
    return sendJsonResponse(res, true, 'Budget updated successfully');
  } catch (error) {
    console.error('Budget save error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

module.exports = router;
