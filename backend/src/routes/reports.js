const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse } = require('../utils/functions');
const exceljs = require('exceljs');

// GET /api/reports/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const [[{ total_donors }]] = await pool.execute("SELECT COUNT(*) as total_donors FROM donors WHERE status = 'Active'");

    const [bgRows] = await pool.execute("SELECT blood_group, COUNT(*) as count FROM donors WHERE status = 'Active' GROUP BY blood_group");
    const blood_groups = {};
    bgRows.forEach(row => blood_groups[row.blood_group] = row.count);

    const [camps] = await pool.execute(
      "SELECT id, title, camp_date, start_time, end_time, location, status FROM blood_camps WHERE camp_date >= CURDATE() AND status = 'Upcoming' ORDER BY camp_date ASC LIMIT 5"
    );

    const [[{ eligible_donors }]] = await pool.execute(
      "SELECT COUNT(*) as eligible_donors FROM donors WHERE status = 'Active' AND (last_donation_date IS NULL OR last_donation_date <= DATE_SUB(NOW(), INTERVAL 4 MONTH))"
    );

    const [[{ messages_today }]] = await pool.execute(
      "SELECT COUNT(*) as messages_today FROM message_logs WHERE status = 'Sent' AND DATE(sent_at) = CURDATE()"
    );

    const [recentMessages] = await pool.execute(`
      SELECT ml.sent_at, ml.message_type, ml.status, ml.mobile, COALESCE(d.donor_name, s.name, 'Unknown') AS donor_name
      FROM message_logs ml
      LEFT JOIN donors d ON d.id = ml.donor_id
      LEFT JOIN staff s ON s.id = ml.staff_id
      ORDER BY ml.sent_at DESC LIMIT 5
    `);

    return sendJsonResponse(res, true, 'Dashboard data', {
      total_donors,
      blood_groups,
      recent_camps: camps,
      eligible_donors,
      messages_today,
      recent_messages: recentMessages
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return sendJsonResponse(res, false, 'Internal error', {}, 500);
  }
});

