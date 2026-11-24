const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ObjectId, getCol, getDoctorCol, ensureDoctorDatabase } = require('../db/connection');
const { requireAdmin } = require('../middleware/auth');
const { getDayRange, parseAppointmentDate } = require('../utils/dateHelper');
const { findAppointmentsAcrossDoctors, findAppointmentAcrossDoctors } = require('../utils/appointmentStore');
const { calculateEstimatedWaitTime } = require('../utils/waitTime');
const {
  CLINIC_SPECIALIZATION,
  CONSULTATION_MINUTES,
  MAX_DOCTORS,
  buildAvailableSlots,
  SPECIAL_CASE_SLOTS,
  getDoctorBookingPriority
} = require('../utils/clinicConfig');

// GET /api/admin/seed — seed initial admin and psychiatry clinic doctors if not present
const { seedInitialData } = require('../db/seedData');

async function recalculateQueue(doctorId, appointmentDate) {
  const appointments = getDoctorCol(doctorId, 'appointments');
  const { start, end } = getDayRange(appointmentDate);
  const doctorIdString = String(doctorId);
  const query = {
    doctorId: doctorIdString,
    appointmentDate: { $gte: start, $lte: end }
  };
  const [waiting, activeConsultation] = await Promise.all([
    appointments.find({ ...query, status: 'waiting' }).sort({ tokenNumber: 1 }).toArray(),
    appointments.findOne({ ...query, status: 'in-consultation' })
  ]);

  for (let index = 0; index < waiting.length; index++) {
    const estimatedWaitTime = calculateEstimatedWaitTime(
      waiting[index],
      waiting.slice(0, index),
      activeConsultation
    );
    await appointments.updateOne(
      { _id: waiting[index]._id },
      { $set: { queuePosition: index + 1, estimatedWaitTime } }
    );
  }
}

router.get('/seed', async (req, res) => {
  try {
    await seedInitialData(getCol);
    const seededDoctors = await getCol('doctors').find({}).toArray();
    for (const doctor of seededDoctors) {
      await ensureDoctorDatabase(doctor);
    }
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

    const { start, end } = getDayRange(new Date());

    const [totalPatients, totalDoctors, appointments] = await Promise.all([
      users.countDocuments({ role: 'patient' }),
      doctors.countDocuments({ retired: { $ne: true } }),
      findAppointmentsAcrossDoctors({ appointmentDate: { $gte: start, $lte: end } })
    ]);
    const waitingCount = appointments.filter(appointment => appointment.status === 'waiting').length;
    const completedCount = appointments.filter(appointment => appointment.status === 'completed').length;
    const inConsultationCount = appointments.filter(appointment => appointment.status === 'in-consultation').length;
    const cancelledCount = appointments.filter(appointment =>
      appointment.status === 'cancelled'
    ).length;
    const patientCancelledCount = appointments.filter(appointment =>
      appointment.status === 'cancelled' && appointment.cancelledBy === 'patient'
    ).length;

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        todayAppointments: appointments.length,
        waitingCount,
        completedCount,
        inConsultationCount,
        cancelledCount,
        patientCancelledCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching admin dashboard.' });
  }
});

// POST /api/admin/register-admin — an existing admin creates another admin account
router.post('/register-admin', requireAdmin(), async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' ||
        !name.trim() || !email.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const lowerEmail = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const users = getCol('users');
    const doctors = getCol('doctors');
    const [existsUser, existsDoctor] = await Promise.all([
      users.findOne({ email: lowerEmail }),
      doctors.findOne({ email: lowerEmail })
    ]);
    if (existsUser || existsDoctor) {
      return res.status(409).json({ success: false, message: 'A user or doctor with this email is already registered.' });
    }

    const result = await users.insertOne({
      name: name.trim(),
      email: lowerEmail,
      password: await bcrypt.hash(password, 10),
      role: 'admin',
      phone: '',
      registeredBy: req.user.id,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Administrator successfully registered into WaitWise system.',
      adminId: result.insertedId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error registering administrator.' });
  }
});

