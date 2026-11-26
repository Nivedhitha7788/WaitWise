# 🏥 WaitWise — Hospital Queue Management System

> **Zero-Wait Physical Entry Queue Management for Outpatient (OP) Hospital Consultations**  
> WaitWise eliminates physical waiting room congestion by allowing patients to queue digitally from home, track their token live, and arrive at the hospital only when their turn arrives.

---

## 🌟 Key Architecture & Highlights

- **Abstract & Minimalist Interface:** Clean, focused UI without information clutter.
- **Strictly OP (Outpatient) Consultations:** Emergency cases are explicitly guided to the Emergency & Trauma Ward.
- **Psychiatry Clinic:** The clinic has exactly two active doctors, both configured for General Psychiatry.
- **Fixed Appointment Sessions & Sunday Exclusion:** Monday–Saturday appointments use FN (forenoon) and AN (afternoon) sessions, with six fixed one-hour appointments per doctor per day. Sundays are clinic holidays and are excluded from the rolling booking window. Past same-day appointments are hidden and rejected using the clinic's Asia/Kolkata (IST) time.
- **Session-Wise Cascading Doctor Booking:** Patients book Dr. Priya Patel first for each session (FN / AN). Dr. Rajesh Sharma's slots open up on a per-session basis: when Priya's three FN slots fill, Rajesh's three FN slots unlock; similarly, Priya's AN slots must fill completely before Rajesh's AN slots unlock.
- **Patient Live Waiting Board Filtering:** When a patient with active appointments views the live queue board, the display filters automatically to show only their appointed doctor's queue status.
- **Admin IST Clock & Date-Wise Schedule:** The administrator dashboard features a live IST clock and date-filtered schedule controls to inspect appointments for any selected date.
- **Multilingual Interface:** Use the language selector to switch between English, Tamil, and Hindi; the choice is saved in the browser and shared across pages.
- **Contact & Patient Feedback:** Visitors can send contact requests saved in MongoDB, and patients can rate and comment on completed consultations.
- **Real-Time Digital Token Lifecycle:** 
  - Token generated on slot reservation.
  - Frequent live tracking (auto-updates every 10 seconds).
  - Separate queue-movement in-app and browser notifications when the patient's position advances, plus Web Audio & Browser Notification chimes when the user's turn arrives.
  - Automatic queue advancement whenever an administrator completes a consultation.
- **Administrator-Controlled Operations:** Administrators manage appointment queue status and doctor availability. Doctors can sign in to view their appointment schedule only.
- **MongoDB Persistence:** Patient registrations, doctor identities, contact requests, and feedback are stored in the shared `waitwise` database. Each doctor has a separate `waitwise_doctor_<id-hash>` database for their profile and appointments. On startup, existing shared appointment records are copied into the appropriate doctor database without deleting the source records. The server will not start if MongoDB is unavailable, preventing data from being silently written to a different store.

### MongoDB Data

- **Users:** Patient and admin profile fields, role, and a hashed password. The patient registration page creates patient accounts; additional admin accounts can only be created by an authenticated admin.
- **Doctors:** Name, email, hashed password, specialization, consultation duration, weekly availability slots, current availability and reason, registration metadata, and creation time.
- **Appointments (doctor-specific databases):** Patient and doctor IDs, appointment date, session and slot, token and queue position, 60-minute consultation duration, status, consultation start/completion timestamps, booking timestamp, and consultation notes.

---

## 👥 User Roles & Access

### 1. 🧑‍⚕️ Patient Interface
- **Home Navigation:** Simple, uncluttered landing page with single-click navigation to Register or Login.
- **Appointment Booking:** Select a General Psychiatry doctor and one of the fixed one-hour consultation times on a date in the rolling three-day booking window, which opens three days ahead.
- **Queue Status:** Future appointments appear as scheduled and move into the waiting queue on their appointment date.
- **Digital Token Generation:** Instant issuance of a Token Number and initial queue position.
- **Frequent Token Tracking:** Live visual progress bar, real-time patients ahead countdown, current room occupant, and audio/banner alerts when turn arrives.
- **Queue Auto-Update:** As doctors finish with patients, the queue automatically advances.
- **Visit Feedback:** Patients can submit one 1–5 star rating and comment after a visit is marked completed.

### Contact
- Visit `/pages/contact.html` for the clinic contact details and public contact form.
- Contact submissions are stored in the `contactMessages` collection.
- Patient ratings and comments are stored in the `feedback` collection and are linked to the completed appointment.

### 2. 👨‍⚕️ Doctor Interface
- **Schedule View:** Doctors can sign in directly (`/pages/login.html?role=doctor`) to view their booked OP appointments by date.
- **Read-Only Access:** Appointment status, clinical notes, and doctor availability are managed by administrators.
- **Strict Policy:** Only OP consultations are handled.

### 3. 🔧 Admin Interface
- **Overall System Dashboard:** Real-time counters for Total Patients, Registered Doctors (2/2), Today's Bookings, Waiting Patients, In-Consultation, and Completed Consultations.
- **Admin Registration:** Signed-in administrators can create additional admin accounts from the overview dashboard. Public admin self-registration is not allowed.
- **Doctor Registration (Strict Max 2):** Admin can register doctors up to the two-doctor clinic limit. New accounts automatically use General Psychiatry and the fixed clinic schedule.
- **Live Doctors Snapshot:** View today's queue load and availability across the two clinic doctors.
- **Appointments Directory:** Searchable table of all patient bookings, slots, token numbers, and status.
- **Queue Controls:** Administrators can call patients in, mark no-shows, complete consultations, record optional notes, and update doctor availability.

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

---

## 🛠️ Deployment & Environment Configuration

### Required Environment Variables
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | HTTP listening port for Express backend. |
| `MONGO_URI` | `mongodb://localhost:27017/waitwise` | MongoDB database connection URI. |
| `JWT_SECRET` | `waitwise_jwt_secret_key_2024` | Secret string for signing and verifying JSON Web Tokens. |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`). |

### Running in Production
```bash
# Set production environment variables
export NODE_ENV=production
export MONGO_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/waitwise?retryWrites=true&w=majority"
export JWT_SECRET="your_secure_random_jwt_secret"
export PORT=5000

# Start server with production process manager (e.g., PM2 or systemd)
npm start
```

### Health Check Endpoint
- `GET /api/health` returns `200 OK` with status and timestamp when the service is active.

### In-Browser Turn Alerts
The patient portal uses the browser's **Web Notifications API** for desktop alerts and **Web Audio API** for the turn chime. In the patient portal, click **Enable Browser Alerts + Sound** and allow notifications when prompted. These browser APIs require no provider accounts, API keys, email, or phone number. Alerts are generated while the patient is signed in and actively tracking a token in the website.
