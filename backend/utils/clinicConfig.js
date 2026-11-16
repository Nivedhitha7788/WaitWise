const CLINIC_SPECIALIZATION = 'General Psychiatry';
const CONSULTATION_MINUTES = 60;
const MAX_DOCTORS = 2;
const CLINIC_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CLINIC_TIME_ZONE = 'Asia/Kolkata';

const SESSION_SLOTS = [
  {
    code: 'FN',
    slots: ['09:00 - 10:00', '10:15 - 11:15', '11:30 - 12:30']
  },
  {
    code: 'AN',
    slots: ['13:30 - 14:30', '14:45 - 15:45', '16:00 - 17:00']
  }
];

function buildAvailableSlots() {
  return CLINIC_DAYS.map(day => ({
    day,
    sessions: SESSION_SLOTS.map(session => ({
      code: session.code,
      slots: [...session.slots]
    }))
  }));
}

function getClinicDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isPastClinicSlot(date, slot, now = new Date()) {
  const clinicDate = getClinicDateKey(now);
  if (date < clinicDate) return true;
  if (date > clinicDate) return false;

  const timeZone = CLINIC_TIME_ZONE;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const currentMinute = Number(values.hour) * 60 + Number(values.minute);
  const [startHour, startMinute] = slot.split(' - ')[0].split(':').map(Number);
  return currentMinute >= startHour * 60 + startMinute;
}

module.exports = {
  CLINIC_SPECIALIZATION,
  CONSULTATION_MINUTES,
  MAX_DOCTORS,
  CLINIC_DAYS,
  CLINIC_TIME_ZONE,
  SESSION_SLOTS,
  buildAvailableSlots,
  getClinicDateKey,
  isPastClinicSlot
};
