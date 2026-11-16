# 🏥 WaitWise — Hospital Queue Management System

> **Zero-Wait Physical Entry Queue Management for Outpatient (OP) Hospital Consultations**  
> WaitWise eliminates physical waiting room congestion by allowing patients to queue digitally from home, track their token live, and arrive at the hospital only when their turn arrives.

---

## 🌟 Key Architecture & Highlights

- **Abstract & Minimalist Interface:** Clean, focused UI without information clutter.
- **Strictly OP (Outpatient) Consultations:** Emergency cases are explicitly guided to the Emergency & Trauma Ward.
- **Strict 4-Doctor Hospital Capacity:** The system strictly maintains exactly 4 OP specialist doctors, with each connected to MongoDB.
- **Real-Time Digital Token Lifecycle:** 
  - Token generated on slot reservation.
  - Frequent live tracking (auto-updates every 10 seconds).
  - Web Audio & Browser Notification chimes when the user's turn arrives (`#turnAlertBanner`).
  - Automatic queue advancement whenever a doctor marks past consultations as completed.
- **Ward Visits Status:** Doctors can mark themselves unavailable with reasons such as *"Visiting existing patients in ward (In-Patient rounds)"*.
- **MongoDB Persistence:** Patient registrations, appointments, doctor availability, consultation notes, and system data are stored in MongoDB. The server will not start if MongoDB is unavailable, preventing data from being silently written to a different store.

---

## 👥 User Roles & Access

### 1. 🧑‍⚕️ Patient Interface
- **Home Navigation:** Simple, uncluttered landing page with single-click navigation to Register or Login.
- **OP Appointment Booking:** Select from available doctors, view consultation duration (e.g. 15 min), and select from dynamically generated time slots.
- **Digital Token Generation:** Instant issuance of Token Number with initial queue position and estimated wait time.
- **Frequent Token Tracking:** Live visual progress bar, real-time patients ahead countdown, current room occupant, and audio/banner alerts when turn arrives.
- **Queue Auto-Update:** As doctors finish with patients, the queue automatically advances.

### 2. 👨‍⚕️ Doctor Interface
- **Direct Login:** Accessible directly from the homepage and navbar (`/pages/login.html?role=doctor`).
- **OP Consultation Queue:** Real-time view of today's OP patients sorted by token number.
- **Consultation Room Controls:**
  - *"Call In Room"* — transitions patient to `in-consultation`.
  - *"Complete Consultation"* — records optional clinical notes, marks consultation as completed, and **automatically recalculates queue positions** for all waiting patients.
- **Availability Management:** Toggle OP availability with preset reasons such as *"Visiting existing patients in ward (In-Patient rounds)"*.
- **Strict Policy:** Prominent warning that only OP consultations are handled.

### 3. 🔧 Admin Interface
- **Overall System Dashboard:** Real-time counters for Total Patients, Registered Doctors (4/4), Today's Bookings, Waiting Patients, In-Consultation, and Completed Consultations.
- **Doctor Registration (Strict Max 4):** Admin can register new OP doctors with name, email, specialization, slot duration, and working days/hours. System strictly rejects attempts to register more than 4 doctors.
- **Live Doctors Snapshot:** View today's queue load and availability across all 4 doctors, with ability to toggle doctor availability and update ward visit status.
- **Appointments Directory:** Searchable table of all patient bookings, slots, token numbers, and status.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@waitwise.com` | `admin123` | Hospital Administrator |
| **Doctor 1** | `dr.sharma@waitwise.com` | `doctor123` | Dr. Rajesh Sharma — General Medicine (OP) [15 min] |
| **Doctor 2** | `dr.patel@waitwise.com` | `doctor123` | Dr. Priya Patel — Pediatrics (OP) [15 min] |
| **Doctor 3** | `dr.desai@waitwise.com` | `doctor123` | Dr. Anita Desai — Dermatology (OP) [20 min] *(Visiting ward)* |
| **Doctor 4** | `dr.rao@waitwise.com` | `doctor123` | Dr. Vikram Rao — Orthopedics (OP) [15 min] |
| **Patient** | `patient@waitwise.com` | `patient123` | John Doe |

*(New patients can also register directly via the Register page.)*

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
All 13 system test cases covering authentication, 4-doctor limits, token generation, live tracking, and queue auto-updates run in-process and will report test results.
