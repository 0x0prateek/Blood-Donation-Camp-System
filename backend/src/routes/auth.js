const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize } = require('../utils/functions');

const MAX_ATTEMPTS_PER_EMAIL = 5;
const MAX_ATTEMPTS_PER_IP = 20;
const THROTTLE_WINDOW_MINUTES = 15;

const recordAttempt = async (email, ip, successful) => {
  await pool.execute(
    'INSERT INTO login_attempts (email, ip_address, successful) VALUES (?, ?, ?)',
    [email, ip, successful ? 1 : 0]
  );
};

const isLockedOut = async (email, ip) => {
  const [[byEmail]] = await pool.execute(
    `SELECT COUNT(*) AS c FROM login_attempts
     WHERE email = ? AND successful = 0 AND attempted_at >= DATE_SUB(NOW(), INTERVAL ${THROTTLE_WINDOW_MINUTES} MINUTE)`,
    [email]
  );
  if (byEmail.c >= MAX_ATTEMPTS_PER_EMAIL) return true;

  const [[byIp]] = await pool.execute(
    `SELECT COUNT(*) AS c FROM login_attempts
     WHERE ip_address = ? AND successful = 0 AND attempted_at >= DATE_SUB(NOW(), INTERVAL ${THROTTLE_WINDOW_MINUTES} MINUTE)`,
    [ip]
  );
  return byIp.c >= MAX_ATTEMPTS_PER_IP;
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const email = sanitize(req.body.email || '');
  const password = req.body.password || '';
  const ip = req.ip || req.socket?.remoteAddress || '';

  if (!email || !password) {
    return sendJsonResponse(res, false, 'Email and password are required', {}, 400);
  }

  try {
    if (await isLockedOut(email, ip)) {
      return sendJsonResponse(res, false, `Too many failed attempts. Try again in ${THROTTLE_WINDOW_MINUTES} minutes.`, {}, 429);
    }

    const [rows] = await pool.execute('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0) {
      await recordAttempt(email, ip, false);
      return sendJsonResponse(res, false, 'Invalid email or password', {}, 401);
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      await recordAttempt(email, ip, false);
      return sendJsonResponse(res, false, 'Invalid email or password', {}, 401);
    }

    await recordAttempt(email, ip, true);

    // Generate JWT
    const expiryHours = parseInt(process.env.JWT_EXPIRY_HOURS) || 24;
    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: `${expiryHours}h` }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiryHours * 60 * 60 * 1000
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
  const { name, email, new_password, current_password } = req.body;
  const adminId = req.user.id;

  if (!name || !email || !current_password) {
    return sendJsonResponse(res, false, 'Current password is required to save any change', {}, 400);
  }

  if (new_password && new_password.length < 10) {
    return sendJsonResponse(res, false, 'New password must be at least 10 characters', {}, 400);
  }

  try {
    const [adminRows] = await pool.execute('SELECT * FROM admins WHERE id = ?', [adminId]);
    if (adminRows.length === 0) {
      return sendJsonResponse(res, false, 'Account not found', {}, 404);
    }

    const match = await bcrypt.compare(current_password, adminRows[0].password);
    if (!match) {
      return sendJsonResponse(res, false, 'Current password is incorrect', {}, 400);
    }

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
