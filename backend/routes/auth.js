const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId, getCol } = require('../db/connection');

const SECRET = process.env.JWT_SECRET || 'waitwise_secret_key_2024';

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register — patient registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, age, gender } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const users = getCol('users');
    const doctors = getCol('doctors');
    const lowerEmail = email.toLowerCase().trim();

    const existsUser   = await users.findOne({ email: lowerEmail });
    const existsDoctor = await doctors.findOne({ email: lowerEmail });
    if (existsUser || existsDoctor)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    await users.insertOne({
      name: name.trim(),
      email: lowerEmail,
      password: hashed,
      role: 'patient',
      phone: phone ? phone.trim() : '',
      age: age ? Number(age) : null,
      gender: gender || '',
      notificationPreferences: { email: false, sms: false },
      createdAt: new Date()
    });

    res.status(201).json({ success: true, message: 'Registration successful. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login — separate / unified login for patient, doctor, and admin
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const lowerEmail = email.toLowerCase().trim();
    const users   = getCol('users');
    const doctors = getCol('doctors');

    let doc = null;
    let actualRole = null;

    if (role === 'doctor') {
      doc = await doctors.findOne({ email: lowerEmail });
      if (doc) actualRole = 'doctor';
    } else if (role === 'admin') {
      doc = await users.findOne({ email: lowerEmail, role: 'admin' });
      if (doc) actualRole = 'admin';
    } else if (role === 'patient') {
      doc = await users.findOne({ email: lowerEmail, role: 'patient' });
      if (doc) actualRole = 'patient';
    }

    // Graceful role resolution if not matched with provided role tab
    if (!doc) {
      const docDoctor = await doctors.findOne({ email: lowerEmail });
      if (docDoctor) {
        doc = docDoctor;
        actualRole = 'doctor';
      } else {
        const docUser = await users.findOne({ email: lowerEmail });
        if (docUser) {
          doc = docUser;
          actualRole = docUser.role;
        }
      }
    }

    if (!doc) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (actualRole === 'doctor' && doc.retired) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const ok = await bcrypt.compare(password, doc.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken({
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      role: actualRole
    });

    const user = {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: actualRole
    };

    if (actualRole === 'doctor') {
      user.specialization = doc.specialization;
      user.consultationTime = doc.consultationTime;
      user.isAvailable = doc.isAvailable;
      user.unavailabilityReason = doc.unavailabilityReason;
    }

    res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// GET /api/auth/me
const { authenticate } = require('../middleware/auth');
router.get('/me', authenticate, async (req, res) => {
  try {
    let doc = null;
    if (req.user.role === 'doctor') {
      try {
        doc = await getCol('doctors').findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } });
      } catch (e) {
        doc = await getCol('doctors').findOne({ _id: req.user.id }, { projection: { password: 0 } });
      }
    } else {
      try {
        doc = await getCol('users').findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } });
      } catch (e) {
        doc = await getCol('users').findOne({ _id: req.user.id }, { projection: { password: 0 } });
      }
    }
    if (!doc) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: { ...doc, role: req.user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
