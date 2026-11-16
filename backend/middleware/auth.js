const jwt = require('jsonwebtoken');
const { getCol } = require('../db/connection');
const { ObjectId } = require('mongodb');

const SECRET = process.env.JWT_SECRET || 'waitwise_secret_key_2024';

// Core: verify token, attach req.user
async function authenticate(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { id, email, name, role }
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

function requireRole(role) {
  return [
    authenticate,
    (req, res, next) => {
      if (req.user.role !== role)
        return res.status(403).json({ success: false, message: `Access denied. ${role} only.` });
      next();
    }
  ];
}

const requireAdmin  = () => requireRole('admin');
const requireDoctor = () => [
  authenticate,
  async (req, res, next) => {
    if (req.user.role !== 'doctor')
      return res.status(403).json({ success: false, message: 'Access denied. doctor only.' });
    try {
      let doctor = null;
      try {
        doctor = await getCol('doctors').findOne({ _id: new ObjectId(req.user.id) });
      } catch (e) {
        doctor = await getCol('doctors').findOne({ _id: req.user.id });
      }
      if (!doctor || doctor.retired)
        return res.status(401).json({ success: false, message: 'Doctor account is no longer active.' });
      next();
    } catch (err) {
      next(err);
    }
  }
];
const requirePatient = () => requireRole('patient');

module.exports = { authenticate, requireAdmin, requireDoctor, requirePatient };

