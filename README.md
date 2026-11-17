# 🏥 WaitWise — Hospital Queue Management System

> **Zero-Wait Physical Entry Queue Management for Outpatient (OP) Hospital Consultations**  
> WaitWise eliminates physical waiting room congestion by allowing patients to queue digitally from home, track their token live, and arrive at the hospital only when their turn arrives.

---

## 🌟 Key Architecture & Highlights

- **Abstract & Minimalist Interface:** Clean, focused UI without information clutter.
- **Strictly OP (Outpatient) Consultations:** Emergency cases are explicitly guided to the Emergency & Trauma Ward.
- **Psychiatry Clinic:** The clinic has exactly two active doctors, both configured for General Psychiatry.
- **Fixed Appointment Sessions:** Monday–Saturday appointments use FN (forenoon) and AN (afternoon) sessions, with six fixed one-hour appointments per doctor per day. Past same-day appointments are hidden and rejected using the clinic's Asia/Kolkata time.
- **Multilingual Interface:** Use the language selector to switch between English, Tamil, and Hindi; the choice is saved in the browser and shared across pages.
- **Contact & Patient Feedback:** Visitors can send contact requests saved in MongoDB, and patients can rate and comment on completed consultations.
- **Real-Time Digital Token Lifecycle:** 
  - Token generated on slot reservation.
  - Frequent live tracking (auto-updates every 10 seconds).
  - Web Audio & Browser Notification chimes when the user's turn arrives (`#turnAlertBanner`).
  - Automatic queue advancement whenever a doctor marks past consultations as completed.
- **Ward Visits Status:** Doctors can mark themselves unavailable with reasons such as *"Visiting existing patients in ward (In-Patient rounds)"*.
- **MongoDB Persistence:** Patient registrations, appointments, doctor availability, consultation notes, and system data are stored in MongoDB. The server will not start if MongoDB is unavailable, preventing data from being silently written to a different store.

### MongoDB Data

- **Users:** Patient profile fields (`name`, `email`, `phone`, `age`, `gender`), role, and a hashed password. The seeded admin account stores its name, email, role, phone, and hashed password.
- **Doctors:** Name, email, hashed password, specialization, consultation duration, weekly availability slots, current availability and reason, registration metadata, and creation time.
- **Appointments:** Patient and doctor IDs, appointment date, session and slot, token and queue position, estimated wait, status, booking/completion timestamps, and consultation notes.

---

## 👥 User Roles & Access

### 1. 🧑‍⚕️ Patient Interface
- **Home Navigation:** Simple, uncluttered landing page with single-click navigation to Register or Login.
- **Appointment Booking:** Select a General Psychiatry doctor, date, session, and one of the fixed one-hour consultation times.
- **Digital Token Generation:** Instant issuance of Token Number with initial queue position and estimated wait time.
- **Frequent Token Tracking:** Live visual progress bar, real-time patients ahead countdown, current room occupant, and audio/banner alerts when turn arrives.
- **Queue Auto-Update:** As doctors finish with patients, the queue automatically advances.
- **Visit Feedback:** Patients can submit one 1–5 star rating and comment after a visit is marked completed.

### Contact
- Visit `/pages/contact.html` for the clinic contact details and public contact form.
- Contact submissions are stored in the `contactMessages` collection.
- Patient ratings and comments are stored in the `feedback` collection and are linked to the completed appointment.

### 2. 👨‍⚕️ Doctor Interface
- **Direct Login:** Accessible directly from the homepage and navbar (`/pages/login.html?role=doctor`).
- **OP Consultation Queue:** Real-time view of today's OP patients sorted by token number.
- **Consultation Room Controls:**
  - *"Call In Room"* — transitions patient to `in-consultation`.
  - *"Complete Consultation"* — records optional clinical notes, marks consultation as completed, and **automatically recalculates queue positions** for all waiting patients.
- **Availability Management:** Toggle OP availability with preset reasons such as *"Visiting existing patients in ward (In-Patient rounds)"*.
- **Strict Policy:** Prominent warning that only OP consultations are handled.

### 3. 🔧 Admin Interface
- **Overall System Dashboard:** Real-time counters for Total Patients, Registered Doctors (2/2), Today's Bookings, Waiting Patients, In-Consultation, and Completed Consultations.
- **Doctor Registration (Strict Max 2):** Admin can register doctors up to the two-doctor clinic limit. New accounts automatically use General Psychiatry and the fixed clinic schedule.
- **Live Doctors Snapshot:** View today's queue load and availability across the two clinic doctors.
- **Appointments Directory:** Searchable table of all patient bookings, slots, token numbers, and status.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@waitwise.com` | `admin123` | Hospital Administrator |
| **Doctor 1** | `dr.sharma@waitwise.com` | `doctor123` | Dr. Rajesh Sharma — General Psychiatry |
| **Doctor 2** | `dr.patel@waitwise.com` | `doctor123` | Dr. Priya Patel — General Psychiatry |
| **Patient** | `patient@waitwise.com` | `patient123` | John Doe |

*(New patients can also register directly via the Register page. Existing databases migrate the two default doctor accounts and retire the former extra seeded accounts without deleting their appointment history.)*

### Clinic Session Times

| Session | Appointment slots |
|---|---|
| FN (forenoon) | 9:00–10:00, 10:15–11:15, 11:30–12:30 |
| AN (afternoon) | 13:30–14:30, 14:45–15:45, 16:00–17:00 |

---

## 🚀 How to Run the Application

### 1. Start the Server
Start MongoDB locally, or set `MONGO_URI` to your MongoDB connection string. The default is `mongodb://localhost:27017/waitwise`.

From the project root:
```bash
npm start
```
Or from the `backend` directory:
```bash
cd backend
node server.js
```
The server will start on:
```
http://localhost:5000
```

Open your browser and navigate to `http://localhost:5000` to interact with WaitWise.

### 2. Run Automated Verification Tests
Run the comprehensive end-to-end test suite:
```bash
npm test
```
The in-process test suite covers authentication, MongoDB persistence for all roles and appointments, the two-doctor limit, fixed session slots, invalid-slot rejection, token generation, live tracking, and queue auto-updates.
