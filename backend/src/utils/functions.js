const pool = require('../config/db');

const sanitize = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim();
};

const sendJsonResponse = (res, success, message = '', data = {}, httpCode = 200) => {
  return res.status(httpCode).json({
    success,
    message,
    data
  });
};

const getSetting = async (key, defaultValue = '') => {
  const [rows] = await pool.execute('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
  if (rows.length > 0) {
    return rows[0].setting_value;
  }
  return defaultValue;
};

const formatDate = (dateStr, format = 'd M Y') => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

const normalizeMobile = (phone) => {
  if (!phone) return '';
  let digits = phone.replace(/\D+/g, '');
  if (digits === '') return '';

  if (digits.startsWith('94') && digits.length === 11) {
    digits = '0' + digits.substring(2);
  }
  if (digits.length === 9 && digits.startsWith('7')) {
    digits = '0' + digits;
  }
  if (digits.length !== 10 || !digits.startsWith('0')) {
    return phone; // Return original if not matched Sri Lankan pattern
  }
  return digits;
};

const formatPhoneForAPI = (phone) => {
  let normalized = normalizeMobile(phone);
  if (normalized.startsWith('0')) {
    return '+94' + normalized.substring(1);
  }
  return normalized;
};

const replacePlaceholders = (template, data) => {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
};

const formatMoney = (amount, currencySymbol = 'Rs.') => {
  if (amount == null) return `${currencySymbol} 0.00`;
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currencySymbol} 0.00`;
  return `${currencySymbol} ${num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

const dataTablePaging = (req, maxLength = 100, defaultLength = 25) => {
  let start = Math.max(0, parseInt(req.body.start) || parseInt(req.query.start) || 0);
  let length = parseInt(req.body.length) || parseInt(req.query.length) || defaultLength;
  length = length <= 0 ? maxLength : Math.min(length, maxLength);
  return { start, length };
};

const logMessage = async (donorId, type, mobile, message, status, apiResponse = '', staffId = null, campaignId = null) => {
  const query = `
    INSERT INTO message_logs 
    (donor_id, message_type, mobile, message, status, api_response, staff_id, campaign_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    donorId, type, mobile, message, status, apiResponse, staffId, campaignId
  ]);
  return result.insertId;
};

module.exports = {
  sanitize,
  sendJsonResponse,
  getSetting,
  formatDate,
  formatTime,
  normalizeMobile,
  formatPhoneForAPI,
  replacePlaceholders,
  formatMoney,
  dataTablePaging,
  logMessage
};
