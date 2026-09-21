const express = require('express');
const router = express.Router();
const exceljs = require('exceljs');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, dataTablePaging, normalizeMobile } = require('../utils/functions');

const REG_STATUSES = ['Registered', 'Donated', 'Rejected', 'No Show'];

const getRegistrationSummary = async (camp_id) => {
  const [rows] = await pool.execute(
    'SELECT status, COUNT(*) AS total FROM camp_registrations WHERE camp_id = ? GROUP BY status',
    [camp_id]
  );
  const summary = { Registered: 0, Donated: 0, Rejected: 0, 'No Show': 0 };
  rows.forEach(r => { summary[r.status] = r.total; });
  return summary;
};

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

    // Register.vue sends `status`; keep `filter` too for backward compatibility.
    const status = req.body.status || req.body.filter || '';
    if (status && status !== 'all' && REG_STATUSES.includes(status)) {
      whereClauses.push('status = ?');
      queryParams.push(status);
    }

    const bloodGroup = req.body.blood_group || '';
    if (bloodGroup) {
      whereClauses.push('blood_group = ?');
      queryParams.push(bloodGroup);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM camp_registrations WHERE camp_id = ?', [camp_id]);
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM camp_registrations ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM camp_registrations ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    const summary = await getRegistrationSummary(camp_id);

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: filtered,
      data,
      summary
    });
  } catch (error) {
    console.error('Registration list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/registrations/lookup
router.post('/lookup', authMiddleware, async (req, res) => {
  const camp_id = parseInt(req.body.camp_id);
  const mobile = normalizeMobile(sanitize(req.body.mobile || ''));
  if (!mobile) return sendJsonResponse(res, false, 'Mobile number required');
  if (!camp_id) return sendJsonResponse(res, false, 'Camp required');

  try {
    // Already on this camp's register?
    const [existing] = await pool.execute(
      'SELECT * FROM camp_registrations WHERE camp_id = ? AND mobile = ? LIMIT 1',
      [camp_id, mobile]
    );
    if (existing.length > 0) {
      return sendJsonResponse(res, true, 'Already registered', {
        state: 'already_registered',
        mobile,
        registration: existing[0]
      });
    }

    // Known donor elsewhere in the system?
    const [donors] = await pool.execute('SELECT * FROM donors WHERE mobile = ? LIMIT 1', [mobile]);
    if (donors.length > 0) {
      const [[{ donation_count }]] = await pool.execute(
        "SELECT COUNT(*) AS donation_count FROM camp_registrations WHERE donor_id = ? AND status = 'Donated'",
        [donors[0].id]
      );
      return sendJsonResponse(res, true, 'Donor found', {
        state: 'known_donor',
        mobile,
        donor: donors[0],
        donation_count
      });
    }

    return sendJsonResponse(res, true, 'New donor', { state: 'new_donor', mobile });
  } catch (error) {
    console.error('Registration lookup error:', error);
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
    // Register.vue sends `status`; keep `filter` too for backward compatibility.
    const filter = req.query.status || req.query.filter || '';
    if (filter && filter !== 'all' && REG_STATUSES.includes(filter)) {
      query += ' AND status = ?';
      params.push(filter);
    }
    query += ' ORDER BY serial_no ASC';

    const [regs] = await pool.execute(query, params);
    const format = (req.query.format || 'xlsx').toLowerCase();

    if (format === 'csv') {
      const esc = (v) => {
        const s = v === null || v === undefined ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const headers = ['Serial No', 'Name', 'Mobile', 'Blood Group', 'Gender', 'DOB', 'Status', 'Remarks'];
      const keys = ['serial_no', 'donor_name', 'mobile', 'blood_group', 'gender', 'date_of_birth', 'status', 'remarks'];
      const lines = [headers.map(esc).join(',')];
      regs.forEach(r => lines.push(keys.map(k => esc(r[k])).join(',')));
      const csv = '﻿' + lines.join('\r\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="registrations_${camp_id}.csv"`);
      return res.send(csv);
    }

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
