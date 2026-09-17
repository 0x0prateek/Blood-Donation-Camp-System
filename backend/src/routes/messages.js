const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, dataTablePaging, logMessage } = require('../utils/functions');
const { whatsAppSend, smsSend } = require('../utils/messaging');

// POST /api/messages/log
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const draw = parseInt(req.body.draw) || 1;
    const { start, length } = dataTablePaging(req);
    const searchValue = req.body.search?.value || '';
    
    let orderColIdx = 0;
    let orderDir = 'DESC';
    if (req.body.order && req.body.order[0]) {
       orderColIdx = parseInt(req.body.order[0].column) || 0;
       orderDir = (req.body.order[0].dir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    }
    const columns = ['mobile', 'message_type', 'message', 'status', 'sent_at', 'id'];
    const orderColumn = columns[orderColIdx] || 'id';

    let whereClauses = [];
    let queryParams = [];

    if (searchValue) {
      whereClauses.push('(mobile LIKE ? OR message LIKE ?)');
      queryParams.push(`%${searchValue}%`, `%${searchValue}%`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM message_logs');
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM message_logs ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM message_logs ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    res.json({ draw, recordsTotal: total, recordsFiltered: filtered, data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const getSettings = async () => {
  const [rows] = await pool.execute('SELECT setting_key, setting_value FROM settings');
  const settings = {};
  rows.forEach(r => settings[r.setting_key] = r.setting_value);
  return settings;
};

// Common chunked sending logic for both SMS and WhatsApp
const processSending = async (req, res, type) => {
  try {
    const target = req.body.target;
    let campaign_id = req.body.campaign_id;
    const offset = parseInt(req.body.offset) || 0;
    const chunk = parseInt(req.body.chunk) || 40;

    let messageBody = req.body.message;
    let templateId = req.body.template_id;

    if (!campaign_id) {
      campaign_id = crypto.randomBytes(16).toString('hex');
    }

    let recipients = [];
    if (target === 'all_donors') {
      const [rows] = await pool.execute('SELECT id, mobile, donor_name as name FROM donors WHERE status = "Active"');
      recipients = rows;
    } else if (target === 'blood_group') {
      const group = req.body.blood_group;
      const [rows] = await pool.execute('SELECT id, mobile, donor_name as name FROM donors WHERE status = "Active" AND blood_group = ?', [group]);
      recipients = rows;
    } else if (target === 'camp_donors') {
      const camp = req.body.camp_id;
      const [rows] = await pool.execute('SELECT donor_id as id, mobile, donor_name as name FROM camp_registrations WHERE camp_id = ? AND donor_id IS NOT NULL', [camp]);
      recipients = rows;
    } else if (target === 'staff') {
      const [rows] = await pool.execute('SELECT id, mobile, name FROM staff WHERE status = "Active"');
      recipients = rows.map(r => ({ ...r, is_staff: true }));
    } else if (target === 'test') {
      recipients = [{ id: null, mobile: req.body.test_mobile, name: 'Test User' }];
    } else {
      return sendJsonResponse(res, false, 'Invalid target');
    }

    const total = recipients.length;
    const slice = recipients.slice(offset, offset + chunk);
    const settings = await getSettings();

    let sent = 0;
    let failed = 0;

    for (const rec of slice) {
      // Check if already sent in this campaign
      if (campaign_id && rec.id) {
        const idCol = rec.is_staff ? 'staff_id' : 'donor_id';
        const [existing] = await pool.execute(
          `SELECT id FROM message_logs WHERE campaign_id = ? AND ${idCol} = ? AND status = 'Sent'`,
          [campaign_id, rec.id]
        );
        if (existing.length > 0) continue; // Skip already sent
      }

      let text = messageBody.replace('{NAME}', rec.name);
      let result;

      if (type === 'WhatsApp') {
        const payload = {
          messaging_product: 'whatsapp',
          to: rec.mobile.replace('0', '94'), // simple formatting for lk
          type: 'template',
          template: {
            name: req.body.whatsapp_template_name,
            language: { code: req.body.whatsapp_language || 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: rec.name }
                  // Add more parameters dynamically based on template config if needed
                ]
              }
            ]
          }
        };
        result = await whatsAppSend(payload, settings);
      } else {
        result = await smsSend(rec.mobile, text, settings);
      }

      if (result.ok) sent++;
      else failed++;

      const donorId = rec.is_staff ? null : rec.id;
      const staffId = rec.is_staff ? rec.id : null;
      await logMessage(donorId, type, rec.mobile, text, result.status, result.raw, staffId, campaign_id);
    }

    const processed = offset + slice.length;
    const done = processed >= total;

    return res.json({
      success: true,
      data: {
        campaign_id,
        total,
        processed,
        sent,
        failed,
        done,
        next_offset: done ? null : processed
      }
    });

  } catch (error) {
    console.error('Send error:', error);
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
};

// POST /api/messages/send-whatsapp
router.post('/send-whatsapp', authMiddleware, async (req, res) => {
  return processSending(req, res, 'WhatsApp');
});

// POST /api/messages/send-sms
router.post('/send-sms', authMiddleware, async (req, res) => {
  return processSending(req, res, 'SMS');
});

module.exports = router;
