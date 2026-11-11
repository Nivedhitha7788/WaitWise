const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

class ObjectIdMock {
  constructor(id) {
    this.id = id ? String(id) : generateId();
  }
  toString() {
    return this.id;
  }
  toJSON() {
    return this.id;
  }
  equals(other) {
    if (!other) return false;
    return this.toString() === other.toString();
  }
}

function matchesCondition(actual, condition) {
  if (condition instanceof Date) {
    const actDate = actual instanceof Date ? actual : new Date(actual);
    return actDate.getTime() === condition.getTime();
  }
  if (condition && typeof condition === 'object' && !(condition instanceof ObjectIdMock)) {
    for (const op of Object.keys(condition)) {
      const val = condition[op];
      if (op === '$ne') {
        if (actual === val) return false;
      } else if (op === '$gte') {
        const actVal = (actual instanceof Date || typeof actual === 'string') ? new Date(actual).getTime() : Number(actual);
        const targetVal = (val instanceof Date || typeof val === 'string') ? new Date(val).getTime() : Number(val);
        if (actVal < targetVal) return false;
      } else if (op === '$lte') {
        const actVal = (actual instanceof Date || typeof actual === 'string') ? new Date(actual).getTime() : Number(actual);
        const targetVal = (val instanceof Date || typeof val === 'string') ? new Date(val).getTime() : Number(val);
        if (actVal > targetVal) return false;
      } else if (op === '$lt') {
        const actVal = Number(actual);
        const targetVal = Number(val);
        if (actVal >= targetVal) return false;
      } else if (op === '$gt') {
        const actVal = Number(actual);
        const targetVal = Number(val);
        if (actVal <= targetVal) return false;
      }
    }
    return true;
  }
  if (actual instanceof ObjectIdMock || condition instanceof ObjectIdMock) {
    return String(actual) === String(condition);
  }
  return actual === condition;
}

function matchDoc(doc, query = {}) {
  for (const key of Object.keys(query)) {
    const cond = query[key];
    const actual = doc[key];
    if (!matchesCondition(actual, cond)) return false;
  }
  return true;
}

class LocalCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.docs = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        this.docs = JSON.parse(data);
      } else {
        this.docs = [];
        this.save();
      }
    } catch (e) {
      this.docs = [];
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.docs, null, 2), 'utf8');
    } catch (e) {
      console.error(`Failed to save ${this.name}:`, e.message);
    }
  }

  async insertOne(doc) {
    const item = { ...doc };
    if (!item._id) item._id = new ObjectIdMock();
    else if (!(item._id instanceof ObjectIdMock)) item._id = new ObjectIdMock(item._id);
    this.docs.push(item);
    this.save();
    return { insertedId: item._id };
  }

  async findOne(query = {}, options = {}) {
    this.load();
    const found = this.docs.find(d => matchDoc(d, query));
    if (!found) return null;
    return this.applyProjection(found, options.projection);
  }

  find(query = {}, options = {}) {
    this.load();
    let results = this.docs.filter(d => matchDoc(d, query));
    
    return {
      sort: (sortObj = {}) => {
        const entries = Object.entries(sortObj);
        if (entries.length > 0) {
          results.sort((a, b) => {
            for (const [k, dir] of entries) {
              const valA = a[k] instanceof Date ? a[k].getTime() : a[k];
              const valB = b[k] instanceof Date ? b[k].getTime() : b[k];
              if (valA < valB) return dir > 0 ? -1 : 1;
              if (valA > valB) return dir > 0 ? 1 : -1;
            }
            return 0;
          });
        }
        return {
          toArray: async () => results.map(r => this.applyProjection(r, options.projection))
        };
      },
      toArray: async () => results.map(r => this.applyProjection(r, options.projection))
    };
  }

  async countDocuments(query = {}) {
    this.load();
    if (!query || Object.keys(query).length === 0) return this.docs.length;
    return this.docs.filter(d => matchDoc(d, query)).length;
  }

  async updateOne(query = {}, update = {}) {
    this.load();
    const idx = this.docs.findIndex(d => matchDoc(d, query));
    if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };

    if (update.$set) {
      this.docs[idx] = { ...this.docs[idx], ...update.$set };
    }
    this.save();
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteMany(query = {}) {
    this.load();
    const initial = this.docs.length;
    this.docs = this.docs.filter(d => !matchDoc(d, query));
    this.save();
    return { deletedCount: initial - this.docs.length };
  }

  applyProjection(doc, projection) {
    if (!projection) return { ...doc };
    const res = { ...doc };
    for (const [k, v] of Object.entries(projection)) {
      if (v === 0) delete res[k];
    }
    return res;
  }
}

class LocalDB {
  constructor() {
    this.collections = {};
  }
  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new LocalCollection(name);
    }
    return this.collections[name];
  }
}

module.exports = { LocalDB, ObjectIdMock };

