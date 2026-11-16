const express = require('express');
const router = express.Router();
const { ObjectId, getCol } = require('../db/connection');
const { requireDoctor } = require('../middleware/auth');
const { parseAppointmentDate, getDayRange, getDayName } = require('../utils/dateHelper');
const { SESSION_SLOTS } = require('../utils/clinicConfig');

async function recalculateQueue(doctorId, appointmentDate) {
  const appointments = getCol('appointments');
  const doctors = getCol('doctors');
  const { start, end } = getDayRange(appointmentDate);

  const docIdStr = String(doctorId);
  let doctor = null;
  try {
    doctor = await doctors.findOne({ _id: new ObjectId(docIdStr) });
  } catch (e) {
    doctor = await doctors.findOne({ _id: docIdStr });
  }
  const consultationTime = doctor ? doctor.consultationTime : 15;

  const waiting = await appointments.find({
    doctorId: docIdStr,
    appointmentDate: { $gte: start, $lte: end },
    status: 'waiting'
  }).sort({ tokenNumber: 1 }).toArray();

  for (let i = 0; i < waiting.length; i++) {
    await appointments.updateOne(
      { _id: waiting[i]._id },
      { $set: { queuePosition: i + 1, estimatedWaitTime: i * consultationTime } }
    );
  }
}

// GET /api/doctor/profile — own profile, consultation time, slots, availability
router.get('/profile', requireDoctor(), async (req, res) => {
  try {
    const doctors = getCol('doctors');
    let doc = null;
    try {
      doc = await doctors.findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } });
    } catch (e) {
      doc = await doctors.findOne({ _id: req.user.id }, { projection: { password: 0 } });
    }
    if (!doc) return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    res.json({ success: true, doctor: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/doctor/queue — today's psychiatry queue and statistics
router.get('/queue', requireDoctor(), async (req, res) => {
  try {
    const appointments = getCol('appointments');
    const users = getCol('users');
    const { start, end } = getDayRange(new Date());

    const apts = await appointments.find({
      doctorId: String(req.user.id),
      appointmentDate: { $gte: start, $lte: end }
    }).sort({ tokenNumber: 1 }).toArray();

    const enriched = await Promise.all(apts.map(async a => {
      let patient = null;
      try {
        patient = await users.findOne({ _id: new ObjectId(String(a.patientId)) }, { projection: { password: 0 } });
      } catch (e) {
        patient = await users.findOne({ _id: String(a.patientId) }, { projection: { password: 0 } });
      }
      return { ...a, patient };
    }));

    const waitingCount       = apts.filter(a => a.status === 'waiting').length;
    const completedCount     = apts.filter(a => a.status === 'completed').length;
    const inConsultationCount = apts.filter(a => a.status === 'in-consultation').length;
    const totalCount         = apts.length;

    res.json({
      success: true,
      appointments: enriched,
      stats: {
        waitingCount,
        completedCount,
        inConsultationCount,
        total: totalCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error loading queue.' });
  }
});

// PATCH /api/doctor/appointments/:id/status
router.patch('/appointments/:id/status', requireDoctor(), async (req, res) => {
  try {
    const appointments = getCol('appointments');
    const { id } = req.params;
    const { status, notes } = req.body;
    const valid = ['waiting', 'in-consultation', 'completed', 'cancelled'];
    if (!valid.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status.' });

    let apt = null;
    try {
      apt = await appointments.findOne({ _id: new ObjectId(id) });
    } catch (e) {
      apt = await appointments.findOne({ _id: id });
    }

    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    if (String(apt.doctorId) !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Not authorized for this patient appointment.' });

    const update = { status };
    if (notes !== undefined) update.notes = notes;
    if (status === 'completed') update.completedAt = new Date();

    await appointments.updateOne({ _id: apt._id }, { $set: update });
    await recalculateQueue(req.user.id, apt.appointmentDate);

    res.json({ success: true, message: `Status updated to ${status}. Queue recalculation complete.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/doctor/appointments/:id/complete — mark past consultation complete and update queue
router.patch('/appointments/:id/complete', requireDoctor(), async (req, res) => {
  try {
    const appointments = getCol('appointments');
    const { id } = req.params;
    const { notes } = req.body;

    let apt = null;
    try {
      apt = await appointments.findOne({ _id: new ObjectId(id) });
    } catch (e) {
      apt = await appointments.findOne({ _id: id });
    }

    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    if (String(apt.doctorId) !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Not authorized.' });

    const update = { status: 'completed', completedAt: new Date() };
    if (notes) update.notes = notes;

    await appointments.updateOne({ _id: apt._id }, { $set: update });
    await recalculateQueue(req.user.id, apt.appointmentDate);

    res.json({ success: true, message: 'Consultation completed. Waiting queue positions updated automatically.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/doctor/availability — toggle availability with reason (e.g. visiting existing patients in ward)
router.patch('/availability', requireDoctor(), async (req, res) => {
  try {
    const doctors = getCol('doctors');
    let doctor = null;
    try {
      doctor = await doctors.findOne({ _id: new ObjectId(req.user.id) });
    } catch (e) {
      doctor = await doctors.findOne({ _id: req.user.id });
    }
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const { isAvailable, unavailabilityReason } = req.body;
    const newAvail = isAvailable !== undefined ? Boolean(isAvailable) : !doctor.isAvailable;
    const defaultReason = 'Visiting existing patients in ward (In-Patient rounds)';
    const reasonToSave = newAvail ? '' : (unavailabilityReason || defaultReason);

    await doctors.updateOne(
      { _id: doctor._id },
      { $set: { isAvailable: newAvail, unavailabilityReason: reasonToSave } }
    );

    res.json({
      success: true,
      isAvailable: newAvail,
      unavailabilityReason: reasonToSave,
      message: `Doctor status set to ${newAvail ? 'Available for OP' : 'Unavailable: ' + reasonToSave}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/doctor/slots?date= — doctor's configured OP slots for date
router.get('/slots', requireDoctor(), async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date required.' });

    const doctors = getCol('doctors');
    let doctor = null;
    try {
      doctor = await doctors.findOne({ _id: new ObjectId(req.user.id) });
    } catch (e) {
      doctor = await doctors.findOne({ _id: req.user.id });
    }

    const dayName = getDayName(date);
    const slotConfig = (doctor.availableSlots || []).find(s => s.day === dayName);
    if (!slotConfig) return res.json({ success: true, slots: [], sessions: [], dayName });
    const sessions = Array.isArray(slotConfig.sessions) ? slotConfig.sessions : SESSION_SLOTS;
    const slots = sessions.flatMap(session => session.slots);
    res.json({ success: true, slots, sessions, dayName, consultationTime: doctor.consultationTime });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
