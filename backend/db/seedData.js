const bcrypt = require('bcryptjs');
const {
  CLINIC_SPECIALIZATION,
  CONSULTATION_MINUTES,
  MAX_DOCTORS,
  buildAvailableSlots
} = require('../utils/clinicConfig');

const DEFAULT_DOCTORS = [
  {
    name: 'Dr. Rajesh Sharma',
    email: 'dr.sharma@waitwise.com'
  },
  {
    name: 'Dr. Priya Patel',
    email: 'dr.patel@waitwise.com'
  }
];

async function seedInitialData(getCol) {
  try {
    const users = getCol('users');
    const doctors = getCol('doctors');
    const metadata = getCol('metadata');

    // 1. Seed Admin
    const adminExists = await users.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedAdminPass = await bcrypt.hash('admin123', 10);
      await users.insertOne({
        name: 'Hospital Administrator',
        email: 'admin@waitwise.com',
        password: hashedAdminPass,
        role: 'admin',
        phone: '1800-WAITWISE',
        createdAt: new Date()
      });
      console.log('✓ Admin seeded: admin@waitwise.com / admin123');
    }

    // 2. Seed Default Patient
    const patientExists = await users.findOne({ email: 'patient@waitwise.com' });
    if (!patientExists) {
      const hashedPatientPass = await bcrypt.hash('patient123', 10);
      await users.insertOne({
        name: 'John Doe',
        email: 'patient@waitwise.com',
        password: hashedPatientPass,
        role: 'patient',
        phone: '+91 98765 43210',
        age: 32,
        gender: 'Male',
        createdAt: new Date()
      });
      console.log('✓ Patient seeded: patient@waitwise.com / patient123');
    }

    // Migrate the former four-doctor seed to two psychiatry doctors once.
    const migration = await metadata.findOne({ key: 'psychiatry-clinic-v1' });
    if (!migration) {
      const existingDoctors = await doctors.find({}).toArray();
      const defaultEmails = DEFAULT_DOCTORS.map(doctor => doctor.email);
      const retained = existingDoctors.filter(doctor => defaultEmails.includes(doctor.email));
      const retainedIds = new Set(retained.slice(0, MAX_DOCTORS).map(doctor => String(doctor._id)));

      for (const doctor of existingDoctors) {
        const keep = retainedIds.has(String(doctor._id));
        if (!keep) {
          await doctors.updateOne({ _id: doctor._id }, { $set: { retired: true } });
        }
      }

      const defaultDoctorPass = await bcrypt.hash('doctor123', 10);
      for (const doctorInfo of DEFAULT_DOCTORS) {
        let doctor = await doctors.findOne({ email: doctorInfo.email });
        if (!doctor) {
          const result = await doctors.insertOne({
            ...doctorInfo,
            password: defaultDoctorPass,
            isAvailable: true,
            unavailabilityReason: '',
            createdAt: new Date()
          });
          doctor = { _id: result.insertedId };
        }

        await doctors.updateOne(
          { _id: doctor._id },
          {
            $set: {
              name: doctor.name || doctorInfo.name,
              specialization: CLINIC_SPECIALIZATION,
              consultationTime: CONSULTATION_MINUTES,
              availableSlots: buildAvailableSlots(),
              isAvailable: true,
              unavailabilityReason: '',
              retired: false
            }
          }
        );
      }
      await metadata.insertOne({ key: 'psychiatry-clinic-v1', completedAt: new Date() });
      console.log('✓ Psychiatry clinic configured with 2 General Psychiatry doctors.');
    }
  } catch (err) {
    console.error('Error in seedInitialData:', err.message);
    throw err;
  }
}

module.exports = { seedInitialData };
