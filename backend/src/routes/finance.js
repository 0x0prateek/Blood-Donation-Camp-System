const express = require('express');
const router = express.Router();
const exceljs = require('exceljs');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, dataTablePaging, normalizeMobile, formatMoney } = require('../utils/functions');

// Camp-wide money summary, independent of any list filter - always the
// truth for the whole camp, matching the Register page's summary cards.
const getFinanceSummary = async (camp_id) => {
  const [[camp]] = await pool.execute('SELECT budget_amount FROM blood_camps WHERE id = ?', [camp_id]);
  const budget = camp ? camp.budget_amount : null;

  const [[contribTotals]] = await pool.execute(
    `SELECT
       COUNT(*) AS contributors,
       SUM(CASE WHEN category = 'Cash' AND status = 'Received' THEN amount ELSE 0 END) AS cash_received,
       SUM(CASE WHEN category != 'Cash' AND status = 'Received' THEN amount ELSE 0 END) AS inkind_value,
       SUM(CASE WHEN category != 'Cash' THEN 1 ELSE 0 END) AS inkind_items
     FROM camp_contributions WHERE camp_id = ?`,
    [camp_id]
  );

  const [[expenseTotals]] = await pool.execute(
    `SELECT
       SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END) AS expenses_paid,
       SUM(CASE WHEN status = 'Planned' THEN amount ELSE 0 END) AS expenses_planned
     FROM camp_expenses WHERE camp_id = ?`,
    [camp_id]
  );

  const cash_received = parseFloat(contribTotals.cash_received) || 0;
  const expenses_paid = parseFloat(expenseTotals.expenses_paid) || 0;

  return {
    budget: budget != null ? parseFloat(budget) : 0,
    cash_received,
    inkind_value: parseFloat(contribTotals.inkind_value) || 0,
    expenses_paid,
    expenses_planned: parseFloat(expenseTotals.expenses_planned) || 0,
    balance: cash_received - expenses_paid,
    contributors: contribTotals.contributors || 0,
    inkind_items: contribTotals.inkind_items || 0
  };
};

const getContributionsByCategory = async (camp_id) => {
  const [rows] = await pool.execute(
    `SELECT category, COUNT(*) AS entries, COALESCE(SUM(quantity), 0) AS quantity, COALESCE(SUM(amount), 0) AS total
     FROM camp_contributions WHERE camp_id = ? GROUP BY category ORDER BY total DESC, entries DESC`,
    [camp_id]
  );
  return rows.map(r => ({
    category: r.category,
    entries: r.entries,
    quantity: parseFloat(r.quantity) || 0,
    total: parseFloat(r.total) || 0
  }));
};

