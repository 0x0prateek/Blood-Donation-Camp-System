const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, normalizeMobile } = require('../utils/functions');

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const requester_name = sanitize(req.body.requester_name || '');
    const contact_mobile = normalizeMobile(sanitize(req.body.contact_mobile || ''));
    const blood_group = sanitize(req.body.blood_group || '');
    const units_needed = parseInt(req.body.units_needed || 1, 10);
    const urgency = sanitize(req.body.urgency || 'Moderate');
    const hospital_name = sanitize(req.body.hospital_name || '');
    const location = sanitize(req.body.location || '');
    const details = sanitize(req.body.details || '');

    if (!requester_name || !contact_mobile || !blood_group || !Number.isFinite(units_needed) || units_needed < 1) {
      return sendJsonResponse(res, false, 'Please provide valid name, mobile, blood group and units.', {}, 400);
    }

    const [result] = await pool.execute(
      `INSERT INTO blood_requests (user_id, requester_name, contact_mobile, blood_group, units_needed, hospital_name, location, urgency, details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open')`,
      [req.user.id, requester_name, contact_mobile, blood_group, units_needed, hospital_name, location, urgency, details]
    );

    return sendJsonResponse(res, true, 'Blood inquiry submitted successfully', { id: result.insertId });
  } catch (error) {
    console.error('Blood request create error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM blood_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    return sendJsonResponse(res, true, 'Requests loaded', { requests: rows });
  } catch (error) {
    console.error('Blood request list error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

module.exports = router;
