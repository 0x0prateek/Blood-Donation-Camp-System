const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse } = require('../utils/functions');
const { whatsAppSend, smsSend } = require('../utils/messaging');

// POST /api/settings/save
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const settings = req.body; // Key-value object
    if (!settings || typeof settings !== 'object') {
      return sendJsonResponse(res, false, 'Invalid data', {}, 400);
    }

    const testType = req.body.test; // 'whatsapp' or 'sms'
    const testMobile = req.body.test_mobile;

    // Filter out test keys
    const keysToSave = Object.keys(settings).filter(k => k !== 'test' && k !== 'test_mobile');

    for (const key of keysToSave) {
      const value = settings[key] || '';
      await pool.execute(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
      );
    }

    // Refresh settings object for test
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM settings');
    const currentSettings = {};
    rows.forEach(r => currentSettings[r.setting_key] = r.setting_value);

    let testResult = null;
    if (testType === 'whatsapp' && testMobile) {
      const payload = {
        messaging_product: 'whatsapp',
        to: testMobile,
        type: 'template',
        template: {
          name: 'hello_world', // Example test template
          language: { code: 'en_US' }
        }
      };
      testResult = await whatsAppSend(payload, currentSettings);
    } else if (testType === 'sms' && testMobile) {
      testResult = await smsSend(testMobile, 'This is a test message from Blood Donation Camp System.', currentSettings);
    }

    if (testResult) {
      if (testResult.ok) {
         return sendJsonResponse(res, true, `Settings saved. Test message sent successfully.`, { testResult });
      } else {
         return sendJsonResponse(res, false, `Settings saved, but test message failed: ${testResult.detail}`, { testResult });
      }
    }

    return sendJsonResponse(res, true, 'Settings saved successfully');
  } catch (error) {
    console.error('Settings save error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// GET /api/settings/load
router.get('/load', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    return sendJsonResponse(res, true, 'Settings loaded', { settings });
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal error', {}, 500);
  }
});

module.exports = router;