// POST /api/reports/data
router.post('/data', authMiddleware, async (req, res) => {
  try {
    // Reports.vue historically nested filters under `params`; accept both
    // shapes so a flat body or a { params: {...} } body both work.
    const body = req.body.params && typeof req.body.params === 'object' ? req.body.params : req.body;
    const startDate = body.start_date || '';
    const endDate = body.end_date || '';
    const bloodGroup = body.blood_group || '';
    
    let dateWhere = '';
    let dateParams = [];
    if (startDate) { dateWhere += ' AND DATE(d.created_at) >= ?'; dateParams.push(startDate); }
    if (endDate) { dateWhere += ' AND DATE(d.created_at) <= ?'; dateParams.push(endDate); }

    let bgWhere = '';
    let bgParams = [];
    if (bloodGroup && ['A+','A-','B+','B-','AB+','AB-','O+','O-'].includes(bloodGroup)) {
      bgWhere = ' AND d.blood_group = ?';
      bgParams.push(bloodGroup);
    }

    const [[{ total_donors }]] = await pool.execute(`SELECT COUNT(*) as total_donors FROM donors d WHERE 1=1 ${dateWhere} ${bgWhere}`, [...dateParams, ...bgParams]);
    
    const [[{ upcoming_camps }]] = await pool.execute("SELECT COUNT(*) as upcoming_camps FROM blood_camps WHERE camp_date >= CURDATE() AND status = 'Upcoming'");
    
    // Eligible Donors (4 months)
    let eligDateWhere = dateWhere;
    let eligDateParams = [...dateParams];
    const [eligibleDonors] = await pool.execute(`
      SELECT d.id, d.donor_name, d.mobile, d.blood_group, d.last_donation_date 
      FROM donors d 
      WHERE d.status = 'Active' AND (d.last_donation_date IS NULL OR d.last_donation_date <= DATE_SUB(NOW(), INTERVAL 4 MONTH))
      ${eligDateWhere} ${bgWhere}
      ORDER BY d.blood_group, d.donor_name
    `, [...eligDateParams, ...bgParams]);

    // Messages Sent
    let msgDateWhere = '';
    let msgDateParams = [];
    if (startDate) { msgDateWhere += ' AND DATE(ml.sent_at) >= ?'; msgDateParams.push(startDate); }
    if (endDate) { msgDateWhere += ' AND DATE(ml.sent_at) <= ?'; msgDateParams.push(endDate); }
    
    const [[{ messages_sent }]] = await pool.execute(`
      SELECT COUNT(*) as messages_sent FROM message_logs ml LEFT JOIN donors d ON d.id = ml.donor_id
      WHERE ml.status = 'Sent' ${msgDateWhere} ${bgWhere}
    `, [...msgDateParams, ...bgParams]);

    // Blood Groups
    const [bloodRows] = await pool.execute(`
      SELECT d.blood_group, COUNT(*) AS total
      FROM donors d
      WHERE d.status = 'Active' ${dateWhere} ${bgWhere}
      GROUP BY d.blood_group
    `, [...dateParams, ...bgParams]);

    const bloodGroups = {};
    ['A+','A-','B+','B-','AB+','AB-','O+','O-'].forEach(g => bloodGroups[g] = { blood_group: g, total: 0 });
    let unknownBloodGroup = 0;
    bloodRows.forEach(row => {
      if (bloodGroups[row.blood_group]) bloodGroups[row.blood_group].total = parseInt(row.total);
      else unknownBloodGroup += parseInt(row.total);
    });

    // Message Trend
    const [messageTrend] = await pool.execute(`
      SELECT DATE(ml.sent_at) AS report_date, COUNT(*) AS total
      FROM message_logs ml LEFT JOIN donors d ON d.id = ml.donor_id
      WHERE 1=1 ${msgDateWhere} ${bgWhere}
      GROUP BY DATE(ml.sent_at) ORDER BY report_date ASC
    `, [...msgDateParams, ...bgParams]);

    // Recent Messages
    const [recentMessages] = await pool.execute(`
      SELECT ml.sent_at, ml.message_type, ml.status, COALESCE(d.donor_name, 'Unknown donor') AS donor_name
      FROM message_logs ml LEFT JOIN donors d ON d.id = ml.donor_id
      WHERE 1=1 ${msgDateWhere} ${bgWhere}
      ORDER BY ml.sent_at DESC LIMIT 10
    `, [...msgDateParams, ...bgParams]);

    return sendJsonResponse(res, true, 'Reports loaded.', {
      summary: { total_donors, eligible_donors: eligibleDonors.length, messages_sent, upcoming_camps, unknown_blood_group: unknownBloodGroup },
      blood_groups: Object.values(bloodGroups),
      message_trend: messageTrend,
      eligible_donors: eligibleDonors.slice(0, 10),
      recent_messages: recentMessages
    });
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal error', {}, 500);
  }
});

