const express = require('express');
const router = express.Router();
const multer = require('multer');
const exceljs = require('exceljs');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, dataTablePaging, normalizeMobile } = require('../utils/functions');

const upload = multer({ storage: multer.memoryStorage() });

// Helper for datatables search
const buildSearchWhere = (searchValue, columns) => {
  if (!searchValue) return { query: '', params: [] };
  const clauses = columns.map(col => `${col} LIKE ?`);
  const query = `(${clauses.join(' OR ')})`;
  const sp = `%${searchValue}%`;
  const params = columns.map(() => sp);
  return { query, params };
};

// POST /api/donors/list
router.post('/list', authMiddleware, async (req, res) => {
  try {
    const draw = parseInt(req.body.draw) || 1;
    const { start, length } = dataTablePaging(req);
    const searchValue = sanitize(req.body.search?.value || '');
    
    // Fallbacks for order column
    let orderColIdx = 0;
    let orderDir = 'DESC';
    if (req.body.order && req.body.order[0]) {
       orderColIdx = parseInt(req.body.order[0].column) || 0;
       orderDir = (req.body.order[0].dir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    }
    
    const columns = ['donor_name', 'mobile', 'blood_group', 'last_donation_date', 'status', 'id'];
    const orderColumn = columns[orderColIdx] || 'id';
    const filter = req.body.filter || '';

    let whereClauses = [];
    let queryParams = [];

    if (searchValue) {
      const searchCols = ['donor_name', 'mobile', 'blood_group', 'address'];
      const { query, params } = buildSearchWhere(searchValue, searchCols);
      whereClauses.push(query);
      queryParams.push(...params);
    }

    const bloodGroup = req.body.blood_group || filter;
    if (bloodGroup === '__none__') {
      whereClauses.push("(blood_group IS NULL OR blood_group = '')");
    } else if (bloodGroup && bloodGroup !== 'all') {
      whereClauses.push('blood_group = ?');
      queryParams.push(bloodGroup);
    }

    const status = req.body.status || '';
    if (status && ['Active', 'Inactive'].includes(status)) {
      whereClauses.push('status = ?');
      queryParams.push(status);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM donors');
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM donors ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM donors ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: filtered,
      data
    });
  } catch (error) {
    console.error('Donor list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/donors/save
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.body.id) || 0;
    const donor_name = sanitize(req.body.donor_name);
    let mobile = normalizeMobile(sanitize(req.body.mobile));
    let whatsapp = normalizeMobile(sanitize(req.body.whatsapp));
    const blood_group = sanitize(req.body.blood_group);
    const gender = sanitize(req.body.gender);
    const date_of_birth = req.body.date_of_birth || null;
    const last_donation_date = req.body.last_donation_date || null;
    const email = sanitize(req.body.email) || null;
    const address = sanitize(req.body.address) || null;
    const status = sanitize(req.body.status) || 'Active';

    if (!donor_name || !mobile || !blood_group || !gender) {
      return sendJsonResponse(res, false, 'Required fields missing', {}, 400);
    }
    
    // Use mobile as whatsapp if whatsapp is empty
    if (!whatsapp) whatsapp = mobile;

    // Check duplicate mobile
    const [dups] = await pool.execute('SELECT id FROM donors WHERE mobile = ? AND id != ?', [mobile, id]);
    if (dups.length > 0) {
      return sendJsonResponse(res, false, 'Mobile number already registered to another donor', {}, 400);
    }

    if (id > 0) {
      await pool.execute(
        `UPDATE donors SET donor_name=?, mobile=?, whatsapp=?, email=?, address=?, 
         blood_group=?, gender=?, date_of_birth=?, last_donation_date=?, status=? WHERE id=?`,
        [donor_name, mobile, whatsapp, email, address, blood_group, gender, date_of_birth, last_donation_date, status, id]
      );
      return sendJsonResponse(res, true, 'Donor updated successfully');
    } else {
      await pool.execute(
        `INSERT INTO donors (donor_name, mobile, whatsapp, email, address, blood_group, gender, date_of_birth, last_donation_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [donor_name, mobile, whatsapp, email, address, blood_group, gender, date_of_birth, last_donation_date, status]
      );
      return sendJsonResponse(res, true, 'Donor added successfully');
    }
  } catch (error) {
    console.error('Donor save error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/donors/delete
router.post('/delete', authMiddleware, async (req, res) => {
  const id = parseInt(req.body.id);
  if (!id) return sendJsonResponse(res, false, 'Invalid ID', {}, 400);

  try {
    await pool.execute('DELETE FROM donors WHERE id = ?', [id]);
    return sendJsonResponse(res, true, 'Donor deleted successfully');
  } catch (error) {
    console.error('Donor delete error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/donors/status
router.post('/status', authMiddleware, async (req, res) => {
  const id = parseInt(req.body.id);
  const status = sanitize(req.body.status);
  
  if (!id || !['Active', 'Inactive'].includes(status)) {
    return sendJsonResponse(res, false, 'Invalid parameters', {}, 400);
  }

  try {
    await pool.execute('UPDATE donors SET status = ? WHERE id = ?', [status, id]);
    return sendJsonResponse(res, true, 'Status updated successfully');
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// GET /api/donors/export
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const filter = req.query.filter || '';
    let query = 'SELECT * FROM donors';
    let params = [];
    if (filter && filter !== 'all') {
      query += ' WHERE blood_group = ?';
      params.push(filter);
    }
    query += ' ORDER BY donor_name ASC';

    const [donors] = await pool.execute(query, params);

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Donors');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'donor_name', width: 30 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'WhatsApp', key: 'whatsapp', width: 15 },
      { header: 'Blood Group', key: 'blood_group', width: 15 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'DOB', key: 'date_of_birth', width: 15 },
      { header: 'Last Donation', key: 'last_donation_date', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Address', key: 'address', width: 40 }
    ];

    donors.forEach(donor => {
      worksheet.addRow(donor);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="donors.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).send('Internal server error');
  }
});

// POST /api/donors/import
router.post('/import', authMiddleware, upload.single('import_file'), async (req, res) => {
  if (!req.file) {
    return sendJsonResponse(res, false, 'No file uploaded', {}, 400);
  }

  try {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];

    let imported = 0;
    let skipped = 0;
    let errors = [];

    // Collect rows first: eachRow's callback is not awaited by exceljs,
    // so async work inside it would race past the response being sent.
    const pendingRows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      pendingRows.push({ row, rowNumber });
    });

    for (const { row, rowNumber } of pendingRows) {
      const name = sanitize(row.getCell(1).value?.toString() || '');
      let mobile = normalizeMobile(sanitize(row.getCell(2).value?.toString() || ''));
      let whatsapp = normalizeMobile(sanitize(row.getCell(3).value?.toString() || ''));
      const blood_group = sanitize(row.getCell(4).value?.toString() || '');
      // Add more fields as needed

      if (!name || !mobile || !blood_group) {
        skipped++;
        errors.push(`Row ${rowNumber}: Missing required fields`);
        continue;
      }

      if (name === '?') {
        skipped++;
        errors.push(`Row ${rowNumber}: Name arrived as "?" - likely a Windows ANSI CSV re-save that cannot represent Sinhala`);
        continue;
      }

      if (!whatsapp) whatsapp = mobile;

      try {
        const [dups] = await pool.execute('SELECT id FROM donors WHERE mobile = ?', [mobile]);
        if (dups.length === 0) {
          await pool.execute(
            'INSERT INTO donors (donor_name, mobile, whatsapp, blood_group) VALUES (?, ?, ?, ?)',
            [name, mobile, whatsapp, blood_group]
          );
          imported++;
        } else {
          skipped++;
          errors.push(`Row ${rowNumber}: Mobile ${mobile} already exists`);
        }
      } catch (err) {
        skipped++;
        errors.push(`Row ${rowNumber}: ${err.message}`);
      }
    }

    return sendJsonResponse(res, true, `Imported ${imported} donors. Skipped ${skipped}.`, { errors });
  } catch (error) {
    console.error('Import error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// GET /api/donors/blood-group-counts
router.get('/blood-group-counts', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT blood_group, COUNT(*) as count
      FROM donors
      WHERE status = 'Active' AND blood_group IS NOT NULL AND blood_group <> ''
      GROUP BY blood_group
    `);
    const counts = {};
    rows.forEach(r => counts[r.blood_group] = r.count);
    return sendJsonResponse(res, true, 'Blood group counts loaded', counts);
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// GET /api/donors/:id - must be registered after all other GET routes
// above (/export, /blood-group-counts) so it doesn't shadow them.
router.get('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return sendJsonResponse(res, false, 'Invalid ID', {}, 400);

  try {
    const [rows] = await pool.execute('SELECT * FROM donors WHERE id = ?', [id]);
    if (rows.length === 0) {
      return sendJsonResponse(res, false, 'Donor not found', {}, 404);
    }
    return sendJsonResponse(res, true, 'Donor loaded', rows[0]);
  } catch (error) {
    console.error('Donor fetch error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

module.exports = router;
