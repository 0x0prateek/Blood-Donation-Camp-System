const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendJsonResponse, sanitize, dataTablePaging } = require('../utils/functions');

// POST /api/templates/list
router.post('/list', authMiddleware, async (req, res) => {
  try {
    const draw = parseInt(req.body.draw) || 1;
    const { start, length } = dataTablePaging(req);
    const searchValue = sanitize(req.body.search?.value || '');
    
    let orderColIdx = 0;
    let orderDir = 'DESC';
    if (req.body.order && req.body.order[0]) {
       orderColIdx = parseInt(req.body.order[0].column) || 0;
       orderDir = (req.body.order[0].dir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    }
    const columns = ['template_name', 'template_type', 'whatsapp_template_name', 'id'];
    const orderColumn = columns[orderColIdx] || 'id';

    let whereClauses = [];
    let queryParams = [];

    if (searchValue) {
      whereClauses.push('(template_name LIKE ? OR template_body LIKE ?)');
      queryParams.push(`%${searchValue}%`, `%${searchValue}%`);
    }

    const filter = req.body.filter || '';
    if (filter && filter !== 'all') {
      whereClauses.push('template_type = ?');
      queryParams.push(filter);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM message_templates');
    const [[{ filtered }]] = await pool.execute(`SELECT COUNT(*) as filtered FROM message_templates ${whereString}`, queryParams);

    const [data] = await pool.execute(
      `SELECT * FROM message_templates ${whereString} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...queryParams, length.toString(), start.toString()]
    );

    res.json({ draw, recordsTotal: total, recordsFiltered: filtered, data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/templates/save
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.body.id) || 0;
    const template_name = sanitize(req.body.template_name);
    const template_body = sanitize(req.body.template_body);
    const template_type = sanitize(req.body.template_type) || 'General';
    const whatsapp_template_name = sanitize(req.body.whatsapp_template_name || '');
    const whatsapp_language = sanitize(req.body.whatsapp_language || 'en');
    const whatsapp_variables = sanitize(req.body.whatsapp_variables || '');

    if (!template_name || !template_body) {
      return sendJsonResponse(res, false, 'Required fields missing', {}, 400);
    }

    if (id > 0) {
      await pool.execute(
        `UPDATE message_templates SET template_name=?, template_body=?, template_type=?, whatsapp_template_name=?, whatsapp_language=?, whatsapp_variables=? WHERE id=?`,
        [template_name, template_body, template_type, whatsapp_template_name, whatsapp_language, whatsapp_variables, id]
      );
      return sendJsonResponse(res, true, 'Template updated');
    } else {
      await pool.execute(
        `INSERT INTO message_templates (template_name, template_body, template_type, whatsapp_template_name, whatsapp_language, whatsapp_variables) VALUES (?, ?, ?, ?, ?, ?)`,
        [template_name, template_body, template_type, whatsapp_template_name, whatsapp_language, whatsapp_variables]
      );
      return sendJsonResponse(res, true, 'Template added');
    }
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal server error', {}, 500);
  }
});

// POST /api/templates/delete
router.post('/delete', authMiddleware, async (req, res) => {
  const id = parseInt(req.body.id);
  if (!id) return sendJsonResponse(res, false, 'Invalid ID', {}, 400);
  try {
    await pool.execute('DELETE FROM message_templates WHERE id = ?', [id]);
    return sendJsonResponse(res, true, 'Template deleted');
  } catch (error) {
    return sendJsonResponse(res, false, 'Internal error', {}, 500);
  }
});

module.exports = router;
