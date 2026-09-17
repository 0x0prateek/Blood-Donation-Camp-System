const express = require('express');
const router = express.Router();
const exceljs = require('exceljs');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, dataTablePaging, normalizeMobile } = require('../utils/functions');

// POST /api/finance/contributions/list
router.post('/contributions/list', authMiddleware, async (req, res) => {
  try {
    const draw = parseInt(req.body.draw) || 1;
    const { start, length } = dataTablePaging(req);
    const searchValue = sanitize(req.body.search?.value || '');
    const camp_id = parseInt(req.body.camp_id);

    if (!camp_id) return res.json({ draw, recordsTotal: 0, recordsFiltered: 0, data: [] });

    let orderColIdx = 0;
    let orderDir = 'DESC';
    if (req.body.order && req.body.order[0]) {
       orderColIdx = parseInt(req.body.order[0].column) || 0;
       orderDir = (req.body.order[0].dir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    }
    const columns = ['contributor_name', 'category', 'item_name', 'amount', 'status', 'received_date', 'id'];
    const orderColumn = columns[orderColIdx] || 'id';

    let whereClauses = ['camp_id = ?'];
    let queryParams = [camp_id];

    if (searchValue) {
      whereClauses.push('(contributor_name LIKE ? OR item_name LIKE ?)');
      queryParams.push(`%${searchValue}%`, `%${searchValue}%`);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM camp_contributions WHERE camp_id = ?', [camp_id]);
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM camp_contributions ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM camp_contributions ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    res.json({ draw, recordsTotal: total, recordsFiltered: filtered, data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/finance/contributions/save
router.post('/contributions/save', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.body.id) || 0;
    const camp_id = parseInt(req.body.camp_id);
    const contributor_name = sanitize(req.body.contributor_name);
    const mobile = normalizeMobile(sanitize(req.body.mobile || ''));
    const category = sanitize(req.body.category) || 'Food';
    const item_name = sanitize(req.body.item_name || '');
    const quantity = parseFloat(req.body.quantity) || null;
    const unit = sanitize(req.body.unit || '');
    const amount = parseFloat(req.body.amount) || null;
    const status = sanitize(req.body.status) || 'Received';
    const received_date = req.body.received_date || null;
    const remarks = sanitize(req.body.remarks || '');
    const recorded_by = req.user.id;

    if (!camp_id || !contributor_name || !category) {
      return sendJsonResponse(res, false, 'Required fields missing', {}, 400);
    }

    if (id > 0) {
      await pool.execute(
        `UPDATE camp_contributions SET contributor_name=?, mobile=?, category=?, item_name=?, quantity=?, unit=?, amount=?, status=?, received_date=?, remarks=? WHERE id=?`,
        [contributor_name, mobile, category, item_name, quantity, unit, amount, status, received_date, remarks, id]
      );
      return sendJsonResponse(res, true, 'Contribution updated successfully');
    } else {
      await pool.execute(
        `INSERT INTO camp_contributions (camp_id, contributor_name, mobile, category, item_name, quantity, unit, amount, status, received_date, remarks, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [camp_id, contributor_name, mobile, category, item_name, quantity, unit, amount, status, received_date, remarks, recorded_by]
      );
      return sendJsonResponse(res, true, 'Contribution added successfully');
    }
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/finance/contributions/delete
router.post('/contributions/delete', authMiddleware, async (req, res) => {
  const id = parseInt(req.body.id);
  if (!id) return sendJsonResponse(res, false, 'Invalid ID');
  try {
    await pool.execute('DELETE FROM camp_contributions WHERE id = ?', [id]);
    return sendJsonResponse(res, true, 'Deleted successfully');
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal error');
  }
});

// Expenses
// POST /api/finance/expenses/list
router.post('/expenses/list', authMiddleware, async (req, res) => {
  try {
    const draw = parseInt(req.body.draw) || 1;
    const { start, length } = dataTablePaging(req);
    const searchValue = sanitize(req.body.search?.value || '');
    const camp_id = parseInt(req.body.camp_id);

    if (!camp_id) return res.json({ draw, recordsTotal: 0, recordsFiltered: 0, data: [] });

    let orderColIdx = 0;
    let orderDir = 'DESC';
    if (req.body.order && req.body.order[0]) {
       orderColIdx = parseInt(req.body.order[0].column) || 0;
       orderDir = (req.body.order[0].dir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    }
    const columns = ['description', 'category', 'paid_to', 'amount', 'status', 'expense_date', 'id'];
    const orderColumn = columns[orderColIdx] || 'id';

    let whereClauses = ['camp_id = ?'];
    let queryParams = [camp_id];

    if (searchValue) {
      whereClauses.push('(description LIKE ? OR paid_to LIKE ?)');
      queryParams.push(`%${searchValue}%`, `%${searchValue}%`);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM camp_expenses WHERE camp_id = ?', [camp_id]);
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM camp_expenses ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM camp_expenses ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    res.json({ draw, recordsTotal: total, recordsFiltered: filtered, data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/finance/expenses/save
router.post('/expenses/save', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.body.id) || 0;
    const camp_id = parseInt(req.body.camp_id);
    const description = sanitize(req.body.description);
    const category = sanitize(req.body.category) || 'Other';
    const paid_to = sanitize(req.body.paid_to || '');
    const amount = parseFloat(req.body.amount) || 0;
    const payment_method = sanitize(req.body.payment_method) || 'Cash';
    const status = sanitize(req.body.status) || 'Paid';
    const expense_date = req.body.expense_date || null;
    const receipt_no = sanitize(req.body.receipt_no || '');
    const remarks = sanitize(req.body.remarks || '');
    const recorded_by = req.user.id;

    if (!camp_id || !description || amount < 0) {
      return sendJsonResponse(res, false, 'Required fields missing or invalid amount', {}, 400);
    }

    if (id > 0) {
      await pool.execute(
        `UPDATE camp_expenses SET description=?, category=?, paid_to=?, amount=?, payment_method=?, status=?, expense_date=?, receipt_no=?, remarks=? WHERE id=?`,
        [description, category, paid_to, amount, payment_method, status, expense_date, receipt_no, remarks, id]
      );
      return sendJsonResponse(res, true, 'Expense updated successfully');
    } else {
      await pool.execute(
        `INSERT INTO camp_expenses (camp_id, description, category, paid_to, amount, payment_method, status, expense_date, receipt_no, remarks, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [camp_id, description, category, paid_to, amount, payment_method, status, expense_date, receipt_no, remarks, recorded_by]
      );
      return sendJsonResponse(res, true, 'Expense added successfully');
    }
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/finance/expenses/delete
router.post('/expenses/delete', authMiddleware, async (req, res) => {
  const id = parseInt(req.body.id);
  if (!id) return sendJsonResponse(res, false, 'Invalid ID');
  try {
    await pool.execute('DELETE FROM camp_expenses WHERE id = ?', [id]);
    return sendJsonResponse(res, true, 'Deleted successfully');
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal error');
  }
});

// GET /api/finance/export
router.get('/export', authMiddleware, async (req, res) => {
  // Implementation of Excel export using exceljs
  // Create worksheets for Contributions and Expenses
  // ... similar to previous export implementations
  res.status(501).send('Not implemented yet');
});

module.exports = router;
