const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize } = require('../utils/functions');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const email = sanitize(req.body.email || '');
  const password = req.body.password || '';

  if (!email || !password) {
    return sendJsonResponse(res, false, 'Email and password are required', {}, 400);
  }

  try {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0) {
      return sendJsonResponse(res, false, 'Invalid email or password', {}, 401);
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return sendJsonResponse(res, false, 'Invalid email or password', {}, 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return sendJsonResponse(res, true, 'Logged in successfully', {
      user: { id: admin.id, name: admin.name, email: admin.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  return sendJsonResponse(res, true, 'Logged out successfully');
});

// POST /api/auth/account-save
router.post('/account-save', authMiddleware, async (req, res) => {
  const { name, email, new_password } = req.body;
  const adminId = req.user.id;

  try {
    const [rows] = await pool.execute('SELECT id FROM admins WHERE email = ? AND id != ?', [email, adminId]);
    if (rows.length > 0) {
      return sendJsonResponse(res, false, 'Email is already taken by another admin', {}, 400);
    }

    let query = 'UPDATE admins SET name = ?, email = ?';
    const params = [name, email];

    if (new_password) {
      const hash = await bcrypt.hash(new_password, 10);
      query += ', password = ?';
      params.push(hash);
    }

    query += ' WHERE id = ?';
    params.push(adminId);

    await pool.execute(query, params);

    return sendJsonResponse(res, true, 'Account updated successfully');
  } catch (error) {
    console.error('Account save error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  return sendJsonResponse(res, true, 'Authenticated', { user: req.user });
});

module.exports = router;
