const express = require('express');
const router = express.Router();
const { ObjectId, getCol, getDoctorCol } = require('../db/connection');
const { requirePatient } = require('../middleware/auth');
const { parseAppointmentDate, getDayRange, getDayName } = require('../utils/dateHelper');
const { SESSION_SLOTS, isPastClinicSlot, CONSULTATION_MINUTES } = require('../utils/clinicConfig');
const { findAppointmentsAcrossDoctors, findAppointmentAcrossDoctors } = require('../utils/appointmentStore');
const { calculateEstimatedWaitTime, refreshEstimatedWaitTime } = require('../utils/waitTime');

// POST /api/patient/contact — public contact form
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, subject, and message are required.' });
    }

    const contact = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      subject: String(subject).trim(),
      message: String(message).trim()
    };
    if (!contact.name || contact.name.length > 120 ||
        contact.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) ||
        contact.phone.length > 40 || !contact.subject || contact.subject.length > 150 ||
        !contact.message || contact.message.length > 3000) {
      return res.status(400).json({ success: false, message: 'Please provide valid contact details and a message within the allowed length.' });
    }

    await getCol('contactMessages').insertOne({ ...contact, submittedAt: new Date(), status: 'new' });
    res.status(201).json({ success: true, message: 'Your message has been received. We will be in touch soon.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error saving your message.' });
  }
});

// POST /api/patient/feedback — submit feedback for a completed appointment
router.post('/feedback', requirePatient(), async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body || {};
    const parsedRating = Number(rating);
    const feedbackComment = typeof comment === 'string' ? comment.trim() : '';
    if (!appointmentId || !Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5 ||
        !feedbackComment || feedbackComment.length > 2000) {
      return res.status(400).json({ success: false, message: 'A rating from 1 to 5 and a comment of up to 2000 characters are required.' });
    }

    const appointment = await findAppointmentAcrossDoctors(appointmentId, {
      patientId: String(req.user.id)
    });

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Feedback is available after the consultation is completed.' });
    }

    const feedbacks = getCol('feedback');
    const existing = await feedbacks.findOne({ appointmentId: String(appointment._id) });
    if (existing) return res.status(409).json({ success: false, message: 'Feedback has already been submitted for this appointment.' });

    try {
      await feedbacks.insertOne({
        appointmentId: String(appointment._id),
        patientId: String(req.user.id),
        doctorId: String(appointment.doctorId),
        rating: parsedRating,
        comment: feedbackComment,
        submittedAt: new Date()
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'Feedback has already been submitted for this appointment.' });
      }
      throw err;
    }
    res.status(201).json({ success: true, message: 'Thank you for sharing your feedback.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error saving feedback.' });
  }
});

function getDaySessions(doctor, dayName) {
  const schedule = (doctor.availableSlots || []).find(item => item.day === dayName);
  if (!schedule) return [];
  if (Array.isArray(schedule.sessions)) return schedule.sessions;

  // Keep the new fixed-session API usable during rolling upgrades from legacy schedules.
  return SESSION_SLOTS;
}

async function recalculateQueue(doctorId, appointmentDate) {
  const appointments = getDoctorCol(doctorId, 'appointments');
  const { start, end } = getDayRange(appointmentDate);
  const docIdStr = String(doctorId);

  const waiting = await appointments.find({
    doctorId: docIdStr,
    appointmentDate: { $gte: start, $lte: end },
    status: 'waiting'
  }).sort({ tokenNumber: 1 }).toArray();
  const activeConsultation = await appointments.findOne({
    doctorId: docIdStr,
    appointmentDate: { $gte: start, $lte: end },
    status: 'in-consultation'
  });

  for (let i = 0; i < waiting.length; i++) {
    const estimatedWaitTime = calculateEstimatedWaitTime(waiting[i], i, activeConsultation);
    await appointments.updateOne(
      { _id: waiting[i]._id },
      { $set: { queuePosition: i + 1, estimatedWaitTime } }
    );
  }
}

