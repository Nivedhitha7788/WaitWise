const { getClinicDateKey } = require('../utils/clinicConfig');

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const TWILIO_ENDPOINT = 'https://api.twilio.com/2010-04-01/Accounts';

function isConfigured(...values) {
  return values.every(value => typeof value === 'string' && value.trim());
}

function getNotificationAvailability(env = process.env) {
  return {
    email: isConfigured(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL),
    sms: isConfigured(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN, env.TWILIO_FROM_NUMBER)
  };
}

function getNotificationContent(event, appointment) {
  const token = `Token #${appointment.tokenNumber}`;
  const slot = appointment.slot ? ` Slot: ${appointment.slot}.` : '';
  const date = appointment.appointmentDate
    ? ` Date: ${getClinicDateKey(appointment.appointmentDate)}.`
    : '';
  if (event === 'booking') {
    return {
      subject: 'WaitWise appointment confirmed',
      email: `Your WaitWise OP appointment is confirmed. ${token}.${date}${slot}`,
      sms: `WaitWise: Your appointment is confirmed. ${token}.${date}${slot}`
    };
  }
  if (event === 'turn') {
    return {
      subject: 'WaitWise: your turn is ready',
      email: `Your WaitWise token is ready. ${token}. Please proceed to the OP consultation room.`,
      sms: `WaitWise: Your turn is ready. ${token}. Please proceed to the OP consultation room.`
    };
  }
  throw new Error(`Unsupported notification event: ${event}`);
}

async function postToProvider(fetchImpl, url, options, provider) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetchImpl(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`${provider} API returned HTTP ${response.status}.`);
  } finally {
    clearTimeout(timeout);
  }
}

async function dispatchAppointmentNotifications({ patient, appointment, event }, options = {}) {
  const env = options.env || process.env;
  const fetchImpl = options.fetch || globalThis.fetch;
  const availability = getNotificationAvailability(env);
  const preferences = patient.notificationPreferences || {};
  const content = getNotificationContent(event, appointment);
  const outcomes = {};

  if (preferences.email === true) {
    if (!availability.email) {
      outcomes.email = {
        status: 'unavailable',
        message: 'Email notification service is not configured.'
      };
    } else {
      try {
        await postToProvider(fetchImpl, RESEND_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: env.RESEND_FROM_EMAIL,
            to: [patient.email],
            subject: content.subject,
            text: content.email
          })
        }, 'Resend');
        outcomes.email = { status: 'accepted', message: 'Resend accepted the email notification.' };
      } catch (error) {
        console.error('Resend notification delivery failed:', error.message);
        outcomes.email = { status: 'failed', message: 'Email notification failed; check server logs.' };
      }
    }
  }

  if (preferences.sms === true) {
    if (!availability.sms) {
      outcomes.sms = {
        status: 'unavailable',
        message: 'SMS notification service is not configured.'
      };
    } else {
      try {
        const accountId = encodeURIComponent(env.TWILIO_ACCOUNT_SID);
        const credentials = Buffer.from(
          `${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`
        ).toString('base64');
        const phone = String(patient.phone || '').replace(/[()\s-]/g, '');
        await postToProvider(fetchImpl, `${TWILIO_ENDPOINT}/${accountId}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: env.TWILIO_FROM_NUMBER,
            To: phone,
            Body: content.sms
          }).toString()
        }, 'Twilio');
        outcomes.sms = { status: 'accepted', message: 'Twilio accepted the SMS notification.' };
      } catch (error) {
        console.error('Twilio notification delivery failed:', error.message);
        outcomes.sms = { status: 'failed', message: 'SMS notification failed; check server logs.' };
      }
    }
  }

  return outcomes;
}

module.exports = { getNotificationAvailability, dispatchAppointmentNotifications };
