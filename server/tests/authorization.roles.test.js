const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { signJwt } = require('../utils/jwt');

const sign = (id, role) => signJwt({ id: String(id), role }, process.env.JWT_SECRET || 'testsecret');

describe('Role authorization checks', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Admin.deleteMany({})]);
  });

  test('user cannot access NGO-only routes', async () => {
    const user = await User.create({
      name: 'Simple User',
      email: 'simple.user@example.com',
      password: 'pass1234',
      gender: 'female',
      phoneno: '9000002001',
      location: 'Indiranagar',
    });

    const userToken = sign(user._id, 'user');

    const ngoRouteRes = await request(app)
      .get('/api/donations/available-ngo')
      .set('Authorization', `Bearer ${userToken}`);

    expect(ngoRouteRes.status).toBe(403);
  });

  test('NGO alias auth routes work and admin alias remains compatible', async () => {
    const payload = {
      name: 'Compat NGO',
      email: 'compat.ngo@example.com',
      password: 'pass1234',
      phoneno: '9000002002',
      address: 'NGO Address 1',
      location: 'Koramangala',
    };

    const ngoRegister = await request(app).post('/api/ngo/auth/register').send(payload);
    expect(ngoRegister.status).toBe(201);
    expect(ngoRegister.body.ngo).toBeTruthy();
    expect(ngoRegister.body.admin).toBeTruthy();

    const adminLoginCompat = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: payload.email, password: payload.password });

    expect(adminLoginCompat.status).toBe(200);
    expect(adminLoginCompat.body.token).toBeTruthy();
  });
});
