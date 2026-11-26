const app = require('./backend/server');
const { connectDB, getCol, getDoctorCol, getDoctorDBName } = require('./backend/db/connection');
const assert = require('assert');
const { getClinicDateKey, getBookingWindow, isBookableDate } = require('./backend/utils/clinicConfig');
const { getDayRange } = require('./backend/utils/dateHelper');

const fixedBookingWindow = getBookingWindow(new Date('2026-11-26T12:00:00+05:30'));
// 2026-11-29 is a Sunday → skipped; window should be [27, 28, 30]
assert.deepStrictEqual(
  fixedBookingWindow.dates,
  ['2026-11-27', '2026-11-28', '2026-11-30'],
  'The booking window should start tomorrow, skip Sundays, and show the next three non-Sunday dates.'
);
assert.strictEqual(isBookableDate('2026-11-27', new Date('2026-11-26T12:00:00+05:30')), true);
assert.strictEqual(isBookableDate('2026-11-28', new Date('2026-11-26T12:00:00+05:30')), true);
assert.strictEqual(isBookableDate('2026-11-30', new Date('2026-11-26T12:00:00+05:30')), true);
// 2026-11-29 is a Sunday — must NOT be bookable
assert.strictEqual(isBookableDate('2026-11-29', new Date('2026-11-26T12:00:00+05:30')), false, 'Sunday must not be bookable');
assert.strictEqual(isBookableDate('2026-11-26', new Date('2026-11-26T12:00:00+05:30')), false);
assert.strictEqual(isBookableDate('2026-12-01', new Date('2026-11-26T12:00:00+05:30')), false);

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

  const doctorsCol = getCol('doctors');
  const usersCol = getCol('users');
  const feedbackCol = getCol('feedback');
  const contactMessagesCol = getCol('contactMessages');
  const doctorEmail = 'dr.sharma@waitwise.com';
  const originalDoctor = await doctorsCol.findOne({ email: doctorEmail });
  const secondDoctor = await doctorsCol.findOne({ email: 'dr.patel@waitwise.com' });
  const appointmentsCol = getDoctorCol(secondDoctor._id, 'appointments');
  const testEmail = `waitwise-test-${Date.now()}@example.com`;
  const contactEmail = `waitwise-contact-${Date.now()}@example.com`;
  let testPatientId = null;
  assert.notStrictEqual(
    getDoctorDBName(originalDoctor._id),
    getDoctorDBName(secondDoctor._id),
    'Each doctor should map to an isolated MongoDB database.'
  );
  const doctorProfile = await getDoctorCol(originalDoctor._id, 'doctorProfile')
    .findOne({ doctorId: String(originalDoctor._id) });
  assert.strictEqual(doctorProfile.name, 'Dr. Rajesh Sharma');
  const secondDoctorProfile = await getDoctorCol(secondDoctor._id, 'doctorProfile')
    .findOne({ doctorId: String(secondDoctor._id) });
  assert.strictEqual(secondDoctorProfile.name, 'Dr. Priya Patel');
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
  const savedAdmin = await usersCol.findOne({ email: 'admin@waitwise.com' });
  assert(savedAdmin);
  assert.strictEqual(savedAdmin.name, 'Hospital Administrator');
  assert.strictEqual(savedAdmin.role, 'admin');
  assert.strictEqual(savedAdmin.phone, '1800-WAITWISE');
  assert.notStrictEqual(savedAdmin.password, 'admin123');

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
  const savedDoctors = await doctorsCol.find({ retired: { $ne: true } }).toArray();
  assert.strictEqual(savedDoctors.length, 2);
  assert.deepStrictEqual(
    savedDoctors.map(doctor => doctor.email).sort(),
    ['dr.patel@waitwise.com', 'dr.sharma@waitwise.com']
  );
  savedDoctors.forEach(doctor => {
    assert.strictEqual(doctor.retired, false);
    assert.strictEqual(doctor.specialization, 'General Psychiatry');
    assert.strictEqual(doctor.consultationTime, 60);
    assert.strictEqual(typeof doctor.isAvailable, 'boolean');
    assert.strictEqual(typeof doctor.unavailabilityReason, 'string');
    assert.strictEqual(doctor.availableSlots.length, 7);
    assert(doctor.availableSlots.every(day => day.sessions.length === 2));
    assert.notStrictEqual(doctor.password, 'doctor123');
  });
  const savedDoctor = savedDoctors.find(doctor => doctor.email === 'dr.sharma@waitwise.com');
  assert(savedDoctor);
  assert.strictEqual(savedDoctor.name, 'Dr. Rajesh Sharma');
  assert.strictEqual(savedDoctors.find(doctor => doctor.email === 'dr.patel@waitwise.com').name, 'Dr. Priya Patel');
  assert.strictEqual(savedDoctor.bookingPriority, 2);
  assert.strictEqual(savedDoctors.find(doctor => doctor.email === 'dr.patel@waitwise.com').bookingPriority, 1);

  console.log('\n=== TEST 5: STRICT TWO-DOCTOR LIMIT ENFORCEMENT ===');
  const shortDoctorPassword = await mockRequest(app, 'POST', '/api/admin/register-doctor', {
    name: 'Dr. Short Password',
    email: 'short-password@waitwise.com',
    password: '12345'
  }, { authorization: `Bearer ${adminToken}` });
  assert.strictEqual(shortDoctorPassword.statusCode, 400);
  assert.strictEqual(shortDoctorPassword.body.message, 'Password must be at least 6 characters.');

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
    password: 'patient123',
    phone: '+91 98765 43210',
    age: 32,
    gender: 'Other'
  });
  assert.strictEqual(registration.statusCode, 201);
  const savedPatient = await usersCol.findOne({ email: testEmail });
  assert(savedPatient);
  assert.strictEqual(savedPatient.name, 'WaitWise Integration Patient');
  assert.strictEqual(savedPatient.role, 'patient');
  assert.strictEqual(savedPatient.phone, '+91 98765 43210');
  assert.strictEqual(savedPatient.age, 32);
  assert.strictEqual(savedPatient.gender, 'Other');
  assert.notStrictEqual(savedPatient.password, 'patient123');
  const patientLog = await mockRequest(app, 'POST', '/api/auth/login', {
    email: testEmail,
    password: 'patient123',
    role: 'patient'
  });
  console.log('Patient login:', patientLog.statusCode, patientLog.body.user);
  const patientToken = patientLog.body.token;
  testPatientId = patientLog.body.user.id;

  console.log('\n=== TEST 6A: PUBLIC CONTACT FORM ===');
  const contactMessage = await mockRequest(app, 'POST', '/api/patient/contact', {
    name: 'WaitWise Contact Test',
    email: contactEmail,
    phone: '555-0100',
    subject: 'Appointment question',
    message: 'Please contact me about my appointment.'
  });
  assert.strictEqual(contactMessage.statusCode, 201);
  assert.strictEqual(await contactMessagesCol.countDocuments({ email: contactEmail }), 1);
  const invalidContact = await mockRequest(app, 'POST', '/api/patient/contact', {
    name: 'Invalid Contact',
    email: 'not-an-email',
    subject: 'Question',
    message: 'Hello'
  });
  assert.strictEqual(invalidContact.statusCode, 400);

  console.log('\n=== TEST 7: BOOK OP CONSULTATION & TOKEN GENERATION ===');
  const targetDoctor = docsRes.body.doctors.find(d => d.email === 'dr.patel@waitwise.com');
  const secondBookingDoctor = docsRes.body.doctors.find(d => d.email === 'dr.sharma@waitwise.com');
  let appointmentDate = null;
  let todayStr = '';
  for (const candidateKey of getBookingWindow().dates) {
    const candidate = new Date(`${candidateKey}T12:00:00`);
    const { start, end } = getDayRange(candidateKey);
    const [primaryCount, secondaryCount] = await Promise.all([
      getDoctorCol(targetDoctor._id, 'appointments').countDocuments({
        doctorId: String(targetDoctor._id),
        appointmentDate: { $gte: start, $lte: end }
      }),
      getDoctorCol(secondBookingDoctor._id, 'appointments').countDocuments({
        doctorId: String(secondBookingDoctor._id),
        appointmentDate: { $gte: start, $lte: end }
      })
    ]);
    if (primaryCount === 0 && secondaryCount === 0) {
      appointmentDate = candidate;
      todayStr = candidateKey;
      break;
    }
  }
  assert(appointmentDate, 'Could not find an unbooked clinic day for integration testing.');

  const initialBookingDoctors = await mockRequest(app, 'GET', `/api/patient/doctors/all?date=${todayStr}`, null, {
    authorization: `Bearer ${patientToken}`
  });
  const primaryBookingOption = initialBookingDoctors.body.doctors.find(doctor => doctor.email === 'dr.patel@waitwise.com');
  const secondaryBookingOption = initialBookingDoctors.body.doctors.find(doctor => doctor.email === 'dr.sharma@waitwise.com');
  assert.strictEqual(primaryBookingOption.bookingEnabled, true);
  assert.strictEqual(secondaryBookingOption.bookingEnabled, false);

  const blockedSecondDoctorSlots = await mockRequest(
    app,
    'GET',
    `/api/patient/doctors/${secondBookingDoctor._id}/slots?date=${todayStr}`,
    null,
    { authorization: `Bearer ${patientToken}` }
  );
  assert.strictEqual(blockedSecondDoctorSlots.body.bookingEnabled, false);
  const blockedSecondDoctorBooking = await mockRequest(app, 'POST', '/api/patient/book', {
    doctorId: secondBookingDoctor._id,
    date: todayStr,
    session: 'FN',
    slot: '09:00 - 10:00'
  }, { authorization: `Bearer ${patientToken}` });
  assert.strictEqual(blockedSecondDoctorBooking.statusCode, 409);

  const outsideWindowBooking = await mockRequest(app, 'POST', '/api/patient/book', {
    doctorId: targetDoctor._id,
    date: getClinicDateKey(),
    session: 'FN',
    slot: '09:00 - 10:00'
  }, { authorization: `Bearer ${patientToken}` });
  assert.strictEqual(outsideWindowBooking.statusCode, 400);

  const policyTestAppointments = getDoctorCol(targetDoctor._id, 'appointments');
  await policyTestAppointments.insertMany([
    '09:00 - 10:00',
    '10:15 - 11:15',
    '11:30 - 12:30',
    '13:30 - 14:30',
    '14:45 - 15:45',
    '16:00 - 17:00'
  ].map((slot, index) => ({
    patientId: `booking-policy-test-${index}`,
    doctorId: String(targetDoctor._id),
    appointmentDate: new Date(`${todayStr}T12:00:00`),
    session: index < 3 ? 'FN' : 'AN',
    slot,
    tokenNumber: index + 1,
    status: 'waiting',
    bookingPolicyTest: true
  })));
  const fullDateSlots = await mockRequest(
    app,
    'GET',
    `/api/patient/doctors/${targetDoctor._id}/slots?date=${todayStr}`,
    null,
    { authorization: `Bearer ${patientToken}` }
  );
  assert.strictEqual(fullDateSlots.body.bookingEnabled, false);
  const otherBookingDates = getBookingWindow().dates.filter(date => date !== todayStr);
  const nextBookingDate = otherBookingDates.find(date => date > todayStr);
  let suggestedSlot = null;
  const checkSuggestionDate = async candidateKey => {
    const candidateSlots = await mockRequest(
      app,
      'GET',
      `/api/patient/doctors/${targetDoctor._id}/slots?date=${candidateKey}`,
      null,
      { authorization: `Bearer ${patientToken}` }
    );
    if (candidateSlots.body.slots && candidateSlots.body.slots.length) {
      return { date: candidateKey, slot: candidateSlots.body.slots[0] };
    }
    return null;
  };
  if (nextBookingDate) suggestedSlot = await checkSuggestionDate(nextBookingDate);
  if (!suggestedSlot) {
    for (const candidateKey of otherBookingDates) {
      if (candidateKey === nextBookingDate) continue;
      suggestedSlot = await checkSuggestionDate(candidateKey);
      if (suggestedSlot) break;
    }
  }
  if (suggestedSlot) {
    assert(fullDateSlots.body.message.includes(suggestedSlot.date));
    assert(fullDateSlots.body.message.includes(suggestedSlot.slot));
  } else {
    assert.match(fullDateSlots.body.message, /No slots are currently available/);
  }

  const unlockedBookingDoctors = await mockRequest(app, 'GET', `/api/patient/doctors/all?date=${todayStr}`, null, {
    authorization: `Bearer ${patientToken}`
  });
  assert.strictEqual(
    unlockedBookingDoctors.body.doctors.find(doctor => doctor.email === 'dr.sharma@waitwise.com').bookingEnabled,
    true
  );
  await policyTestAppointments.deleteMany({ bookingPolicyTest: true });

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
  const savedAppointment = await appointmentsCol.findOne({
    patientId: String(testPatientId),
    doctorId: String(targetDoctor._id),
    slot: chosenSlot
  });
  assert(savedAppointment);
  assert.strictEqual(savedAppointment.consultationDurationMinutes, 60);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(savedAppointment, 'estimatedWaitTime'), false);
  assert.strictEqual(await getCol('appointments').countDocuments({ _id: savedAppointment._id }), 0);
  assert.strictEqual(savedAppointment.session, 'FN');
  assert.strictEqual(savedAppointment.status, 'waiting');
  assert.strictEqual(savedAppointment.tokenNumber, bookRes.body.appointment.tokenNumber);

  let laterBooking = null;
  for (const candidateKey of getBookingWindow().dates) {
    if (laterBooking) break;
    const candidateSlots = await mockRequest(app, 'GET', `/api/patient/doctors/${targetDoctor._id}/slots?date=${candidateKey}`, null, {
      authorization: `Bearer ${patientToken}`
    });
    const session = candidateSlots.body.sessions && candidateSlots.body.sessions.find(item => item.slots.length > 0);
    if (session) {
      laterBooking = {
        date: candidateKey,
        session: session.code,
        slot: session.slots[0]
      };
    }
  }
  assert(laterBooking, 'Could not find a later available clinic slot for the duplicate-booking test.');
  const duplicateBooking = await mockRequest(app, 'POST', '/api/patient/book', {
    doctorId: targetDoctor._id,
    ...laterBooking
  }, { authorization: `Bearer ${patientToken}` });
  assert.strictEqual(duplicateBooking.statusCode, 409);
  assert.strictEqual(duplicateBooking.body.message, 'You already have an active appointment with this doctor. Complete or cancel it before booking another.');

  console.log('\n=== TEST 8: REAL-TIME TOKEN TRACKING (PATIENT VIEW) ===');
  const trackRes = await mockRequest(app, 'GET', `/api/patient/token/${appointmentId}`, null, {
    authorization: `Bearer ${patientToken}`
  });
  console.log('Token tracker status:', trackRes.body.token);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(trackRes.body.token, 'estimatedWaitTime'), false);
  const earlyFeedback = await mockRequest(app, 'POST', '/api/patient/feedback', {
    appointmentId,
    rating: 5,
    comment: 'Great care.'
  }, { authorization: `Bearer ${patientToken}` });
  assert.strictEqual(earlyFeedback.statusCode, 400);

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

  const docQueueBefore = await mockRequest(app, 'GET', `/api/doctor/queue?date=${todayStr}`, null, {
    authorization: `Bearer ${doctorToken}`
  });
  console.log(`Doctor Queue: Total = ${docQueueBefore.body.stats.total}, Waiting = ${docQueueBefore.body.stats.waitingCount}`);
  assert.strictEqual(docQueueBefore.body.appointments.length, 1);
  assert.strictEqual(docQueueBefore.body.appointments[0].patient.name, 'WaitWise Integration Patient');
  assert.deepStrictEqual(Object.keys(docQueueBefore.body.appointments[0].patient), ['name']);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(docQueueBefore.body.appointments[0], 'notes'), false);

  // Doctor calls patient into consultation room
  console.log('\n=== TEST 10: DOCTOR CALLS PATIENT INTO ROOM ===');
  const doctorCallInDenied = await mockRequest(app, 'PATCH', `/api/doctor/appointments/${appointmentId}/status`, {
    status: 'in-consultation'
  }, { authorization: `Bearer ${doctorToken}` });
  assert.strictEqual(doctorCallInDenied.statusCode, 404);
  const doctorAdminCallDenied = await mockRequest(app, 'PATCH', `/api/admin/appointments/${appointmentId}/status`, {
    status: 'in-consultation'
  }, { authorization: `Bearer ${doctorToken}` });
  assert.strictEqual(doctorAdminCallDenied.statusCode, 403);
  const callIn = await mockRequest(app, 'PATCH', `/api/admin/appointments/${appointmentId}/status`, {
    status: 'in-consultation'
  }, { authorization: `Bearer ${adminToken}` });
  console.log('Call-in status:', callIn.body.message);
  const activeAppointment = await appointmentsCol.findOne({ _id: savedAppointment._id });
  assert(activeAppointment.consultationStartedAt instanceof Date);
  assert.strictEqual(activeAppointment.consultationDurationMinutes, 60);

  // Patient tracks updated status
  const trackInCon = await mockRequest(app, 'GET', `/api/patient/token/${appointmentId}`, null, {
    authorization: `Bearer ${patientToken}`
  });
  console.log('Patient Tracker Status:', trackInCon.body.token.status, '| Queue Pos:', trackInCon.body.token.queuePosition);

  // Doctor marks consultation completed with clinical note
  console.log('\n=== TEST 11: DOCTOR COMPLETES CONSULTATION (AUTO-UPDATES QUEUE) ===');
  const doctorCompleteDenied = await mockRequest(app, 'PATCH', `/api/doctor/appointments/${appointmentId}/complete`, {
    notes: 'This must not be accepted.'
  }, { authorization: `Bearer ${doctorToken}` });
  assert.strictEqual(doctorCompleteDenied.statusCode, 404);
  const completeRes = await mockRequest(app, 'PATCH', `/api/admin/appointments/${appointmentId}/status`, {
    status: 'completed',
    notes: 'Prescribed anti-histamine, symptoms mild.'
  }, { authorization: `Bearer ${adminToken}` });
  console.log('Consultation complete response:', completeRes.body.message);
  const completedAppointment = await appointmentsCol.findOne({ _id: savedAppointment._id });
  assert.strictEqual(completedAppointment.status, 'completed');
  assert.strictEqual(completedAppointment.notes, 'Prescribed anti-histamine, symptoms mild.');
  assert(completedAppointment.completedAt instanceof Date);
  assert(completedAppointment.consultationCompletedAt instanceof Date);

  console.log('\n=== TEST 11A: PATIENT FEEDBACK AFTER COMPLETED VISIT ===');
  const feedbackRes = await mockRequest(app, 'POST', '/api/patient/feedback', {
    appointmentId,
    rating: 5,
    comment: 'The consultation was helpful.'
  }, { authorization: `Bearer ${patientToken}` });
  assert.strictEqual(feedbackRes.statusCode, 201);
  const duplicateFeedback = await mockRequest(app, 'POST', '/api/patient/feedback', {
    appointmentId,
    rating: 4,
    comment: 'Another rating.'
  }, { authorization: `Bearer ${patientToken}` });
  assert.strictEqual(duplicateFeedback.statusCode, 409);
  const patientAppointments = await mockRequest(app, 'GET', '/api/patient/appointments', null, {
    authorization: `Bearer ${patientToken}`
  });
  assert.strictEqual(patientAppointments.body.appointments.find(item => String(item._id) === String(appointmentId)).feedback.rating, 5);

  const rebookAfterCompletion = await mockRequest(app, 'POST', '/api/patient/book', {
    doctorId: targetDoctor._id,
    ...laterBooking
  }, { authorization: `Bearer ${patientToken}` });
  assert.strictEqual(rebookAfterCompletion.statusCode, 201);

  const docQueueAfter = await mockRequest(app, 'GET', `/api/doctor/queue?date=${todayStr}`, null, {
    authorization: `Bearer ${doctorToken}`
  });
  console.log(`Doctor Queue After: Completed = ${docQueueAfter.body.stats.completedCount}, Waiting = ${docQueueAfter.body.stats.waitingCount}`);

  console.log('\n=== TEST 12: DOCTOR AVAILABILITY TOGGLE & WARD REASON ===');
  const doctorAvailabilityDenied = await mockRequest(app, 'PATCH', '/api/doctor/availability', {
    isAvailable: false,
    unavailabilityReason: 'Visiting existing patients in ward (In-Patient rounds)'
  }, { authorization: `Bearer ${doctorToken}` });
  assert.strictEqual(doctorAvailabilityDenied.statusCode, 404);
  const doctorAdminAvailabilityDenied = await mockRequest(app, 'PATCH', `/api/admin/doctors/${targetDoctor._id}/availability`, {
    isAvailable: false
  }, { authorization: `Bearer ${doctorToken}` });
  assert.strictEqual(doctorAdminAvailabilityDenied.statusCode, 403);
  const toggleAvail = await mockRequest(app, 'PATCH', `/api/admin/doctors/${targetDoctor._id}/availability`, {
    isAvailable: false,
    unavailabilityReason: 'Visiting existing patients in ward (In-Patient rounds)'
  }, { authorization: `Bearer ${adminToken}` });
  console.log('Doctor availability toggle:', toggleAvail.body);
  const updatedDoctor = await doctorsCol.findOne({ _id: secondDoctor._id });
  assert.strictEqual(updatedDoctor.isAvailable, false);
  assert.strictEqual(updatedDoctor.unavailabilityReason, 'Visiting existing patients in ward (In-Patient rounds)');

  const unavailableBookingDoctors = await mockRequest(app, 'GET', `/api/patient/doctors/all?date=${todayStr}`, null, {
    authorization: `Bearer ${patientToken}`
  });
  assert.strictEqual(
    unavailableBookingDoctors.body.doctors.find(doctor => doctor.email === 'dr.sharma@waitwise.com').bookingEnabled,
    false
  );

  const unavailableSlots = await mockRequest(app, 'GET', `/api/patient/doctors/${targetDoctor._id}/slots?date=${todayStr}`, null, {
    authorization: `Bearer ${patientToken}`
  });
  assert.strictEqual(unavailableSlots.statusCode, 200);
  assert.deepStrictEqual(unavailableSlots.body.slots, []);
  assert.deepStrictEqual(unavailableSlots.body.sessions, []);

  const unavailableBooking = await mockRequest(app, 'POST', '/api/patient/book', {
    doctorId: targetDoctor._id,
    date: todayStr,
    session: 'FN',
    slot: '09:00 - 10:00'
  }, { authorization: `Bearer ${patientToken}` });
  assert.strictEqual(unavailableBooking.statusCode, 400);
  assert.match(unavailableBooking.body.message, /^Doctor is currently unavailable:/);

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
      await feedbackCol.deleteMany({ patientId: String(testPatientId) });
    }
    await usersCol.deleteMany({ email: testEmail });
    await contactMessagesCol.deleteMany({ email: contactEmail });
    if (originalDoctor) {
      await doctorsCol.updateOne(
        { _id: originalDoctor._id },
        { $set: { isAvailable: originalDoctor.isAvailable, unavailabilityReason: originalDoctor.unavailabilityReason || '' } }
      );
    }
    if (secondDoctor) {
      await doctorsCol.updateOne(
        { _id: secondDoctor._id },
        { $set: { isAvailable: secondDoctor.isAvailable, unavailabilityReason: secondDoctor.unavailabilityReason || '' } }
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
