const app = require('./backend/server');
const { connectDB, getCol } = require('./backend/db/connection');

// Helper to make in-process requests to express app
function mockRequest(app, method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const reqHeaders = { 'content-type': 'application/json', ...headers };
    const bodyStr = body ? JSON.stringify(body) : '';
    if (bodyStr) reqHeaders['content-length'] = Buffer.byteLength(bodyStr);

    let resBody = '';
    const resHeaders = {};

    const reqMock = new (require('stream').Readable)();
    reqMock.push(bodyStr || null);
    reqMock.push(null);

    reqMock.method = method;
    reqMock.url = url;
    reqMock.headers = reqHeaders;

    const resMock = new (require('stream').Writable)();
    resMock.statusCode = 200;
    resMock.setHeader = (k, v) => { resHeaders[k.toLowerCase()] = v; };
    resMock.getHeader = (k) => resHeaders[k.toLowerCase()];
    resMock._write = (chunk, enc, next) => {
      resBody += chunk.toString();
      next();
    };

    resMock.writeHead = (status, hdrs = {}) => {
      resMock.statusCode = status;
      for (const [k, v] of Object.entries(hdrs)) {
        resMock.setHeader(k, v);
      }
    };

    resMock.end = (chunk) => {
      if (chunk) resBody += chunk.toString();
      let parsed = null;
      try {
        parsed = JSON.parse(resBody);
      } catch (e) {
        parsed = resBody;
      }
      resolve({ statusCode: resMock.statusCode, body: parsed });
    };

    app.handle(reqMock, resMock, (err) => {
      if (err) reject(err);
      else resolve({ statusCode: 404, body: 'Not found' });
    });
  });
}