// GET /api/patient/public/display — public waiting room display board (no auth required)
router.get('/public/display', async (req, res) => {
  try {
    const doctors = getCol('doctors');
    const { start, end } = getDayRange(new Date());

    const allDoctors = await doctors.find({ retired: { $ne: true } }, { projection: { password: 0 } }).toArray();

    const boards = await Promise.all(allDoctors.map(async doc => {
      const appointments = getDoctorCol(doc._id, 'appointments');
      const docIdStr = String(doc._id);

      // Find current in-consultation token
      const current = await appointments.findOne({
        doctorId: docIdStr,
        appointmentDate: { $gte: start, $lte: end },
        status: 'in-consultation'
      });

      // Find next waiting token
      const nextList = await appointments.find({
        doctorId: docIdStr,
        appointmentDate: { $gte: start, $lte: end },
        status: 'waiting'
      }).sort({ tokenNumber: 1 }).toArray();

      const nextApt = nextList.length > 0 ? nextList[0] : null;

      const completedCount = await appointments.countDocuments({
        doctorId: docIdStr,
        appointmentDate: { $gte: start, $lte: end },
        status: 'completed'
      });

      return {
        id: docIdStr,
        name: doc.name,
        specialization: doc.specialization,
        consultationTime: doc.consultationTime,
        isAvailable: doc.isAvailable,
        unavailabilityReason: doc.unavailabilityReason,
        currentToken: current ? current.tokenNumber : null,
        currentSession: current ? current.session || null : null,
        currentSlot: current ? current.slot : null,
        nextToken: nextApt ? nextApt.tokenNumber : null,
        nextSession: nextApt ? nextApt.session || null : null,
        nextSlot: nextApt ? nextApt.slot : null,
        waitingCount: nextList.length,
        completedCount
      };
    }));

    res.json({ success: true, timestamp: new Date().toISOString(), doctors: boards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error loading display.' });
  }
});

// GET /api/patient/doctors — available doctors
router.get('/doctors', requirePatient(), async (req, res) => {
  try {
    const doctors = await getCol('doctors').find({ isAvailable: true, retired: { $ne: true } }, { projection: { password: 0 } }).toArray();
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/patient/doctors/all — all doctors (includes availability status & ward visit reason)
router.get('/doctors/all', requirePatient(), async (req, res) => {
  try {
    const doctors = await getCol('doctors').find({ retired: { $ne: true } }, { projection: { password: 0 } }).toArray();
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/patient/doctors/:doctorId/slots?date=
router.get('/doctors/:doctorId/slots', requirePatient(), async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date required.' });

    const docIdStr = String(doctorId);
    const doctors = getCol('doctors');
    let doctor = null;
    try {
      doctor = await doctors.findOne({ _id: new ObjectId(docIdStr) });
    } catch (e) {
      doctor = await doctors.findOne({ _id: docIdStr });
    }

    if (!doctor || doctor.retired) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const dayName = getDayName(date);
    if (!doctor.isAvailable) {
      return res.json({
        success: true,
        slots: [],
        allSlots: [],
        bookedSlots: [],
        sessions: [],
        dayName,
        message: `Doctor is currently unavailable: ${doctor.unavailabilityReason || 'Visiting existing patients in ward (In-Patient rounds)'}`
      });
    }

    const sessions = getDaySessions(doctor, dayName);
    if (!sessions.length) return res.json({ success: true, slots: [], sessions: [], message: `No consultation slots configured on ${dayName}.` });

    const allSlots = sessions.flatMap(session => session.slots);
    const { start, end } = getDayRange(date);

    const booked = await getDoctorCol(docIdStr, 'appointments').find({
      doctorId: docIdStr,
      appointmentDate: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    }).toArray();

    const bookedSlots = booked.map(a => a.slot);
    const available = allSlots.filter(s => !bookedSlots.includes(s) && !isPastClinicSlot(date, s));

    const availableSet = new Set(available);
    const availableSessions = sessions.map(session => ({
      code: session.code,
      slots: session.slots.filter(slot => availableSet.has(slot))
    }));

    res.json({ success: true, slots: available, allSlots, bookedSlots, sessions: availableSessions, dayName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/patient/book
router.post('/book', requirePatient(), async (req, res) => {
  try {
    const { doctorId, date, slot, session: requestedSession } = req.body;
    if (!doctorId || !date || !slot)
      return res.status(400).json({ success: false, message: 'Doctor, date, and slot are required.' });

    const docIdStr = String(doctorId);
    const doctors = getCol('doctors');

    let doctor = null;
    try {
      doctor = await doctors.findOne({ _id: new ObjectId(docIdStr) });
    } catch (e) {
      doctor = await doctors.findOne({ _id: docIdStr });
    }

    if (!doctor || doctor.retired) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    const appointments = getDoctorCol(docIdStr, 'appointments');
    if (!doctor.isAvailable) {
      const reason = doctor.unavailabilityReason || 'Doctor is currently visiting existing patients in ward';
      return res.status(400).json({ success: false, message: `Doctor is currently unavailable: ${reason}` });
    }

    const { start, end } = getDayRange(date);
    const appointmentDate = parseAppointmentDate(date);
    const sessions = getDaySessions(doctor, getDayName(date));
    const matchingSession = sessions.find(item =>
      item.slots.includes(slot) && (!requestedSession || item.code === requestedSession)
    );
    if (!matchingSession) {
      return res.status(400).json({ success: false, message: 'Select a valid consultation slot for this date and session.' });
    }
    if (isPastClinicSlot(date, slot)) {
      return res.status(400).json({ success: false, message: 'This consultation time has already passed.' });
    }

    // Prevent duplicate booking for same patient + same doctor on same day
    const existing = await appointments.findOne({
      patientId: String(req.user.id),
      doctorId: docIdStr,
      appointmentDate: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have an active appointment with this doctor today.' });
    }

    // Check slot availability
    const slotTaken = await appointments.findOne({
      doctorId: docIdStr,
      appointmentDate: { $gte: start, $lte: end },
      slot,
      status: { $ne: 'cancelled' }
    });
    if (slotTaken) {
      return res.status(409).json({ success: false, message: 'This slot was just booked by another patient. Please select another slot.' });
    }

    // Number tokens by appointment time so queue order follows the fixed schedule.
    const tokenNumber = sessions.flatMap(item => item.slots).indexOf(slot) + 1;

    // Queue position = waiting appointments ahead of this one + 1
    const ahead = await appointments.countDocuments({
      doctorId: docIdStr,
      appointmentDate: { $gte: start, $lte: end },
      status: 'waiting',
      tokenNumber: { $lt: tokenNumber }
    });
    const queuePosition = ahead + 1;
    const activeConsultation = await appointments.findOne({
      doctorId: docIdStr,
      appointmentDate: { $gte: start, $lte: end },
      status: 'in-consultation'
    });
    const consultationDurationMinutes = Number(doctor.consultationTime) || CONSULTATION_MINUTES;
    const appointment = {
      doctorId: docIdStr,
      appointmentDate,
      slot,
      tokenNumber,
      status: 'waiting',
      consultationDurationMinutes
    };
    const estimatedWaitTime = calculateEstimatedWaitTime(appointment, ahead, activeConsultation);

    const result = await appointments.insertOne({
      patientId: String(req.user.id),
      doctorId: docIdStr,
      appointmentDate,
      session: matchingSession.code,
      slot,
      tokenNumber,
      status: 'waiting',
      queuePosition,
      consultationDurationMinutes,
      estimatedWaitTime,
      bookedAt: new Date(),
      consultationStartedAt: null,
      completedAt: null,
      notes: ''
    });
    await recalculateQueue(docIdStr, appointmentDate);
    const savedAppointment = await appointments.findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Token generated successfully!',
      appointment: {
        _id: result.insertedId,
        tokenNumber,
        session: matchingSession.code,
        slot,
        queuePosition,
        estimatedWaitTime: savedAppointment.estimatedWaitTime,
        doctorName: doctor.name,
        specialization: doctor.specialization
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error booking appointment.' });
  }
});

// GET /api/patient/appointments — patient's appointments list
router.get('/appointments', requirePatient(), async (req, res) => {
  try {
    const doctors = getCol('doctors');

    const apts = await findAppointmentsAcrossDoctors({ patientId: String(req.user.id) });
    apts.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    const savedFeedback = await getCol('feedback').find({ patientId: String(req.user.id) }).toArray();
    const feedbackByAppointment = new Map(savedFeedback.map(item => [String(item.appointmentId), item]));
    const enriched = await Promise.all(apts.map(async a => {
      const appointments = getDoctorCol(a.doctorId, 'appointments');
      const estimatedWaitTime = await refreshEstimatedWaitTime(appointments, a);
      let doctor = null;
      try {
        doctor = await doctors.findOne({ _id: new ObjectId(String(a.doctorId)) }, { projection: { password: 0 } });
      } catch (e) {
        doctor = await doctors.findOne({ _id: String(a.doctorId) }, { projection: { password: 0 } });
      }
      return { ...a, estimatedWaitTime, doctor, feedback: feedbackByAppointment.get(String(a._id)) || null };
    }));
    res.json({ success: true, appointments: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/patient/token/:appointmentId — frequent tracking of token status
router.get('/token/:appointmentId', requirePatient(), async (req, res) => {
  try {
    const doctors = getCol('doctors');
    const { appointmentId } = req.params;

    const apt = await findAppointmentAcrossDoctors(appointmentId, {
      patientId: String(req.user.id)
    });

    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    const appointments = getDoctorCol(apt.doctorId, 'appointments');

    let doctor = null;
    try {
      doctor = await doctors.findOne({ _id: new ObjectId(String(apt.doctorId)) }, { projection: { password: 0 } });
    } catch (e) {
      doctor = await doctors.findOne({ _id: String(apt.doctorId) }, { projection: { password: 0 } });
    }

    const { start, end } = getDayRange(apt.appointmentDate);

    // Patients currently waiting ahead with lower token number
    const patientsAhead = await appointments.countDocuments({
      doctorId: String(apt.doctorId),
      appointmentDate: { $gte: start, $lte: end },
      status: 'waiting',
      tokenNumber: { $lt: apt.tokenNumber }
    });

    // Check if current patient is in-consultation or if another patient is in-consultation
    const currentInConsultation = await appointments.findOne({
      doctorId: String(apt.doctorId),
      appointmentDate: { $gte: start, $lte: end },
      status: 'in-consultation'
    });

    const consultationTime = doctor ? doctor.consultationTime : CONSULTATION_MINUTES;
    const queuePosition = apt.status === 'in-consultation' ? 0 : patientsAhead + 1;
    const estimatedWaitTime = apt.status === 'waiting'
      ? await refreshEstimatedWaitTime(appointments, apt)
      : 0;

    res.json({
      success: true,
      token: {
        appointmentId: apt._id,
        tokenNumber: apt.tokenNumber,
        status: apt.status,
        slot: apt.slot,
        session: apt.session || null,
        appointmentDate: apt.appointmentDate,
        doctor: {
          name: doctor?.name,
          specialization: doctor?.specialization,
          consultationTime,
          isAvailable: doctor?.isAvailable,
          unavailabilityReason: doctor?.unavailabilityReason
        },
        queuePosition,
        patientsAhead,
        currentInConsultationToken: currentInConsultation ? currentInConsultation.tokenNumber : null,
        estimatedWaitTime: Math.max(0, estimatedWaitTime),
        bookedAt: apt.bookedAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/patient/appointments/:id — cancel appointment
router.delete('/appointments/:id', requirePatient(), async (req, res) => {
  try {
    const { id } = req.params;

    const apt = await findAppointmentAcrossDoctors(id, {
      patientId: String(req.user.id)
    });

    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    const appointments = getDoctorCol(apt.doctorId, 'appointments');
    if (apt.status === 'completed' || apt.status === 'in-consultation')
      return res.status(400).json({ success: false, message: 'Cannot cancel an appointment already completed or in progress.' });

    let updateQuery = { _id: apt._id };
    await appointments.updateOne(updateQuery, { $set: { status: 'cancelled' } });
    if (apt.status === 'waiting') {
      await recalculateQueue(apt.doctorId, apt.appointmentDate);
    }

    res.json({ success: true, message: 'Appointment cancelled.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
