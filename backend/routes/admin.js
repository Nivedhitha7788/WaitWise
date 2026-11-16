const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ObjectId, getCol } = require('../db/connection');
const { requireAdmin } = require('../middleware/auth');
const { getDayRange } = require('../utils/dateHelper');
const {
  CLINIC_SPECIALIZATION,
  CONSULTATION_MINUTES,
  MAX_DOCTORS,
  buildAvailableSlots
} = require('../utils/clinicConfig');

// GET /api/admin/seed — seed initial admin and psychiatry clinic doctors if not present
const { seedInitialData } = require('../db/seedData');
router.get('/seed', async (req, res) => {
  try {
    await seedInitialData(getCol);
    res.json({
      success: true,
      message: 'System seeded with the default admin and 2 General Psychiatry doctors.',
      admin: { email: 'admin@waitwise.com', password: 'admin123' },
      doctorsPassword: 'doctor123'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error seeding system.' });
  }
});

// GET /api/admin/dashboard — overall view of the system
router.get('/dashboard', requireAdmin(), async (req, res) => {
  try {
    const users = getCol('users');
    const doctors = getCol('doctors');
    const appointments = getCol('appointments');

    const { start, end } = getDayRange(new Date());

    const [totalPatients, totalDoctors, todayAppointments, waitingCount, completedCount, inConsultationCount] = await Promise.all([
      users.countDocuments({ role: 'patient' }),
      doctors.countDocuments({ retired: { $ne: true } }),
      appointments.countDocuments({ appointmentDate: { $gte: start, $lte: end } }),
      appointments.countDocuments({ appointmentDate: { $gte: start, $lte: end }, status: 'waiting' }),
      appointments.countDocuments({ appointmentDate: { $gte: start, $lte: end }, status: 'completed' }),
      appointments.countDocuments({ appointmentDate: { $gte: start, $lte: end }, status: 'in-consultation' })
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        todayAppointments,
        waitingCount,
        completedCount,
        inConsultationCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching admin dashboard.' });
  }
});

// POST /api/admin/register-doctor — admin registers a doctor (strictly max 2 doctors)
router.post('/register-doctor', requireAdmin(), async (req, res) => {
  try {
    const doctors = getCol('doctors');
    const users   = getCol('users');

    const count = await doctors.countDocuments({ retired: { $ne: true } });
    if (count >= MAX_DOCTORS) {
      return res.status(400).json({
        success: false,
        message: `Maximum doctor limit reached. The psychiatry clinic is configured for ${MAX_DOCTORS} doctors.`
      });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();
    const existsU = await users.findOne({ email: lowerEmail });
    const existsD = await doctors.findOne({ email: lowerEmail });
    if (existsU || existsD) {
      return res.status(409).json({ success: false, message: 'A user or doctor with this email is already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await doctors.insertOne({
      name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
      email: lowerEmail,
      password: hashed,
      specialization: CLINIC_SPECIALIZATION,
      consultationTime: CONSULTATION_MINUTES,
      availableSlots: buildAvailableSlots(),
      isAvailable: true,
      unavailabilityReason: '',
      retired: false,
      registeredBy: req.user.id,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Doctor successfully registered into WaitWise system.',
      doctorId: result.insertedId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error registering doctor.' });
  }
});

// GET /api/admin/doctors — list all doctors with queue statistics
router.get('/doctors', requireAdmin(), async (req, res) => {
  try {
    const doctors = getCol('doctors');
    const appointments = getCol('appointments');
    const { start, end } = getDayRange(new Date());

    const allDoctors = await doctors.find({ retired: { $ne: true } }, { projection: { password: 0 } }).toArray();

    const withStats = await Promise.all(allDoctors.map(async d => {
      const docIdStr = String(d._id);
      const [todayQueue, todayWaiting, todayCompleted, todayInConsultation] = await Promise.all([
        appointments.countDocuments({ doctorId: docIdStr, appointmentDate: { $gte: start, $lte: end } }),
        appointments.countDocuments({ doctorId: docIdStr, appointmentDate: { $gte: start, $lte: end }, status: 'waiting' }),
        appointments.countDocuments({ doctorId: docIdStr, appointmentDate: { $gte: start, $lte: end }, status: 'completed' }),
        appointments.countDocuments({ doctorId: docIdStr, appointmentDate: { $gte: start, $lte: end }, status: 'in-consultation' })
      ]);
      return { ...d, todayQueue, todayWaiting, todayCompleted, todayInConsultation };
    }));

    res.json({ success: true, doctors: withStats, count: allDoctors.length, maxDoctors: MAX_DOCTORS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching doctors list.' });
  }
});

// GET /api/admin/appointments — overall view of all appointments
router.get('/appointments', requireAdmin(), async (req, res) => {
  try {
    const appointments = getCol('appointments');
    const users   = getCol('users');
    const doctors = getCol('doctors');
    const { date, status } = req.query;

    const filter = {};
    if (date) {
      const { start, end } = getDayRange(date);
      filter.appointmentDate = { $gte: start, $lte: end };
    }
    if (status) filter.status = status;

    const apts = await appointments.find(filter).sort({ appointmentDate: -1, tokenNumber: 1 }).toArray();

    const enriched = await Promise.all(apts.map(async a => {
      let patient = null;
      let doctor = null;
      try {
        patient = await users.findOne({ _id: new ObjectId(String(a.patientId)) }, { projection: { password: 0 } });
      } catch (e) {
        patient = await users.findOne({ _id: String(a.patientId) }, { projection: { password: 0 } });
      }

      try {
        doctor = await doctors.findOne({ _id: new ObjectId(String(a.doctorId)) }, { projection: { password: 0 } });
      } catch (e) {
        doctor = await doctors.findOne({ _id: String(a.doctorId) }, { projection: { password: 0 } });
      }

      return { ...a, patient, doctor };
    }));

    res.json({ success: true, appointments: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching appointments.' });
  }
});

// PATCH /api/admin/doctors/:id/availability — admin can update doctor availability & ward visit reason
router.patch('/doctors/:id/availability', requireAdmin(), async (req, res) => {
  try {
    const doctors = getCol('doctors');
    const { id } = req.params;
    const { isAvailable, unavailabilityReason } = req.body;

    let doctor = null;
    try {
      doctor = await doctors.findOne({ _id: new ObjectId(id) });
    } catch (e) {
      doctor = await doctors.findOne({ _id: id });
    }
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    if (doctor.retired) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const newAvail = isAvailable !== undefined ? Boolean(isAvailable) : !doctor.isAvailable;
    const defaultReason = 'Visiting existing patients in ward (In-Patient rounds)';
    const reasonToSave = newAvail ? '' : (unavailabilityReason || defaultReason);

    await doctors.updateOne(
      { _id: doctor._id },
      { $set: { isAvailable: newAvail, unavailabilityReason: reasonToSave } }
    );

    res.json({
      success: true,
      message: `Doctor ${doctor.name} marked ${newAvail ? 'available' : 'unavailable'}.`,
      isAvailable: newAvail,
      unavailabilityReason: reasonToSave
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating doctor availability.' });
  }
});

module.exports = router;
