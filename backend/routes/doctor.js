const express = require('express');
const router = express.Router();
const { ObjectId, getCol, getDoctorCol } = require('../db/connection');
const { requireDoctor } = require('../middleware/auth');
const { getDayRange, getDayName } = require('../utils/dateHelper');
const { getDaySessions } = require('../utils/clinicConfig');

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
    const appointments = getDoctorCol(req.user.id, 'appointments');
    const users = getCol('users');
    const date = typeof req.query.date === 'string' ? req.query.date : null;
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Date must use YYYY-MM-DD format.' });
    }
    const selectedDate = date || new Date();
    const { start, end } = getDayRange(selectedDate);
    const apts = await appointments.find({
      doctorId: String(req.user.id),
      appointmentDate: { $gte: start, $lte: end }
    }, {
      projection: {
        _id: 1,
        patientId: 1,
        doctorId: 1,
        appointmentDate: 1,
        session: 1,
        slot: 1,
        tokenNumber: 1,
        status: 1,
        queuePosition: 1,
        specialCase: 1,
        specialCaseReason: 1,
        patientName: 1,
        patientPhone: 1,
        bookedBy: 1
      }
    }).sort({ tokenNumber: 1 }).toArray();

    const enriched = await Promise.all(apts.map(async a => {
      let patient = null;
      if (a.specialCase) {
        patient = {
          name: a.patientName,
          phone: a.patientPhone,
          specialCase: true,
          specialCaseReason: a.specialCaseReason
        };
      } else {
        try {
          patient = await users.findOne({ _id: new ObjectId(String(a.patientId)) }, { projection: { _id: 0, name: 1 } });
        } catch (e) {
          patient = await users.findOne({ _id: String(a.patientId) }, { projection: { _id: 0, name: 1 } });
        }
      }
      return { ...a, patient };
    }));

    const waitingCount       = apts.filter(a => a.status === 'waiting').length;
    const completedCount     = apts.filter(a => a.status === 'completed').length;
    const inConsultationCount = apts.filter(a => a.status === 'in-consultation').length;
    const totalCount         = apts.length;

    res.json({
      success: true,
      date: selectedDate,
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
    const sessions = getDaySessions(doctor, dayName);
    const slots = sessions.flatMap(session => session.slots);
    res.json({ success: true, slots, sessions, dayName, consultationTime: doctor.consultationTime });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
