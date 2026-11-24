const app = require('./backend/server');
const { connectDB, getCol } = require('./backend/db/connection');
const assert = require('assert');
const { Readable, Writable } = require('stream');

function mockRequest(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const requestHeaders = { 'content-type': 'application/json', ...headers };
    const bodyText = body ? JSON.stringify(body) : '';
    if (bodyText) requestHeaders['content-length'] = Buffer.byteLength(bodyText);

    let responseText = '';
    const req = new Readable();
    req.push(bodyText || null);
    req.push(null);
    req.method = method;
    req.url = url;
    req.headers = requestHeaders;

    const res = new Writable();
    res.statusCode = 200;
    res.setHeader = () => {};
    res.getHeader = () => undefined;
    res._write = (chunk, encoding, next) => {
      responseText += chunk.toString();
      next();
    };
    res.writeHead = statusCode => {
      res.statusCode = statusCode;
    };
    res.end = chunk => {
      if (chunk) responseText += chunk.toString();
      try {
        resolve({ statusCode: res.statusCode, body: JSON.parse(responseText) });
      } catch (err) {
        reject(err);
      }
    };

    app.handle(req, res, err => {
      if (err) reject(err);
      else resolve({ statusCode: 404, body: null });
    });
  });
}

async function verifyAdminRegistration() {
  const email = `waitwise-admin-test-${Date.now()}@example.com`;
  const users = getCol('users');

  try {
    const login = await mockRequest('POST', '/api/auth/login', {
      email: 'admin@waitwise.com',
      password: 'admin123',
      role: 'admin'
    });
    assert.strictEqual(login.statusCode, 200);
    const authorization = { authorization: `Bearer ${login.body.token}` };

    const unauthorized = await mockRequest('POST', '/api/admin/register-admin', {
      name: 'Unauthorized Admin',
      email,
      password: 'password123'
    });
    assert.strictEqual(unauthorized.statusCode, 401);

    const registration = await mockRequest('POST', '/api/admin/register-admin', {
      name: 'Additional Administrator',
      email,
      password: 'password123'
    }, authorization);
    assert.strictEqual(registration.statusCode, 201);

    const savedAdmin = await users.findOne({ email });
    assert(savedAdmin);
    assert.strictEqual(savedAdmin.name, 'Additional Administrator');
    assert.strictEqual(savedAdmin.role, 'admin');
    assert.notStrictEqual(savedAdmin.password, 'password123');

    const newAdminLogin = await mockRequest('POST', '/api/auth/login', {
      email,
      password: 'password123',
      role: 'admin'
    });
    assert.strictEqual(newAdminLogin.statusCode, 200);
    assert.strictEqual(newAdminLogin.body.user.role, 'admin');

    const duplicate = await mockRequest('POST', '/api/admin/register-admin', {
      name: 'Duplicate Administrator',
      email,
      password: 'password123'
    }, authorization);
    assert.strictEqual(duplicate.statusCode, 409);

    console.log('Administrator registration persistence tests passed.');
  } finally {
    await users.deleteMany({ email });
  }
}

connectDB()
  .then(verifyAdminRegistration)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Administrator registration test failed:', err);
    process.exit(1);
  });
