const { MongoClient, ObjectId } = require('mongodb');
const { seedInitialData } = require('./seedData');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/waitwise';
let client = null;
let db = null;

async function connectDB() {
  if (db) return db;

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000
  });

  try {
    await client.connect();
    db = client.db('waitwise');
    console.log('✓ Connected to MongoDB (waitwise database)');
  } catch (err) {
    await client.close().catch(closeError => {
      console.error('Failed to close MongoDB client after connection error:', closeError.message);
    });
    client = null;
    throw new Error(`Unable to connect to MongoDB: ${err.message}`, { cause: err });
  }

  // Seed default accounts and the fixed two-doctor psychiatry clinic.
  await seedInitialData(getCol);
  await getCol('feedback').createIndex({ appointmentId: 1 }, { unique: true });

  return db;
}

function getDB() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

function getCol(name) {
  return getDB().collection(name);
}

module.exports = { connectDB, getDB, getCol, ObjectId };
