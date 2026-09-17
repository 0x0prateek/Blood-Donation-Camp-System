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

const smsSend = async (phone, message, settings) => {
  const gateway = settings.sms_gateway || 'notify'; // notify or twilio, assuming notify based on args

  if (gateway === 'notify') {
    return sendNotifySms(
      phone,
      message,
      settings.sms_api_key,    // mapped to user_id in php
      settings.sms_api_secret, // mapped to api_key in php
      settings.sms_sender_id
    );
  }

  // Twilio implementation would go here... (simplified)
  return {
    ok: false,
    status: 'Failed',
    detail: `Gateway ${gateway} not implemented in Node yet.`,
    raw: '',
    http: 0,
    gateway: gateway
  };
};

module.exports = {
  whatsAppSend,
  smsSend
};
