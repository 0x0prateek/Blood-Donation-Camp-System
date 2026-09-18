const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, normalizeMobile } = require('../utils/functions');
const { getAuthTable, normalizeRole } = require('../utils/authRoles');

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
  const roleInput = normalizeRole(req.body.role || 'admin');
  const loginValue = sanitize(req.body.email || req.body.username || req.body.login || '');
  const password = req.body.password || '';
  const ip = req.ip || req.socket?.remoteAddress || '';

  if (!loginValue || !password) {
    return sendJsonResponse(res, false, 'Email/username and password are required', {}, 400);
  }

  try {
    if (await isLockedOut(loginValue, ip)) {
      return sendJsonResponse(res, false, `Too many failed attempts. Try again in ${THROTTLE_WINDOW_MINUTES} minutes.`, {}, 429);
    }

    const table = getAuthTable(roleInput);
    const query = table === 'admins'
      ? 'SELECT * FROM admins WHERE email = ?'
      : 'SELECT * FROM users WHERE email = ? OR username = ? ORDER BY id LIMIT 1';
    const params = table === 'admins' ? [loginValue] : [loginValue, loginValue];
    const [rows] = await pool.execute(query, params);

    if (rows.length === 0) {
      await recordAttempt(loginValue, ip, false);
      return sendJsonResponse(res, false, 'Invalid credentials', {}, 401);
    }

    const account = rows[0];
    const match = await bcrypt.compare(password, account.password);
    if (!match) {
      await recordAttempt(loginValue, ip, false);
      return sendJsonResponse(res, false, 'Invalid credentials', {}, 401);
    }

    if (table === 'users' && account.status !== 'Active') {
      return sendJsonResponse(res, false, 'Your account is inactive. Contact the administrator.', {}, 403);
    }

    await recordAttempt(loginValue, ip, true);

    const expiryHours = parseInt(process.env.JWT_EXPIRY_HOURS) || 24;
    const payload = {
      id: account.id,
      name: account.name,
      email: account.email,
      username: account.username || null,
      role: table === 'admins' ? 'admin' : 'user',
      mobile: account.mobile || null,
      blood_group: account.blood_group || null
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: `${expiryHours}h` });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiryHours * 60 * 60 * 1000
    });

    return sendJsonResponse(res, true, 'Logged in successfully', { user: payload });
  } catch (error) {
    console.error('Login error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const name = sanitize(req.body.name || '');
  const username = sanitize(req.body.username || '');
  const email = sanitize(req.body.email || '');
  const mobile = normalizeMobile(sanitize(req.body.mobile || ''));
  const password = req.body.password || '';
  const confirmPassword = req.body.confirm_password || '';
  const blood_group = sanitize(req.body.blood_group || '');

  if (!name || !username || !email || !mobile || !password || !blood_group) {
    return sendJsonResponse(res, false, 'All required fields are required', {}, 400);
  }

  if (password.length < 8) {
    return sendJsonResponse(res, false, 'Password must be at least 8 characters', {}, 400);
  }

  if (password !== confirmPassword) {
    return sendJsonResponse(res, false, 'Passwords do not match', {}, 400);
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return sendJsonResponse(res, false, 'Username can only contain letters, numbers and underscore', {}, 400);
  }

  try {
    const [emailRows] = await pool.execute('SELECT id FROM users WHERE email = ? OR username = ? OR mobile = ?', [email, username, mobile]);
    if (emailRows.length > 0) {
      return sendJsonResponse(res, false, 'An account with this email, username or mobile already exists', {}, 409);
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, username, email, mobile, blood_group, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, username, email, mobile, blood_group, hash, 'user', 'Active']
    );

    return sendJsonResponse(res, true, 'Account created successfully', {
      userId: result.insertId
    }, 201);
  } catch (error) {
    console.error('Signup error:', error);
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
