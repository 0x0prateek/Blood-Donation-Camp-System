const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse } = require('../utils/functions');

// GET /api/public/stats
// Aggregate, non-identifying counts only - safe to expose with no auth,
// used by the public landing page. Never return donor names/mobiles here.
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_donors }]] = await pool.execute("SELECT COUNT(*) as total_donors FROM donors WHERE status = 'Active'");
    const [[{ total_camps }]] = await pool.execute('SELECT COUNT(*) as total_camps FROM blood_camps');
    const [[{ total_donations }]] = await pool.execute("SELECT COUNT(*) as total_donations FROM camp_registrations WHERE status = 'Donated'");
    const [bgRows] = await pool.execute(
      "SELECT COUNT(DISTINCT blood_group) as c FROM donors WHERE status = 'Active' AND blood_group IS NOT NULL AND blood_group <> ''"
    );
    const blood_groups_covered = bgRows[0]?.c || 0;

    return sendJsonResponse(res, true, 'Public stats', {
      total_donors: Number(total_donors || 0),
      total_camps: Number(total_camps || 0),
      total_donations: Number(total_donations || 0),
      blood_groups_covered: Number(blood_groups_covered || 0),
      estimated_lives_impacted: Number(total_donations || 0) * 3
    });
  } catch (error) {
    console.error('Public stats fetch error:', error);
    return sendJsonResponse(res, false, 'Internal error', {}, 500);
  }
});

router.get('/blood-stock', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT blood_group, COUNT(*) AS total FROM donors WHERE status = 'Active' AND blood_group IS NOT NULL AND blood_group <> '' GROUP BY blood_group ORDER BY FIELD(blood_group, 'A+','A-','B+','B-','AB+','AB-','O+','O-')"
    );

    const bloodStock = rows.reduce((acc, row) => {
      acc[row.blood_group] = Number(row.total || 0);
      return acc;
    }, {});

    return sendJsonResponse(res, true, 'Available blood stock', {
      blood_stock: bloodStock,
      groups: ['A+','A-','B+','B-','AB+','AB-','O+','O-'],
      total_registered: Object.values(bloodStock).reduce((sum, value) => sum + value, 0)
    });
  } catch (error) {
    console.error('Blood stock fetch error:', error);
    return sendJsonResponse(res, false, 'Internal error', {}, 500);
  }
});

module.exports = router;
