const app = require('./backend/server');
const { connectDB, getCol } = require('./backend/db/connection');
const assert = require('assert');
const { getClinicDateKey } = require('./backend/utils/clinicConfig');
const { getDayRange } = require('./backend/utils/dateHelper');

function formatLocalDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

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

  const appointmentsCol = getCol('appointments');
  const doctorsCol = getCol('doctors');
  const usersCol = getCol('users');
  const doctorEmail = 'dr.sharma@waitwise.com';
  const originalDoctor = await doctorsCol.findOne({ email: doctorEmail });
  const testEmail = `waitwise-test-${Date.now()}@example.com`;
  let testPatientId = null;
  try {
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

  console.log('\n=== TEST 4: TWO-DOCTOR PSYCHIATRY DIRECTORY ===');
  const docsRes = await mockRequest(app, 'GET', '/api/admin/doctors', null, {
    authorization: `Bearer ${adminToken}`
  });
  console.log(`Registered Doctors: ${docsRes.body.doctors.length} / ${docsRes.body.maxDoctors}`);
  assert.strictEqual(docsRes.body.doctors.length, 2);
  assert.strictEqual(docsRes.body.maxDoctors, 2);
  docsRes.body.doctors.forEach((d, i) => {
    console.log(` [${i + 1}] ${d.name} | Spec: ${d.specialization} | Slot: ${d.consultationTime} min | Avail: ${d.isAvailable} ${d.unavailabilityReason ? '(' + d.unavailabilityReason + ')' : ''}`);
    assert.strictEqual(d.specialization, 'General Psychiatry');
    assert.strictEqual(d.consultationTime, 60);
  });

  console.log('\n=== TEST 5: STRICT TWO-DOCTOR LIMIT ENFORCEMENT ===');
  const fifthDoctor = await mockRequest(app, 'POST', '/api/admin/register-doctor', {
    name: 'Dr. Extra Doc',
    email: 'extra@waitwise.com',
    password: 'password123'
  }, { authorization: `Bearer ${adminToken}` });
  console.log('Attempt to register a third doctor:', fifthDoctor.statusCode, fifthDoctor.body.message);
  assert.strictEqual(fifthDoctor.statusCode, 400);

  console.log('\n=== TEST 6: PATIENT LOGIN ===');
  const registration = await mockRequest(app, 'POST', '/api/auth/register', {
    name: 'WaitWise Integration Patient',
    email: testEmail,
    password: 'patient123'
  });
  assert.strictEqual(registration.statusCode, 201);
  const patientLog = await mockRequest(app, 'POST', '/api/auth/login', {
    email: testEmail,
    password: 'patient123',
    role: 'patient'
  });
  console.log('Patient login:', patientLog.statusCode, patientLog.body.user);
  const patientToken = patientLog.body.token;
  testPatientId = patientLog.body.user.id;

  console.log('\n=== TEST 7: BOOK OP CONSULTATION & TOKEN GENERATION ===');
  const targetDoctor = docsRes.body.doctors.find(d => d.email === 'dr.sharma@waitwise.com');
  let appointmentDate = null;
  let todayStr = '';
  for (let offset = 1; offset <= 365; offset++) {
    const candidate = new Date();
    candidate.setDate(candidate.getDate() + offset);
    if (candidate.getDay() === 0) continue;
    const candidateKey = formatLocalDate(candidate);
    const { start, end } = getDayRange(candidateKey);
    const existingCount = await appointmentsCol.countDocuments({
      doctorId: String(targetDoctor._id),
      appointmentDate: { $gte: start, $lte: end }
    });
    if (existingCount === 0) {
      appointmentDate = candidate;
      todayStr = candidateKey;
      break;
    }
  }
  assert(appointmentDate, 'Could not find an unbooked clinic day for integration testing.');
  const yesterday = new Date(`${getClinicDateKey()}T12:00:00`);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.getDay() === 0) yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  const slotsRes = await mockRequest(app, 'GET', `/api/patient/doctors/${targetDoctor._id}/slots?date=${todayStr}`, null, {
    authorization: `Bearer ${patientToken}`
  });
  assert.deepStrictEqual(slotsRes.body.sessions.map(session => session.code), ['FN', 'AN']);
  assert.deepStrictEqual(slotsRes.body.sessions[0].slots, ['09:00 - 10:00', '10:15 - 11:15', '11:30 - 12:30']);
  assert.deepStrictEqual(slotsRes.body.sessions[1].slots, ['13:30 - 14:30', '14:45 - 15:45', '16:00 - 17:00']);
  console.log(`Available sessions for ${targetDoctor.name} on ${slotsRes.body.dayName}:`, slotsRes.body.sessions);

  const pastBooking = await mockRequest(app, 'POST', '/api/patient/book', {
    doctorId: targetDoctor._id,
    date: yesterdayStr,
    session: 'FN',
    slot: '09:00 - 10:00'
  }, { authorization: `Bearer ${patientToken}` });
  assert.strictEqual(pastBooking.statusCode, 400);

  const invalidSlot = await mockRequest(app, 'POST', '/api/patient/book', {
    doctorId: targetDoctor._id,
    date: todayStr,
    session: 'FN',
    slot: '09:00 - 09:15'
  }, { authorization: `Bearer ${patientToken}` });
  assert.strictEqual(invalidSlot.statusCode, 400);

  const chosenSlot = slotsRes.body.sessions[0].slots[0];
  const bookRes = await mockRequest(app, 'POST', '/api/patient/book', {
    doctorId: targetDoctor._id,
    date: todayStr,
    session: 'FN',
    slot: chosenSlot
  }, { authorization: `Bearer ${patientToken}` });

  console.log('Booking Result:', bookRes.statusCode, bookRes.body.appointment);
  assert.strictEqual(bookRes.statusCode, 201);
  assert.strictEqual(bookRes.body.appointment.session, 'FN');
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

  const doctorSlots = await mockRequest(app, 'GET', `/api/doctor/slots?date=${todayStr}`, null, {
    authorization: `Bearer ${doctorToken}`
  });
  assert.deepStrictEqual(doctorSlots.body.sessions.map(session => session.code), ['FN', 'AN']);

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

  console.log('\n=== TEST 13: ADMIN OVERALL VIEW ===');
  const adminDash = await mockRequest(app, 'GET', '/api/admin/dashboard', null, {
    authorization: `Bearer ${adminToken}`
  });
  console.log('Admin Dashboard Overall Stats:', adminDash.body.data);

  console.log('\n======================================================');
  console.log('🎉 ALL WAITWISE SYSTEM TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('======================================================');
  } finally {
    if (testPatientId) {
      await appointmentsCol.deleteMany({ patientId: String(testPatientId) });
    }
    await usersCol.deleteMany({ email: testEmail });
    if (originalDoctor) {
      await doctorsCol.updateOne(
        { _id: originalDoctor._id },
        { $set: { isAvailable: originalDoctor.isAvailable, unavailabilityReason: originalDoctor.unavailabilityReason || '' } }
      );
    }
  }
}

verifyAll()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Test error:', err);
    process.exit(1);
  });