// POST /api/admin/register-doctor — admin registers a doctor (strictly max 2 doctors)
router.post('/register-doctor', requireAdmin(), async (req, res) => {
  try {
    const doctors = getCol('doctors');
    const users   = getCol('users');

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const count = await doctors.countDocuments({ retired: { $ne: true } });
    if (count >= MAX_DOCTORS) {
      return res.status(400).json({
        success: false,
        message: `Maximum doctor limit reached. The psychiatry clinic is configured for ${MAX_DOCTORS} doctors.`
      });
    }

    const lowerEmail = email.toLowerCase().trim();
    const existsU = await users.findOne({ email: lowerEmail });
    const existsD = await doctors.findOne({ email: lowerEmail });
    if (existsU || existsD) {
      return res.status(409).json({ success: false, message: 'A user or doctor with this email is already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const doctorName = name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`;
    const newDoctor = {
      name: doctorName,
      email: lowerEmail,
      password: hashed,
      specialization: CLINIC_SPECIALIZATION,
      consultationTime: CONSULTATION_MINUTES,
      availableSlots: buildAvailableSlots(),
      bookingPriority: count + 1,
      isAvailable: true,
      unavailabilityReason: '',
      retired: false,
      registeredBy: req.user.id,
      createdAt: new Date()
    };
    const result = await doctors.insertOne(newDoctor);
    await ensureDoctorDatabase({ _id: result.insertedId, name: doctorName, email: lowerEmail, specialization: CLINIC_SPECIALIZATION, consultationTime: CONSULTATION_MINUTES });

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
    const { start, end } = getDayRange(new Date());

    const allDoctors = await doctors.find({ retired: { $ne: true } }, { projection: { password: 0 } }).toArray();

    const withStats = await Promise.all(allDoctors.map(async d => {
      const docIdStr = String(d._id);
      const appointments = getDoctorCol(d._id, 'appointments');
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

// POST /api/admin/special-appointments — allocate a 5 PM or 6 PM walk-in to the first free doctor
router.post('/special-appointments', requireAdmin(), async (req, res) => {
  try {
    const { patientName, phone, date, slot, reason } = req.body || {};
    const cleanName = typeof patientName === 'string' ? patientName.trim() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    const cleanReason = typeof reason === 'string' ? reason.trim() : '';

    if (!cleanName || cleanName.length > 120) {
      return res.status(400).json({ success: false, message: 'A valid patient name is required.' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      return res.status(400).json({ success: false, message: 'Date must use YYYY-MM-DD format.' });
    }
    if (!SPECIAL_CASE_SLOTS.includes(slot)) {
      return res.status(400).json({ success: false, message: 'Special cases may only use 17:00 - 18:00 or 18:00 - 19:00.' });
    }

    const doctors = await getCol('doctors')
      .find({ retired: { $ne: true } }, { projection: { password: 0 } })
      .toArray();
    doctors.sort((a, b) =>
      getDoctorBookingPriority(a) - getDoctorBookingPriority(b) ||
      String(a._id).localeCompare(String(b._id))
    );

    const appointmentDate = parseAppointmentDate(date);
    const { start, end } = getDayRange(date);
    let assignedDoctor = null;

    for (const doctor of doctors) {
      if (!doctor.isAvailable) continue;
      const appointments = getDoctorCol(doctor._id, 'appointments');
      const slotTaken = await appointments.findOne({
        doctorId: String(doctor._id),
        appointmentDate: { $gte: start, $lte: end },
        slot,
        status: { $ne: 'cancelled' }
      });
      if (!slotTaken) {
        assignedDoctor = doctor;
        break;
      }
    }

    if (!assignedDoctor) {
      return res.status(409).json({
        success: false,
        message: 'Both doctors are already assigned for this special-case slot.'
      });
    }

    const appointments = getDoctorCol(assignedDoctor._id, 'appointments');
    const tokenNumber = slot === '17:00 - 18:00' ? 7 : 8;
    const result = await appointments.insertOne({
      patientId: null,
      doctorId: String(assignedDoctor._id),
      patientName: cleanName,
      patientPhone: cleanPhone,
      specialCase: true,
      specialCaseReason: cleanReason,
      appointmentDate,
      session: 'SP',
      slot,
      tokenNumber,
      status: 'waiting',
      queuePosition: 1,
      consultationDurationMinutes: Number(assignedDoctor.consultationTime) || CONSULTATION_MINUTES,
      estimatedWaitTime: 0,
      bookedAt: new Date(),
      bookedBy: 'admin',
      consultationStartedAt: null,
      completedAt: null,
      notes: cleanReason
    });
    await recalculateQueue(assignedDoctor._id, appointmentDate);

    res.status(201).json({
      success: true,
      message: `Special case allotted to ${assignedDoctor.name} for ${slot}.`,
      appointment: {
        _id: result.insertedId,
        doctorId: String(assignedDoctor._id),
        doctorName: assignedDoctor.name,
        patientName: cleanName,
        date,
        slot,
        tokenNumber,
        specialCase: true
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error allocating the special-case appointment.' });
  }
});

// GET /api/admin/appointments — overall view of all appointments
router.get('/appointments', requireAdmin(), async (req, res) => {
  try {
    const users   = getCol('users');
    const doctors = getCol('doctors');
    const { date, status } = req.query;

    const filter = {};
    if (date) {
      const { start, end } = getDayRange(date);
      filter.appointmentDate = { $gte: start, $lte: end };
    }
    if (status) filter.status = status;

    const apts = await findAppointmentsAcrossDoctors(filter);
    apts.sort((a, b) =>
      new Date(b.appointmentDate) - new Date(a.appointmentDate) || a.tokenNumber - b.tokenNumber
    );

    const enriched = await Promise.all(apts.map(async a => {
      let patient = null;
      let doctor = null;
      if (a.specialCase) {
        patient = { name: a.patientName, phone: a.patientPhone, specialCase: true };
      } else {
        try {
          patient = await users.findOne({ _id: new ObjectId(String(a.patientId)) }, { projection: { password: 0 } });
        } catch (e) {
          patient = await users.findOne({ _id: String(a.patientId) }, { projection: { password: 0 } });
        }
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

// PATCH /api/admin/appointments/:id/status — admins manage the doctor queue
router.patch('/appointments/:id/status', requireAdmin(), async (req, res) => {
  try {
    const { status, notes } = req.body || {};
    const validStatuses = ['waiting', 'in-consultation', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status.' });
    }
    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 2000)) {
      return res.status(400).json({ success: false, message: 'Notes must be a string of up to 2000 characters.' });
    }

    const appointment = await findAppointmentAcrossDoctors(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    const update = { status };
    if (notes !== undefined) update.notes = notes.trim();
    if (status === 'in-consultation') {
      update.consultationStartedAt = new Date();
      update.consultationDurationMinutes = Number(appointment.consultationDurationMinutes) || CONSULTATION_MINUTES;
    } else {
      update.estimatedWaitTime = 0;
    }
    if (status === 'completed') {
      update.completedAt = new Date();
      update.consultationCompletedAt = new Date();
    }
    if (status === 'waiting') update.consultationStartedAt = null;

    await getDoctorCol(appointment.doctorId, 'appointments').updateOne(
      { _id: appointment._id },
      { $set: update }
    );
    await recalculateQueue(appointment.doctorId, appointment.appointmentDate);
    res.json({ success: true, message: `Appointment status updated to ${status}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating appointment status.' });
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
