const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const Admin = require('../models/Admin');
const FoodDonation = require('../models/FoodDonation');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { signJwt } = require('../utils/jwt');

const sign = (id, role) => signJwt({ id: String(id), role }, process.env.JWT_SECRET || 'testsecret');

describe('Analytics dashboard API', () => {
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
    await Promise.all([
      Admin.deleteMany({}),
      FoodDonation.deleteMany({}),
      User.deleteMany({}),
      Feedback.deleteMany({}),
    ]);
  });

  test('returns dashboard metrics and chart datasets for NGO analytics', async () => {
    const ngo = await Admin.create({
      name: 'Metrics NGO',
      email: 'metrics-ngo@example.com',
      password: 'pass1234',
      phoneno: '9000003001',
      address: 'Metrics office',
      location: 'Indiranagar',
    });

    const ngoToken = sign(ngo._id, 'admin');

    await FoodDonation.create({
      donorName: 'Donor A',
      donorEmail: 'a@example.com',
      phoneno: '9000000001',
      food: 'Rice',
      type: 'veg',
      category: 'cooked-food',
      quantity: '10 plates',
      expiryDate: '2099-12-30',
      expiryTime: '18:00',
      location: 'Indiranagar',
      address: 'Addr A',
      deliveredAt: new Date(),
    });

    await FoodDonation.create({
      donorName: 'Donor B',
      donorEmail: 'b@example.com',
      phoneno: '9000000002',
      food: 'Dal',
      type: 'veg',
      category: 'cooked-food',
      quantity: '8 plates',
      expiryDate: '2099-12-30',
      expiryTime: '19:00',
      location: 'Koramangala',
      address: 'Addr B',
    });

    await FoodDonation.create({
      donorName: 'Donor C',
      donorEmail: 'c@example.com',
      phoneno: '9000000003',
      food: 'Beans',
      type: 'veg',
      category: 'raw-food',
      quantity: '5 kg',
      expiryDate: '2099-12-31',
      expiryTime: '20:00',
      location: 'Whitefield',
      address: 'Addr C',
      deliveredAt: new Date(),
    });

    await FoodDonation.create({
      donorName: 'Donor D',
      donorEmail: 'd@example.com',
      phoneno: '9000000004',
      food: 'Soup',
      type: 'veg',
      category: 'cooked-food',
      quantity: '1000 g',
      expiryDate: '2099-12-31',
      expiryTime: '20:30',
      location: 'HSR Layout',
      address: 'Addr D',
    });

    const res = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${ngoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalDonations).toBe(4);
    expect(res.body.totalDeliveredOrders).toBe(2);
    expect(res.body.totalPendingOrders).toBe(2);
    expect(res.body.mostDonatedFoodCategory).toBeTruthy();
    expect(res.body.mostDonatedFoodCategory.category).toBe('cooked-food');

    expect(Array.isArray(res.body.donationsPerDay)).toBe(true);
    expect(Array.isArray(res.body.categoryDistribution)).toBe(true);
    expect(Array.isArray(res.body.deliverySuccessRate)).toBe(true);

    expect(res.body.categoryDistribution.find((x) => x.category === 'cooked-food')?.count).toBe(3);

    const firstRate = res.body.deliverySuccessRate[0];
    expect(firstRate).toBeTruthy();
    expect(firstRate.total).toBeGreaterThan(0);
    expect(typeof firstRate.rate).toBe('number');

    expect(res.body.environmentalImpact).toBeTruthy();
    expect(res.body.environmentalImpact.totalFoodSavedKg).toBe(9.5);
    expect(res.body.environmentalImpact.totalCo2PreventedKg).toBe(23.75);
    expect(res.body.environmentalImpact.mealsServedEquivalent).toBe(19);

    const impactRes = await request(app)
      .get('/api/analytics/environment-impact')
      .set('Authorization', `Bearer ${ngoToken}`);

    expect(impactRes.status).toBe(200);
    expect(impactRes.body.totalFoodSavedKg).toBe(9.5);
    expect(impactRes.body.totalCo2PreventedKg).toBe(23.75);
    expect(impactRes.body.mealsServedEquivalent).toBe(19);
  });
});
