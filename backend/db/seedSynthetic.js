const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');
const {
  CLINIC_SPECIALIZATION,
  CONSULTATION_MINUTES,
  SESSION_SLOTS,
  buildAvailableSlots,
  getClinicDateKey
} = require('../utils/clinicConfig');
const { getDoctorDBName } = require('./connection');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/waitwise';

async function seedSyntheticDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to MongoDB for synthetic database generation.');

  const adminDb = client.db().admin();
  const dbsList = await adminDb.listDatabases();
  
  // Drop waitwise and all waitwise_doctor_* databases
  for (const d of dbsList.databases) {
    if (d.name === 'waitwise' || d.name.startsWith('waitwise_doctor_')) {
      console.log(`Dropping database: ${d.name}`);
      await client.db(d.name).dropDatabase();
    }
  }

  const db = client.db('waitwise');
  const usersCol = db.collection('users');
  const doctorsCol = db.collection('doctors');
  const metadataCol = db.collection('metadata');
  const feedbackCol = db.collection('feedback');

  await feedbackCol.createIndex({ appointmentId: 1 }, { unique: true });

  // 1. Seed Hospital Admin
  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  await usersCol.insertOne({
    name: 'Hospital Administrator',
    email: 'admin@waitwise.com',
    password: hashedAdminPass,
    role: 'admin',
    phone: '1800-WAITWISE',
    createdAt: new Date()
  });
  console.log('✓ Admin seeded: admin@waitwise.com / admin123');

  // 2. Seed 2 General Psychiatry Doctors
  const doctorPasswordHash = await bcrypt.hash('doctor123', 10);
  const doc1Id = new ObjectId();
  const doc2Id = new ObjectId();

  const doctor1 = {
    _id: doc1Id,
    name: 'Dr. Priya Patel',
    email: 'dr.patel@waitwise.com',
    password: doctorPasswordHash,
    role: 'doctor',
    specialization: CLINIC_SPECIALIZATION,
    consultationTime: CONSULTATION_MINUTES,
    availableSlots: buildAvailableSlots(),
    bookingPriority: 1,
    isAvailable: true,
    unavailabilityReason: '',
    retired: false,
    createdAt: new Date()
  };

  const doctor2 = {
    _id: doc2Id,
    name: 'Dr. Rajesh Sharma',
    email: 'dr.sharma@waitwise.com',
    password: doctorPasswordHash,
    role: 'doctor',
    specialization: CLINIC_SPECIALIZATION,
    consultationTime: CONSULTATION_MINUTES,
    availableSlots: buildAvailableSlots(),
    bookingPriority: 2,
    isAvailable: true,
    unavailabilityReason: '',
    retired: false,
    createdAt: new Date()
  };

  await doctorsCol.insertMany([doctor1, doctor2]);
  console.log('✓ Doctors seeded: Dr. Priya Patel, Dr. Rajesh Sharma');

  // Seed doctor databases and doctor profiles
  for (const doc of [doctor1, doctor2]) {
    const docDb = client.db(getDoctorDBName(doc._id));
    await docDb.collection('doctorProfile').updateOne(
      { doctorId: String(doc._id) },
      {
        $set: {
          doctorId: String(doc._id),
          name: doc.name,
          email: doc.email,
          specialization: doc.specialization,
          consultationTime: doc.consultationTime
        }
      },
      { upsert: true }
    );
    await docDb.collection('appointments').createIndex({ appointmentDate: 1, tokenNumber: 1 });
    await docDb.collection('appointments').createIndex({ patientId: 1, bookedAt: -1 });
  }

  // 3. Seed Realistic Synthetic Patients
  const patientPasswordHash = await bcrypt.hash('patient123', 10);
  const patientProfiles = [
    { name: 'John Doe', email: 'patient@waitwise.com', phone: '+91 98765 43210', age: 32, gender: 'Male' },
    { name: 'Aarav Kumar', email: 'aarav.kumar@example.com', phone: '+91 98111 22334', age: 28, gender: 'Male' },
    { name: 'Sneha Rao', email: 'sneha.rao@example.com', phone: '+91 98222 33445', age: 35, gender: 'Female' },
    { name: 'Vikram Mehta', email: 'vikram.mehta@example.com', phone: '+91 98333 44556', age: 44, gender: 'Male' },
    { name: 'Pooja Iyer', email: 'pooja.iyer@example.com', phone: '+91 98444 55667', age: 29, gender: 'Female' },
    { name: 'Rohan Verma', email: 'rohan.verma@example.com', phone: '+91 98555 66778', age: 50, gender: 'Male' },
    { name: 'Ananya Sen', email: 'ananya.sen@example.com', phone: '+91 98666 77889', age: 24, gender: 'Female' },
    { name: 'Karthik Raja', email: 'karthik.raja@example.com', phone: '+91 98777 88990', age: 39, gender: 'Male' }
  ];

  const patientsToInsert = patientProfiles.map(p => ({
    _id: new ObjectId(),
    ...p,
    password: patientPasswordHash,
    role: 'patient',
    createdAt: new Date()
  }));

  await usersCol.insertMany(patientsToInsert);
  console.log(`✓ Seeded ${patientsToInsert.length} synthetic patients.`);

  // 4. Generate Date-wise Appointments across Today (2026-11-26) and Bookable Window (2026-11-27, 28, 29)
  function createAptDate(dateStr, timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const [yr, mo, da] = dateStr.split('-').map(Number);
    // Create Date in UTC matching +05:30 IST
    // e.g., 09:00 IST is 03:30 UTC
    const date = new Date(Date.UTC(yr, mo - 1, da, h - 5, m - 30));
    return date;
  }

  // Today schedule: 2026-11-26 (Completed, in-consultation, and waiting)
  // Tomorrow schedule: 2026-11-27
  // Day after tomorrow: 2026-11-28
  // Day + 3: 2026-11-29

  const syntheticAppointments = [
    // --- TODAY (2026-11-26) ---
    // Dr. Priya Patel
    {
      doctorId: doc1Id,
      patientId: patientsToInsert[0]._id, // John Doe
      dateStr: '2026-11-26',
      session: 'FN',
      slot: '09:00 - 10:00',
      tokenNumber: 1,
      status: 'completed',
      queuePosition: 0,
      completedAt: createAptDate('2026-11-26', '10:00')
    },
    {
      doctorId: doc1Id,
      patientId: patientsToInsert[1]._id, // Aarav Kumar
      dateStr: '2026-11-26',
      session: 'FN',
      slot: '10:15 - 11:15',
      tokenNumber: 2,
      status: 'completed',
      queuePosition: 0,
      completedAt: createAptDate('2026-11-26', '11:15')
    },
    {
      doctorId: doc1Id,
      patientId: patientsToInsert[2]._id, // Sneha Rao
      dateStr: '2026-11-26',
      session: 'FN',
      slot: '11:30 - 12:30',
      tokenNumber: 3,
      status: 'in-consultation',
      queuePosition: 1
    },
    {
      doctorId: doc1Id,
      patientId: patientsToInsert[3]._id, // Vikram Mehta
      dateStr: '2026-11-26',
      session: 'AN',
      slot: '13:30 - 14:30',
      tokenNumber: 4,
      status: 'waiting',
      queuePosition: 2
    },
    // Dr. Rajesh Sharma - Today special case & regular
    {
      doctorId: doc2Id,
      patientId: patientsToInsert[4]._id, // Pooja Iyer
      dateStr: '2026-11-26',
      session: 'FN',
      slot: '09:00 - 10:00',
      tokenNumber: 1,
      status: 'completed',
      queuePosition: 0,
      completedAt: createAptDate('2026-11-26', '10:05')
    },
    {
      doctorId: doc2Id,
      patientId: patientsToInsert[5]._id, // Rohan Verma
      dateStr: '2026-11-26',
      session: 'FN',
      slot: '10:15 - 11:15',
      tokenNumber: 2,
      status: 'waiting',
      queuePosition: 1
    },
    // Special walk-in case allotted by admin
    {
      doctorId: doc2Id,
      patientName: 'Meenakshi Sundaram',
      patientPhone: '+91 94444 12345',
      specialCase: true,
      specialCaseReason: 'Acute clinical evaluation request at reception',
      dateStr: '2026-11-26',
      session: 'AN',
      slot: '17:00 - 18:00',
      tokenNumber: 7,
      status: 'waiting',
      queuePosition: 2
    },

    // --- TOMORROW (2026-11-27) ---
    {
      doctorId: doc1Id,
      patientId: patientsToInsert[6]._id, // Ananya Sen
      dateStr: '2026-11-27',
      session: 'FN',
      slot: '09:00 - 10:00',
      tokenNumber: 1,
      status: 'waiting',
      queuePosition: 1
    },
    {
      doctorId: doc1Id,
      patientId: patientsToInsert[7]._id, // Karthik Raja
      dateStr: '2026-11-27',
      session: 'FN',
      slot: '10:15 - 11:15',
      tokenNumber: 2,
      status: 'waiting',
      queuePosition: 2
    },
    {
      doctorId: doc2Id,
      patientId: patientsToInsert[0]._id, // John Doe follow up
      dateStr: '2026-11-27',
      session: 'AN',
      slot: '13:30 - 14:30',
      tokenNumber: 1,
      status: 'waiting',
      queuePosition: 1
    },

    // --- DAY AFTER TOMORROW (2026-11-28) ---
    {
      doctorId: doc1Id,
      patientId: patientsToInsert[2]._id, // Sneha Rao
      dateStr: '2026-11-28',
      session: 'FN',
      slot: '09:00 - 10:00',
      tokenNumber: 1,
      status: 'waiting',
      queuePosition: 1
    },
    {
      doctorId: doc2Id,
      patientId: patientsToInsert[3]._id, // Vikram Mehta
      dateStr: '2026-11-28',
      session: 'FN',
      slot: '10:15 - 11:15',
      tokenNumber: 1,
      status: 'waiting',
      queuePosition: 1
    },

    // --- DAY + 3 (2026-11-29) ---
    {
      doctorId: doc1Id,
      patientId: patientsToInsert[4]._id, // Pooja Iyer
      dateStr: '2026-11-29',
      session: 'FN',
      slot: '09:00 - 10:00',
      tokenNumber: 1,
      status: 'waiting',
      queuePosition: 1
    },
    {
      doctorId: doc2Id,
      patientId: patientsToInsert[5]._id, // Rohan Verma
      dateStr: '2026-11-29',
      session: 'AN',
      slot: '14:45 - 15:45',
      tokenNumber: 1,
      status: 'waiting',
      queuePosition: 1
    }
  ];

  for (const item of syntheticAppointments) {
    const docDb = client.db(getDoctorDBName(item.doctorId));
    const aptTime = item.slot.split(' - ')[0];
    const appointmentDate = createAptDate(item.dateStr, aptTime);
    const docRecord = item.doctorId.equals(doc1Id) ? doctor1 : doctor2;

    const aptRecord = {
      doctorId: String(item.doctorId),
      patientId: item.patientId ? String(item.patientId) : undefined,
      patientName: item.patientName,
      patientPhone: item.patientPhone,
      specialCase: Boolean(item.specialCase),
      specialCaseReason: item.specialCaseReason || '',
      session: item.session,
      slot: item.slot,
      tokenNumber: item.tokenNumber,
      status: item.status,
      queuePosition: item.queuePosition,
      appointmentDate,
      bookedAt: new Date(Date.now() - 3600 * 1000 * 24),
      consultationDurationMinutes: docRecord.consultationTime || 60,
      completedAt: item.completedAt || undefined
    };

    const inserted = await docDb.collection('appointments').insertOne(aptRecord);

    // If completed, add feedback
    if (item.status === 'completed' && item.patientId) {
      await feedbackCol.insertOne({
        appointmentId: String(inserted.insertedId),
        doctorId: String(item.doctorId),
        patientId: String(item.patientId),
        rating: 5,
        comment: 'Very professional, attentive, and caring psychiatry consultation.',
        createdAt: item.completedAt || new Date()
      });
    }
  }

  // Set psychiatry clinic migration marker
  await metadataCol.insertOne({ key: 'psychiatry-clinic-v1', completedAt: new Date() });
  console.log(`✓ Inserted ${syntheticAppointments.length} date-wise appointments into isolated doctor databases.`);

  await client.close();
  console.log('✓ Synthetic database generation completed successfully.');
}

seedSyntheticDatabase().catch(err => {
  console.error('Failed to seed synthetic database:', err);
  process.exit(1);
});