// GET /api/reports/export
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const startDate = req.query.start_date || null;
    const endDate = req.query.end_date || null;
    const bloodGroup = req.query.blood_group || '';
    const report = req.query.report || 'summary';

    let dateWhere = '';
    let dateParams = [];
    if (startDate) { dateWhere += ' AND c.camp_date >= ?'; dateParams.push(startDate); }
    if (endDate) { dateWhere += ' AND c.camp_date <= ?'; dateParams.push(endDate); }

    const workbook = new exceljs.Workbook();

    if (report === 'blood_groups') {
      let bgWhere = '';
      let bgParams = [];
      if (bloodGroup) { bgWhere = ' AND blood_group = ?'; bgParams.push(bloodGroup); }
      const [rows] = await pool.execute(
        `SELECT blood_group, COUNT(*) AS total FROM donors WHERE status = 'Active' ${bgWhere} GROUP BY blood_group ORDER BY blood_group`,
        bgParams
      );
      const sheet = workbook.addWorksheet('Blood Groups');
      sheet.columns = [{ header: 'Blood Group', key: 'blood_group', width: 15 }, { header: 'Active Donors', key: 'total', width: 15 }];
      rows.forEach(r => sheet.addRow(r));

    } else if (report === 'messages') {
      let msgWhere = '';
      let msgParams = [];
      if (startDate) { msgWhere += ' AND DATE(ml.sent_at) >= ?'; msgParams.push(startDate); }
      if (endDate) { msgWhere += ' AND DATE(ml.sent_at) <= ?'; msgParams.push(endDate); }
      const [rows] = await pool.execute(
        `SELECT DATE(ml.sent_at) AS report_date, ml.message_type, COUNT(*) AS total
         FROM message_logs ml WHERE 1=1 ${msgWhere}
         GROUP BY DATE(ml.sent_at), ml.message_type ORDER BY report_date ASC`,
        msgParams
      );
      const sheet = workbook.addWorksheet('Messages Over Time');
      sheet.columns = [{ header: 'Date', key: 'report_date', width: 15 }, { header: 'Channel', key: 'message_type', width: 15 }, { header: 'Count', key: 'total', width: 12 }];
      rows.forEach(r => sheet.addRow(r));

    } else if (report === 'eligible') {
      let bgWhere = '';
      let bgParams = [];
      if (bloodGroup) { bgWhere = ' AND blood_group = ?'; bgParams.push(bloodGroup); }
      const [rows] = await pool.execute(
        `SELECT donor_name, mobile, blood_group, last_donation_date, address FROM donors
         WHERE status = 'Active' AND (last_donation_date IS NULL OR last_donation_date <= DATE_SUB(NOW(), INTERVAL 4 MONTH)) ${bgWhere}
         ORDER BY blood_group, donor_name`,
        bgParams
      );
      const sheet = workbook.addWorksheet('Eligible Donors');
      sheet.columns = [
        { header: 'Name', key: 'donor_name', width: 25 }, { header: 'Mobile', key: 'mobile', width: 15 },
        { header: 'Blood Group', key: 'blood_group', width: 12 }, { header: 'Last Donation', key: 'last_donation_date', width: 15 },
        { header: 'Address', key: 'address', width: 30 }
      ];
      rows.forEach(r => sheet.addRow(r));

    } else {
      // summary: donors who actually donated at a camp, with camp/date
      let bgWhere = '';
      let bgParams = [];
      if (bloodGroup) { bgWhere = ' AND d.blood_group = ?'; bgParams.push(bloodGroup); }
      const [rows] = await pool.execute(
        `SELECT d.donor_name, d.mobile, d.blood_group, c.title, c.camp_date
         FROM camp_registrations cr
         JOIN donors d ON cr.donor_id = d.id
         JOIN blood_camps c ON cr.camp_id = c.id
         WHERE cr.status = 'Donated' ${dateWhere} ${bgWhere}
         ORDER BY c.camp_date DESC`,
        [...dateParams, ...bgParams]
      );
      const sheet = workbook.addWorksheet('Donation Report');
      sheet.columns = [
        { header: 'Donor Name', key: 'donor_name', width: 25 },
        { header: 'Mobile', key: 'mobile', width: 15 },
        { header: 'Blood Group', key: 'blood_group', width: 15 },
        { header: 'Camp Name', key: 'title', width: 30 },
        { header: 'Camp Date', key: 'camp_date', width: 15 },
      ];
      rows.forEach(row => {
        sheet.addRow({
          donor_name: row.donor_name,
          mobile: row.mobile,
          blood_group: row.blood_group,
          title: row.title,
          camp_date: row.camp_date ? new Date(row.camp_date).toISOString().split('T')[0] : ''
        });
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${report}_report.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
