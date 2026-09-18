const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, normalizeMobile } = require('../utils/functions');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return sendJsonResponse(res, false, 'Administrator access required', {}, 403);
  }
  next();
};

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

router.get('/admin/list', authMiddleware, adminOnly, async (req, res) => {
  try {
    const status = sanitize(req.query.status || '');
    const bloodGroup = sanitize(req.query.blood_group || '');
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('br.status = ?');
      params.push(status);
    }
    if (bloodGroup) {
      conditions.push('br.blood_group = ?');
      params.push(bloodGroup);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.execute(
      `SELECT br.*, u.username, u.email AS account_email
       FROM blood_requests br
       LEFT JOIN users u ON u.id = br.user_id
       ${where}
       ORDER BY br.created_at DESC`,
      params
    );
    return sendJsonResponse(res, true, 'Blood requests loaded', { requests: rows });
  } catch (error) {
    console.error('Admin blood request list error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

router.patch('/admin/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const status = sanitize(req.body.status || '');
  if (!['Open', 'Matched', 'Closed'].includes(status)) {
    return sendJsonResponse(res, false, 'Invalid request status', {}, 400);
  }

  try {
    const [result] = await pool.execute(
      'UPDATE blood_requests SET status = ? WHERE id = ?',
      [status, Number(req.params.id)]
    );
    if (result.affectedRows === 0) {
      return sendJsonResponse(res, false, 'Blood request not found', {}, 404);
    }
    return sendJsonResponse(res, true, 'Blood request status updated');
  } catch (error) {
    console.error('Admin blood request status error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

module.exports = router;
