const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, dataTablePaging, normalizeMobile } = require('../utils/functions');

// POST /api/staff/list
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
    const columns = ['name', 'mobile', 'status', 'id'];
    const orderColumn = columns[orderColIdx] || 'id';

    let whereClauses = [];
    let queryParams = [];

    if (searchValue) {
      whereClauses.push('(name LIKE ? OR mobile LIKE ?)');
      queryParams.push(`%${searchValue}%`, `%${searchValue}%`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM staff');
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM staff ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM staff ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    res.json({ draw, recordsTotal: total, recordsFiltered: filtered, data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/staff/save
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.body.id) || 0;
    const name = sanitize(req.body.name);
    const mobile = normalizeMobile(sanitize(req.body.mobile));
    const status = sanitize(req.body.status) || 'Active';

    if (!name || !mobile) {
      return sendJsonResponse(res, false, 'Name and Mobile are required', {}, 400);
    }

    const [dups] = await pool.execute('SELECT id FROM staff WHERE mobile = ? AND id != ?', [mobile, id]);
    if (dups.length > 0) {
      return sendJsonResponse(res, false, 'Mobile number already registered to another staff member', {}, 400);
    }

    if (id > 0) {
      await pool.execute('UPDATE staff SET name=?, mobile=?, status=? WHERE id=?', [name, mobile, status, id]);
      return sendJsonResponse(res, true, 'Staff member updated');
    } else {
      await pool.execute('INSERT INTO staff (name, mobile, status) VALUES (?, ?, ?)', [name, mobile, status]);
      return sendJsonResponse(res, true, 'Staff member added');
    }
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/staff/delete
router.post('/delete', authMiddleware, async (req, res) => {
  const id = parseInt(req.body.id);
  if (!id) return sendJsonResponse(res, false, 'Invalid ID', {}, 400);
  try {
    await pool.execute('DELETE FROM staff WHERE id = ?', [id]);
    return sendJsonResponse(res, true, 'Staff member deleted');
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal error', {}, 500);
  }
});

module.exports = router;