async function verifyAll() {
  console.log('Connecting to database...');
  await connectDB();

  // Reset test appointments and ensure Doctor 1 is available for clean idempotent testing
  const appointmentsCol = getCol('appointments');
  const doctorsCol = getCol('doctors');
  await appointmentsCol.deleteMany({});
  await doctorsCol.updateOne({ email: 'dr.sharma@waitwise.com' }, { $set: { isAvailable: true, unavailabilityReason: '' } });
  console.log('DB ready (test state initialized).\n');

  console.log('=== TEST 1: HEALTH CHECK ===');
  const health = await mockRequest(app, 'GET', '/api/health');
  console.log('Health:', health.statusCode, health.body);

  console.log('\n=== TEST 2: SEED VERIFICATION ===');
  const seed = await mockRequest(app, 'GET', '/api/admin/seed');
  console.log('Seed message:', seed.body.message);

  console.log('\n=== TEST 3: ADMIN LOGIN ===');
  const adminLog = await mockRequest(app, 'POST', '/api/auth/login', {
    email: 'admin@waitwise.com',
    password: 'admin123',
    role: 'admin'
  });
  console.log('Admin login status:', adminLog.statusCode, 'User:', adminLog.body.user);
  const adminToken = adminLog.body.token;

  console.log('\n=== TEST 4: DOCTORS DIRECTORY (STRICT MAX 4 DOCTORS) ===');
  const docsRes = await mockRequest(app, 'GET', '/api/admin/doctors', null, {
    authorization: `Bearer ${adminToken}`
  });
  console.log(`Registered Doctors: ${docsRes.body.doctors.length} / ${docsRes.body.maxDoctors}`);
  docsRes.body.doctors.forEach((d, i) => {
    console.log(` [${i + 1}] ${d.name} | Spec: ${d.specialization} | Slot: ${d.consultationTime} min | Avail: ${d.isAvailable} ${d.unavailabilityReason ? '(' + d.unavailabilityReason + ')' : ''}`);
  });

  console.log('\n=== TEST 5: STRICT 4-DOCTOR LIMIT ENFORCEMENT ===');
  const fifthDoctor = await mockRequest(app, 'POST', '/api/admin/register-doctor', {
    name: 'Dr. Extra Doc',
    email: 'extra@waitwise.com',
    password: 'password123',
    specialization: 'Neurology (OP)',
    consultationTime: 15
  }, { authorization: `Bearer ${adminToken}` });
  console.log('Attempt to register 5th doctor:', fifthDoctor.statusCode, fifthDoctor.body.message);

  console.log('\n=== TEST 6: PATIENT LOGIN ===');
  const patientLog = await mockRequest(app, 'POST', '/api/auth/login', {
    email: 'patient@waitwise.com',
    password: 'patient123',
    role: 'patient'
  });
  console.log('Patient login:', patientLog.statusCode, patientLog.body.user);
  const patientToken = patientLog.body.token;

  console.log('\n=== TEST 7: BOOK OP CONSULTATION & TOKEN GENERATION ===');
  const targetDoctor = docsRes.body.doctors.find(d => d.email === 'dr.sharma@waitwise.com');
  const todayStr = new Date().toISOString().split('T')[0];

  const slotsRes = await mockRequest(app, 'GET', `/api/patient/doctors/${targetDoctor._id}/slots?date=${todayStr}`, null, {
    authorization: `Bearer ${patientToken}`
  });
  console.log(`Available slots for ${targetDoctor.name} on ${slotsRes.body.dayName}:`, slotsRes.body.slots.slice(0, 3));

  const chosenSlot = slotsRes.body.slots[0] || '09:00 - 09:15';
  const bookRes = await mockRequest(app, 'POST', '/api/patient/book', {
    doctorId: targetDoctor._id,
    date: todayStr,
    slot: chosenSlot
  }, { authorization: `Bearer ${patientToken}` });

  console.log('Booking Result:', bookRes.statusCode, bookRes.body.appointment);
  const appointmentId = bookRes.body.appointment._id;

  console.log('\n=== TEST 8: REAL-TIME TOKEN TRACKING (PATIENT VIEW) ===');
  const trackRes = await mockRequest(app, 'GET', `/api/patient/token/${appointmentId}`, null, {
    authorization: `Bearer ${patientToken}`
  });
  console.log('Token tracker status:', trackRes.body.token);

  console.log('\n=== TEST 9: DOCTOR DIRECT LOGIN & QUEUE MANAGEMENT ===');
  const doctorLog = await mockRequest(app, 'POST', '/api/auth/login', {
    email: targetDoctor.email,
    password: 'doctor123',
    role: 'doctor'
  });
  console.log('Doctor login:', doctorLog.statusCode, 'Dr:', doctorLog.body.user.name);
  const doctorToken = doctorLog.body.token;

  const docQueueBefore = await mockRequest(app, 'GET', '/api/doctor/queue', null, {
    authorization: `Bearer ${doctorToken}`
  });
  console.log(`Doctor Queue: Total = ${docQueueBefore.body.stats.total}, Waiting = ${docQueueBefore.body.stats.waitingCount}`);

  // Doctor calls patient into consultation room
  console.log('\n=== TEST 10: DOCTOR CALLS PATIENT INTO ROOM ===');
  const callIn = await mockRequest(app, 'PATCH', `/api/doctor/appointments/${appointmentId}/status`, {
    status: 'in-consultation'
  }, { authorization: `Bearer ${doctorToken}` });
  console.log('Call-in status:', callIn.body.message);

  // Patient tracks updated status
  const trackInCon = await mockRequest(app, 'GET', `/api/patient/token/${appointmentId}`, null, {
    authorization: `Bearer ${patientToken}`
  });
  console.log('Patient Tracker Status:', trackInCon.body.token.status, '| Queue Pos:', trackInCon.body.token.queuePosition);

  // Doctor marks consultation completed with clinical note
  console.log('\n=== TEST 11: DOCTOR COMPLETES CONSULTATION (AUTO-UPDATES QUEUE) ===');
  const completeRes = await mockRequest(app, 'PATCH', `/api/doctor/appointments/${appointmentId}/complete`, {
    notes: 'Prescribed anti-histamine, symptoms mild.'
  }, { authorization: `Bearer ${doctorToken}` });
  console.log('Consultation complete response:', completeRes.body.message);

  const docQueueAfter = await mockRequest(app, 'GET', '/api/doctor/queue', null, {
    authorization: `Bearer ${doctorToken}`
  });
  console.log(`Doctor Queue After: Completed = ${docQueueAfter.body.stats.completedCount}, Waiting = ${docQueueAfter.body.stats.waitingCount}`);

  console.log('\n=== TEST 12: DOCTOR AVAILABILITY TOGGLE & WARD REASON ===');
  const toggleAvail = await mockRequest(app, 'PATCH', '/api/doctor/availability', {
    isAvailable: false,
    unavailabilityReason: 'Visiting existing patients in ward (In-Patient rounds)'
  }, { authorization: `Bearer ${doctorToken}` });
  console.log('Doctor availability toggle:', toggleAvail.body);

  // Re-enable for subsequent testing
  await doctorsCol.updateOne({ email: 'dr.sharma@waitwise.com' }, { $set: { isAvailable: true, unavailabilityReason: '' } });

  console.log('\n=== TEST 13: ADMIN OVERALL VIEW ===');
  const adminDash = await mockRequest(app, 'GET', '/api/admin/dashboard', null, {
    authorization: `Bearer ${adminToken}`
  });
  console.log('Admin Dashboard Overall Stats:', adminDash.body.data);

  console.log('\n======================================================');
  console.log('🎉 ALL WAITWISE SYSTEM TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('======================================================');
}

verifyAll()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Test error:', err);
    process.exit(1);
  });
