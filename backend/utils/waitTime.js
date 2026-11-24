const { getClinicDateKey } = require('./clinicConfig');
const { getDayRange } = require('./dateHelper');

function getScheduledStart(appointment) {
  const date = getClinicDateKey(appointment.appointmentDate);
  const time = String(appointment.slot || '').split(' - ')[0];
  if (!/^\d{2}:\d{2}$/.test(time)) return null;
  return new Date(`${date}T${time}:00+05:30`);
}

function calculateEstimatedWaitTime(appointment, waitingAheadAppointments = [], activeConsultation = null, now = new Date()) {
  if (appointment.status !== 'waiting') return 0;
  const aheadAppointments = Array.isArray(waitingAheadAppointments)
    ? waitingAheadAppointments
    : [];

  let nextAvailableAt = now.getTime();
  if (activeConsultation) {
    const duration = Number(activeConsultation.consultationDurationMinutes) || 60;
    const startedAt = activeConsultation.consultationStartedAt
      ? new Date(activeConsultation.consultationStartedAt).getTime()
      : now.getTime();
    nextAvailableAt = Math.max(now.getTime(), startedAt + duration * 60000);
  }

  for (const waiting of aheadAppointments) {
    const scheduledStart = getScheduledStart(waiting);
    const startAt = Math.max(nextAvailableAt, scheduledStart ? scheduledStart.getTime() : nextAvailableAt);
    const duration = Number(waiting.consultationDurationMinutes)
      || Number(appointment.consultationDurationMinutes)
      || 60;
    nextAvailableAt = startAt + duration * 60000;
  }

  const scheduledStart = getScheduledStart(appointment);
  const estimatedStart = Math.max(
    nextAvailableAt,
    scheduledStart ? scheduledStart.getTime() : nextAvailableAt
  );
  return Math.max(0, Math.ceil((estimatedStart - now.getTime()) / 60000));
}

async function refreshEstimatedWaitTime(appointments, appointment, now = new Date()) {
  if (appointment.status !== 'waiting') return 0;

  const { start, end } = getDayRange(appointment.appointmentDate);
  const query = {
    doctorId: String(appointment.doctorId),
    appointmentDate: { $gte: start, $lte: end }
  };
  const [waitingAheadAppointments, activeConsultation] = await Promise.all([
    appointments.find({
      ...query,
      status: 'waiting',
      tokenNumber: { $lt: appointment.tokenNumber }
    }).sort({ tokenNumber: 1 }).toArray(),
    appointments.findOne({ ...query, status: 'in-consultation' })
  ]);
  const estimatedWaitTime = calculateEstimatedWaitTime(
    appointment,
    waitingAheadAppointments,
    activeConsultation,
    now
  );
  await appointments.updateOne(
    { _id: appointment._id },
    { $set: { estimatedWaitTime } }
  );
  return estimatedWaitTime;
}

module.exports = { calculateEstimatedWaitTime, refreshEstimatedWaitTime };
