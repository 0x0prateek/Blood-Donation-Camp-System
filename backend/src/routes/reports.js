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

    const [camps] = await pool.execute("SELECT id, title, camp_date, location, status FROM blood_camps ORDER BY camp_date DESC LIMIT 5");

    return sendJsonResponse(res, true, 'Dashboard data', {
      total_donors,
      blood_groups,
      recent_camps: camps
    });
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal error', {}, 500);
  }
});

// GET /api/reports/export
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const startDate = req.query.start || null;
    const endDate = req.query.end || null;
    
    let query = `
      SELECT d.donor_name, d.mobile, d.blood_group, c.title, c.camp_date 
      FROM camp_registrations cr
      JOIN donors d ON cr.donor_id = d.id
      JOIN blood_camps c ON cr.camp_id = c.id
      WHERE cr.donation_status = 'Donated'
    `;
    let params = [];
    if (startDate && endDate) {
      query += ` AND c.camp_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    query += ` ORDER BY c.camp_date DESC`;

    const [rows] = await pool.execute(query, params);
    
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Donation Report');
    
    worksheet.columns = [
      { header: 'Donor Name', key: 'donor_name', width: 25 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Blood Group', key: 'blood_group', width: 15 },
      { header: 'Camp Name', key: 'title', width: 30 },
      { header: 'Camp Date', key: 'camp_date', width: 15 },
    ];
    
    rows.forEach(row => {
      worksheet.addRow({
        donor_name: row.donor_name,
        mobile: row.mobile,
        blood_group: row.blood_group,
        title: row.title,
        camp_date: row.camp_date ? new Date(row.camp_date).toISOString().split('T')[0] : ''
      });
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Donation_Report.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