const getExpensesByCategory = async (camp_id) => {
  const [rows] = await pool.execute(
    `SELECT category, COALESCE(SUM(amount), 0) AS total
     FROM camp_expenses WHERE camp_id = ? GROUP BY category ORDER BY total DESC`,
    [camp_id]
  );
  return rows.map(r => ({ category: r.category, total: parseFloat(r.total) || 0 }));
};

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

    const category = req.body.category || '';
    if (category) {
      whereClauses.push('category = ?');
      queryParams.push(category);
    }

    const status = req.body.status || '';
    if (status) {
      whereClauses.push('status = ?');
      queryParams.push(status);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM camp_contributions WHERE camp_id = ?', [camp_id]);
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM camp_contributions ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM camp_contributions ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    const [summary, by_category] = await Promise.all([
      getFinanceSummary(camp_id),
      getContributionsByCategory(camp_id)
    ]);

    res.json({ draw, recordsTotal: total, recordsFiltered: filtered, data, summary, by_category });
  } catch (error) {
    console.error('Contributions list error:', error);
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
    const amount = req.body.amount === '' || req.body.amount == null ? null : parseFloat(req.body.amount);
    const status = sanitize(req.body.status) || 'Received';
    const received_date = req.body.received_date || null;
    const remarks = sanitize(req.body.remarks || '');
    const recorded_by = req.user.id;

    if (!camp_id || !contributor_name || !category) {
      return sendJsonResponse(res, false, 'Required fields missing', {}, 400);
    }

    if (category === 'Cash' && (amount == null || isNaN(amount))) {
      return sendJsonResponse(res, false, 'Amount is required for a cash contribution', {}, 400);
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
    console.error('Contribution save error:', error);
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

    const category = req.body.category || '';
    if (category) {
      whereClauses.push('category = ?');
      queryParams.push(category);
    }

    const status = req.body.status || '';
    if (status) {
      whereClauses.push('status = ?');
      queryParams.push(status);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM camp_expenses WHERE camp_id = ?', [camp_id]);
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM camp_expenses ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM camp_expenses ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    const [summary, by_category] = await Promise.all([
      getFinanceSummary(camp_id),
      getExpensesByCategory(camp_id)
    ]);

    res.json({ draw, recordsTotal: total, recordsFiltered: filtered, data, summary, by_category });
  } catch (error) {
    console.error('Expenses list error:', error);
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
    console.error('Expense save error:', error);
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

// GET /api/finance/export?camp_id=&format=xlsx|csv&section=summary|contributions|expenses
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const camp_id = parseInt(req.query.camp_id);
    if (!camp_id) return res.status(400).send('Camp ID required');

    const [[camp]] = await pool.execute('SELECT title FROM blood_camps WHERE id = ?', [camp_id]);
    if (!camp) return res.status(404).send('Camp not found');

    const [currencyRows] = await pool.execute(
      "SELECT setting_value AS value FROM settings WHERE setting_key = 'currency_symbol'"
    );
    const currency = currencyRows[0]?.value || 'Rs.';

    const format = (req.query.format || 'xlsx').toLowerCase();
    const section = req.query.section || 'summary';

    const [contributions] = await pool.execute('SELECT * FROM camp_contributions WHERE camp_id = ? ORDER BY created_at ASC', [camp_id]);
    const [expenses] = await pool.execute('SELECT * FROM camp_expenses WHERE camp_id = ? ORDER BY created_at ASC', [camp_id]);
    const summary = await getFinanceSummary(camp_id);

    if (format === 'csv') {
      const rowsToCsv = (headers, rows) => {
        const esc = (v) => {
          const s = v === null || v === undefined ? '' : String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const lines = [headers.map(h => esc(h.label)).join(',')];
        rows.forEach(r => lines.push(headers.map(h => esc(r[h.key])).join(',')));
        return '﻿' + lines.join('\r\n');
      };

      let csv, filename;
      if (section === 'expenses') {
        csv = rowsToCsv(
          [{ key: 'expense_date', label: 'Date' }, { key: 'category', label: 'Category' }, { key: 'description', label: 'Description' },
           { key: 'paid_to', label: 'Paid To' }, { key: 'amount', label: 'Amount' }, { key: 'payment_method', label: 'Payment Method' },
           { key: 'status', label: 'Status' }, { key: 'receipt_no', label: 'Receipt No' }, { key: 'remarks', label: 'Remarks' }],
          expenses
        );
        filename = `expenses_${camp_id}.csv`;
      } else {
        csv = rowsToCsv(
          [{ key: 'received_date', label: 'Date' }, { key: 'contributor_name', label: 'Contributor' }, { key: 'mobile', label: 'Mobile' },
           { key: 'category', label: 'Category' }, { key: 'item_name', label: 'Item' }, { key: 'quantity', label: 'Quantity' },
           { key: 'unit', label: 'Unit' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }, { key: 'remarks', label: 'Remarks' }],
          contributions
        );
        filename = `contributions_${camp_id}.csv`;
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    }

    // xlsx: full three-sheet workbook
    const workbook = new exceljs.Workbook();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [{ header: 'Metric', key: 'metric', width: 30 }, { header: 'Value', key: 'value', width: 25 }];
    const cur = currency || 'Rs.';
    summarySheet.addRows([
      { metric: 'Camp', value: camp.title },
      { metric: 'Planned Budget', value: formatMoney(summary.budget, cur) },
      { metric: 'Cash Donated', value: formatMoney(summary.cash_received, cur) },
      { metric: 'Goods Value (estimated)', value: formatMoney(summary.inkind_value, cur) },
      { metric: 'Expenses Paid', value: formatMoney(summary.expenses_paid, cur) },
      { metric: 'Expenses Planned (unpaid)', value: formatMoney(summary.expenses_planned, cur) },
      { metric: 'Balance (cash - paid)', value: formatMoney(summary.balance, cur) },
      { metric: 'Contributors', value: summary.contributors },
      { metric: 'In-kind items', value: summary.inkind_items }
    ]);

    const contribSheet = workbook.addWorksheet('Contributions');
    contribSheet.columns = [
      { header: 'Date', key: 'received_date', width: 14 },
      { header: 'Contributor', key: 'contributor_name', width: 25 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Item', key: 'item_name', width: 25 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Unit', key: 'unit', width: 12 },
      { header: 'Amount', key: 'amount', width: 14 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];
    contributions.forEach(c => contribSheet.addRow(c));

    const expenseSheet = workbook.addWorksheet('Expenses');
    expenseSheet.columns = [
      { header: 'Date', key: 'expense_date', width: 14 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Paid To', key: 'paid_to', width: 20 },
      { header: 'Amount', key: 'amount', width: 14 },
      { header: 'Payment Method', key: 'payment_method', width: 16 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Receipt No', key: 'receipt_no', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];
    expenses.forEach(e => expenseSheet.addRow(e));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="camp_finance_${camp_id}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Finance export error:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
