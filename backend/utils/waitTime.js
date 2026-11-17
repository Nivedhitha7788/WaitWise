const { getClinicDateKey } = require('./clinicConfig');
const { getDayRange } = require('./dateHelper');

function getScheduledStart(appointment) {
  const date = getClinicDateKey(appointment.appointmentDate);
  const time = String(appointment.slot || '').split(' - ')[0];
  if (!/^\d{2}:\d{2}$/.test(time)) return null;
  return new Date(`${date}T${time}:00+05:30`);
}

function calculateEstimatedWaitTime(appointment, waitingAheadCount, activeConsultation, now = new Date()) {
  if (appointment.status !== 'waiting') return 0;

  if (!activeConsultation && Number(appointment.tokenNumber) === 1 && waitingAheadCount === 0) {
    const scheduledStart = getScheduledStart(appointment);
    if (scheduledStart) return Math.max(0, Math.ceil((scheduledStart.getTime() - now.getTime()) / 60000));
  }

  let activeConsultationRemaining = 0;
  if (activeConsultation) {
    const duration = Number(activeConsultation.consultationDurationMinutes) || 60;
    const startedAt = activeConsultation.consultationStartedAt
      ? new Date(activeConsultation.consultationStartedAt).getTime()
      : now.getTime();
    activeConsultationRemaining = Math.max(
      0,
      Math.ceil((duration * 60000 - (now.getTime() - startedAt)) / 60000)
    );
  }

  const duration = Number(appointment.consultationDurationMinutes) || 60;
  return activeConsultationRemaining + waitingAheadCount * duration;
}

async function refreshEstimatedWaitTime(appointments, appointment, now = new Date()) {
  if (appointment.status !== 'waiting') return 0;

  const { start, end } = getDayRange(appointment.appointmentDate);
  const query = {
    doctorId: String(appointment.doctorId),
    appointmentDate: { $gte: start, $lte: end }
  };
  const [waitingAheadCount, activeConsultation] = await Promise.all([
    appointments.countDocuments({
      ...query,
      status: 'waiting',
      tokenNumber: { $lt: appointment.tokenNumber }
    }),
    appointments.findOne({ ...query, status: 'in-consultation' })
  ]);
  const estimatedWaitTime = calculateEstimatedWaitTime(
    appointment,
    waitingAheadCount,
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
