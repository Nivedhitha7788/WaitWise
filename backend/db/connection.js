const { MongoClient, ObjectId } = require('mongodb');
const { seedInitialData } = require('./seedData');
const { createHash } = require('crypto');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/waitwise';
let client = null;
let db = null;

async function connectDB() {
  if (db) return db;

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000
  });

  try {
    await client.connect();
    db = client.db('waitwise');
    console.log('✓ Connected to MongoDB (waitwise database)');
  } catch (err) {
    await client.close().catch(closeError => {
      console.error('Failed to close MongoDB client after connection error:', closeError.message);
    });
    client = null;
    throw new Error(`Unable to connect to MongoDB: ${err.message}`, { cause: err });
  }

  // Seed default accounts and the fixed two-doctor psychiatry clinic.
  await seedInitialData(getCol);
  await getCol('feedback').createIndex({ appointmentId: 1 }, { unique: true });
  const doctors = await getCol('doctors').find({}).toArray();
  for (const doctor of doctors) {
    await ensureDoctorDatabase(doctor);
  }

  return db;
}

function getDB() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

function getCol(name) {
  return getDB().collection(name);
}

function getDoctorDBName(doctorId) {
  if (doctorId === null || doctorId === undefined || !String(doctorId).trim()) {
    throw new Error('A doctor ID is required to select the doctor database.');
  }
  const id = String(doctorId);
  const key = createHash('sha256').update(id).digest('hex').slice(0, 40);
  return `waitwise_doctor_${key}`;
}

function getDoctorDB(doctorId) {
  if (!client) throw new Error('Database not connected. Call connectDB() first.');
  return client.db(getDoctorDBName(doctorId));
}

function getDoctorCol(doctorId, name) {
  return getDoctorDB(doctorId).collection(name);
}

async function ensureDoctorDatabase(doctor) {
  const doctorId = String(doctor._id);
  const doctorDB = getDoctorDB(doctorId);
  const appointments = doctorDB.collection('appointments');

  await doctorDB.collection('doctorProfile').updateOne(
    { doctorId },
    {
      $set: {
        doctorId,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        consultationTime: doctor.consultationTime
      }
    },
    { upsert: true }
  );
  await appointments.createIndex({ appointmentDate: 1, tokenNumber: 1 });
  await appointments.createIndex({ patientId: 1, bookedAt: -1 });
  await appointments.updateMany(
    { consultationDurationMinutes: { $exists: false } },
    { $set: { consultationDurationMinutes: Number(doctor.consultationTime) || 60 } }
  );

  const migrationKey = `doctor-appointments-v1:${doctorId}`;
  const metadata = getCol('metadata');
  if (await metadata.findOne({ key: migrationKey })) return;

  const doctorIdValues = ObjectId.isValid(doctorId)
    ? [doctorId, new ObjectId(doctorId)]
    : [doctorId];
  const legacyAppointments = await getCol('appointments').find({
    doctorId: { $in: doctorIdValues }
  }).toArray();
  for (const appointment of legacyAppointments) {
    await appointments.replaceOne(
      { _id: appointment._id },
      {
        ...appointment,
        doctorId,
        consultationDurationMinutes:
          Number(appointment.consultationDurationMinutes) || Number(doctor.consultationTime) || 60
      },
      { upsert: true }
    );
  }
  await metadata.updateOne(
    { key: migrationKey },
    { $set: { key: migrationKey, migratedAt: new Date(), appointmentCount: legacyAppointments.length } },
    { upsert: true }
  );
}

module.exports = {
  connectDB,
  getDB,
  getCol,
  getDoctorDB,
  getDoctorCol,
  ensureDoctorDatabase,
  getDoctorDBName,
  ObjectId
};
