const bcrypt = require('bcryptjs');

async function seedInitialData(getCol) {
  try {
    const users = getCol('users');
    const doctors = getCol('doctors');

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

    // 3. Seed Exactly 4 Doctors (OP only)
    const doctorCount = await doctors.countDocuments();
    if (doctorCount === 0) {
      const defaultDoctorPass = await bcrypt.hash('doctor123', 10);
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const fourDoctors = [
        {
          name: 'Dr. Rajesh Sharma',
          email: 'dr.sharma@waitwise.com',
          password: defaultDoctorPass,
          specialization: 'General Medicine (OP)',
          consultationTime: 15,
          isAvailable: true,
          unavailabilityReason: '',
          availableSlots: weekDays.map(day => ({ day, startTime: '09:00', endTime: '13:00' })),
          createdAt: new Date()
        },
        {
          name: 'Dr. Priya Patel',
          email: 'dr.patel@waitwise.com',
          password: defaultDoctorPass,
          specialization: 'Pediatrics (OP)',
          consultationTime: 15,
          isAvailable: true,
          unavailabilityReason: '',
          availableSlots: weekDays.map(day => ({ day, startTime: '10:00', endTime: '14:00' })),
          createdAt: new Date()
        },
        {
          name: 'Dr. Anita Desai',
          email: 'dr.desai@waitwise.com',
          password: defaultDoctorPass,
          specialization: 'Dermatology (OP)',
          consultationTime: 20,
          isAvailable: false,
          unavailabilityReason: 'Doctor visiting existing patients in ward (In-Patient rounds)',
          availableSlots: weekDays.map(day => ({ day, startTime: '11:00', endTime: '15:00' })),
          createdAt: new Date()
        },
        {
          name: 'Dr. Vikram Rao',
          email: 'dr.rao@waitwise.com',
          password: defaultDoctorPass,
          specialization: 'Orthopedics (OP)',
          consultationTime: 15,
          isAvailable: true,
          unavailabilityReason: '',
          availableSlots: weekDays.map(day => ({ day, startTime: '09:30', endTime: '13:30' })),
          createdAt: new Date()
        }
      ];

      for (const doc of fourDoctors) {
        await doctors.insertOne(doc);
      }
      console.log('✓ 4 OP Doctors seeded (dr.sharma@waitwise.com, dr.patel@waitwise.com, dr.desai@waitwise.com, dr.rao@waitwise.com / doctor123)');
    }
  } catch (err) {
    console.error('Error in seedInitialData:', err.message);
  }
}

module.exports = { seedInitialData };

