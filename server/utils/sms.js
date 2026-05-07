const axios = require('axios');

function formatPhone(phone) {
  return String(phone).replace(/\D/g, '').replace(/^91/, '');
}

async function sendSms(phone, message) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey === 'your_fast2sms_api_key_here') {
    console.log(`[SMS] API key not set — skipping to ${phone}`);
    return { skipped: true };
  }

  const number = formatPhone(phone);
  const { data } = await axios.post(
    'https://www.fast2sms.com/dev/bulkV2',
    {
      route: 'q',
      message,
      language: 'english',
      flash: 0,
      numbers: number,
    },
    {
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
      },
    }
  );
  return data;
}

module.exports = { sendSms };
