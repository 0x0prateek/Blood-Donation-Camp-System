const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse } = require('../utils/functions');

// GET /api/reports/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const [[{ total_donors }]] = await pool.execute("SELECT COUNT(*) as total_donors FROM donors WHERE status = 'Active'");
    
    // Blood group counts
    const [bgRows] = await pool.execute("SELECT blood_group, COUNT(*) as count FROM donors WHERE status = 'Active' GROUP BY blood_group");
    const blood_groups = {};
    bgRows.forEach(row => blood_groups[row.blood_group] = row.count);

    // Recent camps
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
  res.status(501).send('Not implemented yet');
});

module.exports = router;
