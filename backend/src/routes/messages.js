const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, dataTablePaging, logMessage, replacePlaceholders, formatPhoneForAPI } = require('../utils/functions');
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
      whereClauses.push('(ml.mobile LIKE ? OR ml.message LIKE ?)');
      queryParams.push(`%${searchValue}%`, `%${searchValue}%`);
    }

    const type = req.body.type || '';
    if (type) {
      whereClauses.push('ml.message_type = ?');
      queryParams.push(type);
    }

    const status = req.body.status || '';
    if (status) {
      whereClauses.push('ml.status = ?');
      queryParams.push(status);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM message_logs');
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM message_logs ml ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT ml.*, COALESCE(d.donor_name, s.name) AS donor_name
       FROM message_logs ml
       LEFT JOIN donors d ON d.id = ml.donor_id
       LEFT JOIN staff s ON s.id = ml.staff_id
       ${whereString}
       ORDER BY ml.${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    res.json({ draw, recordsTotal: total, recordsFiltered: filtered, data });
  } catch (error) {
    console.error('Message log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const getSettings = async () => {
  const [rows] = await pool.execute('SELECT setting_key, setting_value FROM settings');
  const settings = {};
  rows.forEach(r => settings[r.setting_key] = r.setting_value);
  return settings;
};

const getTemplate = async (templateId) => {
  if (!templateId) return null;
  const [rows] = await pool.execute('SELECT * FROM message_templates WHERE id = ?', [templateId]);
  return rows[0] || null;
};

// Resolve {NAME}/{DATE}/{LOCATION}/{BLOOD_GROUP}/{MESSAGE} placeholders for one recipient.
const resolvePlaceholders = (rec, req) => ({
  NAME: rec.name || '',
  DATE: req.body.date || '',
  LOCATION: req.body.location || '',
  BLOOD_GROUP: req.body.blood_group || '',
  MESSAGE: req.body.custom_message || req.body.message || ''
});

// Build a Meta WhatsApp template payload, mapping the template's named
// variable order (e.g. "NAME,DATE,LOCATION") onto {{1}},{{2}},... in order.
const buildTemplatePayload = (to, template, values) => {
  const varNames = (template.whatsapp_variables || '').split(',').map(v => v.trim()).filter(Boolean);
  const parameters = varNames.map(name => ({
    type: 'text',
    text: (values[name] !== undefined && values[name] !== '') ? String(values[name]) : '-'
  }));

  const components = parameters.length > 0 ? [{ type: 'body', parameters }] : [];

  return {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: template.whatsapp_template_name,
      language: { code: template.whatsapp_language || 'en' },
      components
    }
  };
};

// Common chunked sending logic for both SMS and WhatsApp
const processSending = async (req, res, type) => {
  try {
    // Messages.vue/Emergency.vue send `recipient_type`; accept `target` too.
    const rawTarget = req.body.target || req.body.recipient_type;
    const targetMap = { all: 'all_donors', all_donors: 'all_donors', blood_group: 'blood_group', staff: 'staff', selected: 'selected_donors', selected_donors: 'selected_donors', test: 'test' };
    const target = targetMap[rawTarget] || rawTarget;

    let campaign_id = req.body.campaign_id;
    const offset = parseInt(req.body.offset) || 0;
    const chunk = parseInt(req.body.chunk) || 40;

    const sendMode = req.body.send_mode || 'template'; // 'template' | 'text'
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
    } else if (target === 'selected_donors') {
      const ids = (req.body.donor_ids || []).map(id => parseInt(id)).filter(Boolean);
      if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        const [rows] = await pool.execute(`SELECT id, mobile, donor_name as name FROM donors WHERE id IN (${placeholders})`, ids);
        recipients = rows;
      }
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

    let template = null;
    if (type === 'WhatsApp' && sendMode === 'template') {
      template = await getTemplate(templateId);
      if (!template || !template.whatsapp_template_name) {
        return sendJsonResponse(res, false, 'Selected template has no WhatsApp template name configured. Set it on the Templates page first.', {}, 400);
      }
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const rec of slice) {
      // Check if already sent in this campaign
      if (campaign_id && rec.id) {
        const idCol = rec.is_staff ? 'staff_id' : 'donor_id';
        const [existing] = await pool.execute(
          `SELECT id FROM message_logs WHERE campaign_id = ? AND ${idCol} = ? AND status = 'Sent'`,
          [campaign_id, rec.id]
        );
        if (existing.length > 0) { skipped++; continue; }
      }

      const values = resolvePlaceholders(rec, req);
      const text = replacePlaceholders(req.body.message || template?.template_body || '', values);
      let result;

      if (type === 'WhatsApp') {
        const to = formatPhoneForAPI(rec.mobile).replace('+', '');
        let payload;
        if (sendMode === 'template' && template) {
          payload = buildTemplatePayload(to, template, values);
        } else {
          payload = { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } };
        }
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
        skipped,
        pending: total - processed,
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
