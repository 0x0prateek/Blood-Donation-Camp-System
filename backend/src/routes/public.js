const express = require('express');
const router = express.Router();
const pool = require('../config/db');
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
      total_donors,
      total_camps,
      total_donations,
      blood_groups_covered,
      estimated_lives_impacted: total_donations * 3
    });
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal error', {}, 500);
  }
});

module.exports = router;
