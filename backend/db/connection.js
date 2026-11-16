const { MongoClient, ObjectId } = require('mongodb');
const { LocalDB } = require('./localStore');
const { seedInitialData } = require('./seedData');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/waitwise';
let client = null;
let db = null;
let isLocalFallback = false;

async function connectDB() {
  if (db) return db;

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    await client.connect();
    db = client.db('waitwise');
    console.log('✓ Connected to MongoDB on port 27017 (waitwise db)');
  } catch (err) {
    console.warn('! MongoDB connection on port 27017 unavailable (' + err.message + ').');
    console.log('✓ Activating WaitWise resilient database engine for seamless operation.');
    db = new LocalDB();
    isLocalFallback = true;
  }

  // Seed default accounts and the fixed two-doctor psychiatry clinic.
  await seedInitialData(getCol);

  return db;
}

function getDB() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

function getCol(name) {
  return getDB().collection(name);
}

module.exports = { connectDB, getDB, getCol, ObjectId, isLocalFallback: () => isLocalFallback };
