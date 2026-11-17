const { ObjectId } = require('mongodb');
const { getCol, getDoctorCol } = require('../db/connection');

async function findAppointmentsAcrossDoctors(filter = {}) {
  const doctors = await getCol('doctors').find({}, { projection: { _id: 1 } }).toArray();
  const groupedAppointments = await Promise.all(doctors.map(doctor =>
    getDoctorCol(doctor._id, 'appointments').find(filter).toArray()
  ));
  return groupedAppointments.flat();
}

async function findAppointmentAcrossDoctors(appointmentId, filter = {}) {
  const doctors = await getCol('doctors').find({}, { projection: { _id: 1 } }).toArray();
  const id = String(appointmentId);
  const objectId = ObjectId.isValid(id) ? new ObjectId(id) : null;

  for (const doctor of doctors) {
    const appointments = getDoctorCol(doctor._id, 'appointments');
    let appointment = objectId
      ? await appointments.findOne({ ...filter, _id: objectId })
      : null;
    if (!appointment) {
      appointment = await appointments.findOne({ ...filter, _id: id });
    }
    if (appointment) return appointment;
  }
  return null;
}

module.exports = { findAppointmentsAcrossDoctors, findAppointmentAcrossDoctors };
