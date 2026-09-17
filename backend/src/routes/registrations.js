const express = require('express');
const router = express.Router();
const exceljs = require('exceljs');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, dataTablePaging, normalizeMobile } = require('../utils/functions');

// POST /api/registrations/list
router.post('/list', authMiddleware, async (req, res) => {
  try {
    const draw = parseInt(req.body.draw) || 1;
    const { start, length } = dataTablePaging(req);
    const searchValue = sanitize(req.body.search?.value || '');
    
    let orderColIdx = 0;
    let orderDir = 'ASC';
    if (req.body.order && req.body.order[0]) {
       orderColIdx = parseInt(req.body.order[0].column) || 0;
       orderDir = (req.body.order[0].dir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    }
    
    const columns = ['serial_no', 'mobile', 'donor_name', 'blood_group', 'status', 'id'];
    const orderColumn = columns[orderColIdx] || 'serial_no';
    
    const camp_id = parseInt(req.body.camp_id);
    if (!camp_id) return res.json({ draw, recordsTotal: 0, recordsFiltered: 0, data: [] });

    let whereClauses = ['camp_id = ?'];
    let queryParams = [camp_id];

    if (searchValue) {
      const searchCols = ['serial_no', 'mobile', 'donor_name', 'blood_group'];
      const clauses = searchCols.map(col => `${col} LIKE ?`);
      whereClauses.push(`(${clauses.join(' OR ')})`);
      const sp = `%${searchValue}%`;
      queryParams.push(sp, sp, sp, sp);
    }

    const filter = req.body.filter || '';
    if (filter && filter !== 'all') {
      whereClauses.push('status = ?');
      queryParams.push(filter);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM camp_registrations WHERE camp_id = ?', [camp_id]);
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM camp_registrations ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM camp_registrations ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: filtered,
      data
    });
  } catch (error) {
    console.error('Registration list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/registrations/lookup
router.post('/lookup', authMiddleware, async (req, res) => {
  const mobile = normalizeMobile(sanitize(req.body.mobile || ''));
  if (!mobile) return sendJsonResponse(res, false, 'Mobile number required');

  try {
    const [donors] = await pool.execute('SELECT * FROM donors WHERE mobile = ? LIMIT 1', [mobile]);
    if (donors.length > 0) {
      return sendJsonResponse(res, true, 'Donor found', { donor: donors[0] });
    }
    return sendJsonResponse(res, false, 'New donor');
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal server error');
  }
});

// POST /api/registrations/save
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.body.id) || 0;
    const camp_id = parseInt(req.body.camp_id);
    let mobile = normalizeMobile(sanitize(req.body.mobile));
    const donor_name = sanitize(req.body.donor_name);
    const blood_group = sanitize(req.body.blood_group);
    const gender = sanitize(req.body.gender) || null;
    const date_of_birth = req.body.date_of_birth || null;
    const address = sanitize(req.body.address) || null;
    const status = sanitize(req.body.status) || 'Registered';
    const remarks = sanitize(req.body.remarks) || null;
    const registered_by = req.user.id;

    if (!camp_id || !mobile || !donor_name) {
      return sendJsonResponse(res, false, 'Required fields missing', {}, 400);
    }

    // Lookup donor
    let donor_id = null;
    const [donors] = await pool.execute('SELECT id FROM donors WHERE mobile = ?', [mobile]);
    if (donors.length > 0) {
      donor_id = donors[0].id;
      // Update donor details
      await pool.execute(
        'UPDATE donors SET donor_name=?, blood_group=?, gender=?, date_of_birth=?, address=? WHERE id=?',
        [donor_name, blood_group, gender, date_of_birth, address, donor_id]
      );
    } else {
      // Create new donor
      const [result] = await pool.execute(
        'INSERT INTO donors (donor_name, mobile, whatsapp, blood_group, gender, date_of_birth, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [donor_name, mobile, mobile, blood_group, gender || 'Other', date_of_birth, address]
      );
      donor_id = result.insertId;
    }

    if (id > 0) {
      await pool.execute(
        `UPDATE camp_registrations SET mobile=?, donor_name=?, blood_group=?, gender=?, date_of_birth=?, address=?, status=?, remarks=? WHERE id=?`,
        [mobile, donor_name, blood_group, gender, date_of_birth, address, status, remarks, id]
      );
    } else {
      // Get next serial
      const [[{ max_serial }]] = await pool.execute('SELECT MAX(serial_no) as max_serial FROM camp_registrations WHERE camp_id = ?', [camp_id]);
      const serial_no = (max_serial || 0) + 1;

      await pool.execute(
        `INSERT INTO camp_registrations (camp_id, donor_id, serial_no, mobile, donor_name, blood_group, gender, date_of_birth, address, status, remarks, registered_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [camp_id, donor_id, serial_no, mobile, donor_name, blood_group, gender, date_of_birth, address, status, remarks, registered_by]
      );
    }

    // If status is Donated, update last_donation_date
    if (status === 'Donated') {
      const [[camp]] = await pool.execute('SELECT camp_date FROM blood_camps WHERE id = ?', [camp_id]);
      if (camp) {
        await pool.execute('UPDATE donors SET last_donation_date = ? WHERE id = ?', [camp.camp_date, donor_id]);
      }
    }

    return sendJsonResponse(res, true, 'Registration saved successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendJsonResponse(res, false, 'This mobile number is already registered for this camp', {}, 400);
    }
    console.error('Registration save error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/registrations/delete
router.post('/delete', authMiddleware, async (req, res) => {
  const id = parseInt(req.body.id);
  if (!id) return sendJsonResponse(res, false, 'Invalid ID', {}, 400);

  try {
    await pool.execute('DELETE FROM camp_registrations WHERE id = ?', [id]);
    return sendJsonResponse(res, true, 'Registration deleted successfully');
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// GET /api/registrations/export
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const camp_id = parseInt(req.query.camp_id);
    if (!camp_id) return res.status(400).send('Camp ID required');

    const [[camp]] = await pool.execute('SELECT title FROM blood_camps WHERE id = ?', [camp_id]);
    if (!camp) return res.status(404).send('Camp not found');

    let query = 'SELECT * FROM camp_registrations WHERE camp_id = ?';
    let params = [camp_id];
    const filter = req.query.filter || '';
    if (filter && filter !== 'all') {
      query += ' AND status = ?';
      params.push(filter);
    }
    query += ' ORDER BY serial_no ASC';

    const [regs] = await pool.execute(query, params);

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Registrations');

    worksheet.columns = [
      { header: 'Serial No', key: 'serial_no', width: 10 },
      { header: 'Name', key: 'donor_name', width: 30 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Blood Group', key: 'blood_group', width: 15 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'DOB', key: 'date_of_birth', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];

    regs.forEach(reg => {
      worksheet.addRow(reg);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="registrations_${camp_id}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
