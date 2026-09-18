// Node 20 has native fetch

const whatsAppSend = async (payload, settings) => {
  const token = settings.whatsapp_api_token;
  const phoneId = settings.whatsapp_phone_number_id;
  const version = settings.whatsapp_api_version || 'v23.0';

  if (!token || !phoneId) {
    return {
      ok: false,
      status: 'Failed',
      detail: 'WhatsApp API credentials not configured.',
      raw: '',
      http: 0,
      gateway: 'WhatsApp'
    };
  }

  const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.text();
    const ok = response.ok;
    
    // Attempt to parse JSON to find error details if any
    let parsed = {};
    try { parsed = JSON.parse(data); } catch(e) {}

    return {
      ok,
      status: ok ? 'Sent' : 'Failed',
      detail: ok ? 'Message sent' : (parsed.error?.message || `HTTP ${response.status}`),
      raw: data,
      http: response.status,
      gateway: 'WhatsApp'
    };

  } catch (error) {
    return {
      ok: false,
      status: 'Failed',
      detail: error.message,
      raw: error.toString(),
      http: 0,
      gateway: 'WhatsApp'
    };
  }
};

const sendNotifySms = async (phone, message, userId, apiKey, senderId) => {
  if (!userId || !apiKey) {
    return {
      ok: false,
      status: 'Failed',
      detail: 'Notify.lk credentials not configured.',
      raw: '',
      http: 0,
      gateway: 'Notify.lk'
    };
  }

  const url = 'https://app.notify.lk/api/v1/send';
  const payload = {
    user_id: userId,
    api_key: apiKey,
    sender_id: senderId,
    to: phone,
    message: message
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.text();
    let parsed = {};
    try { parsed = JSON.parse(data); } catch(e) {}

    // Notify.lk uses "status": "success"
    const isSuccess = parsed.status === 'success';

    return {
      ok: isSuccess,
      status: isSuccess ? 'Sent' : 'Failed',
      detail: isSuccess ? 'Message sent' : (parsed.errors ? JSON.stringify(parsed.errors) : (parsed.message || `HTTP ${response.status}`)),
      raw: data,
      http: response.status,
      gateway: 'Notify.lk'
    };
  } catch (error) {
    return {
      ok: false,
      status: 'Failed',
      detail: error.message,
      raw: error.toString(),
      http: 0,
      gateway: 'Notify.lk'
    };
  }
};

const sendTwilioSms = async (phone, message, accountSid, authToken, fromNumber) => {
  if (!accountSid || !authToken || !fromNumber) {
    return {
      ok: false,
      status: 'Failed',
      detail: 'Twilio credentials not configured.',
      raw: '',
      http: 0,
      gateway: 'Twilio'
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({ To: phone, From: fromNumber, Body: message });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    const data = await response.text();
    let parsed = {};
    try { parsed = JSON.parse(data); } catch (e) {}

    const ok = response.ok && !parsed.error_code;

    return {
      ok,
      status: ok ? 'Sent' : 'Failed',
      detail: ok ? 'Message sent' : (parsed.message || `HTTP ${response.status}`),
      raw: data,
      http: response.status,
      gateway: 'Twilio'
    };
  } catch (error) {
    return {
      ok: false,
      status: 'Failed',
      detail: error.message,
      raw: error.toString(),
      http: 0,
      gateway: 'Twilio'
    };
  }
};

const smsSend = async (phone, message, settings) => {
  const gateway = settings.sms_gateway || 'notify';

  if (gateway === 'notify') {
    return sendNotifySms(
      phone,
      message,
      settings.sms_api_key,    // Notify.lk user_id
      settings.sms_api_secret, // Notify.lk api_key
      settings.sms_sender_id
    );
  }

  if (gateway === 'twilio') {
    return sendTwilioSms(
      phone,
      message,
      settings.sms_api_key,    // Twilio Account SID
      settings.sms_api_secret, // Twilio Auth Token
      settings.sms_sender_id   // Twilio From number
    );
  }

  return {
    ok: false,
    status: 'Failed',
    detail: `Gateway ${gateway} is not wired for live sends yet - contact info is stored, but no API call is made.`,
    raw: '',
    http: 0,
    gateway
  };
};

module.exports = {
  whatsAppSend,
  smsSend
};
