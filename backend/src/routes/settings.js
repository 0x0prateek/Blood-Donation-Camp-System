const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse } = require('../utils/functions');
const { whatsAppSend, smsSend } = require('../utils/messaging');

// Non-persisted keys the Settings.vue form/test panel may post alongside
// real settings - never write these into the settings table.
const NON_SETTING_KEYS = ['test', 'test_mobile', 'action', 'test_phone', 'test_message', 'test_template', 'test_language'];

// POST /api/settings/save
// Settings.vue posts to this same endpoint for two different purposes:
//  - a plain settings object (Save Settings button)
//  - { action: 'test_whatsapp' | 'test_sms', test_phone, test_message, test_template, test_language } (Test buttons)
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const body = req.body || {};

    if (body.action === 'test_whatsapp' || body.action === 'test_sms') {
      const testMobile = body.test_phone || body.test_mobile;
      if (!testMobile) {
        return sendJsonResponse(res, false, 'Enter a test phone number.', {}, 400);
      }

      const [rows] = await pool.execute('SELECT setting_key, setting_value FROM settings');
      const currentSettings = {};
      rows.forEach(r => currentSettings[r.setting_key] = r.setting_value);

      let testResult;
      if (body.action === 'test_whatsapp') {
        const [name, lang] = (body.test_template || 'hello_world|en_US').split('|');
        const payload = {
          messaging_product: 'whatsapp',
          to: testMobile,
          type: 'template',
          template: {
            name: name || 'hello_world',
            language: { code: lang || body.test_language || 'en_US' }
          }
        };
        testResult = await whatsAppSend(payload, currentSettings);
      } else {
        testResult = await smsSend(testMobile, body.test_message || 'This is a test message from the Blood Donor Management System.', currentSettings);
      }

      if (testResult.ok) {
        return sendJsonResponse(res, true, 'Test message sent successfully.', { testResult });
      }
      return sendJsonResponse(res, false, `Test message failed: ${testResult.detail}`, { testResult }, 400);
    }

    if (typeof body !== 'object') {
      return sendJsonResponse(res, false, 'Invalid data', {}, 400);
    }

    const keysToSave = Object.keys(body).filter(k => !NON_SETTING_KEYS.includes(k));

    for (const key of keysToSave) {
      const value = body[key] || '';
      await pool.execute(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
      );
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
