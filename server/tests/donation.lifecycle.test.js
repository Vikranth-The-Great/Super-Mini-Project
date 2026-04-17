const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const Admin = require('../models/Admin');
const DeliveryPerson = require('../models/DeliveryPerson');
const FoodDonation = require('../models/FoodDonation');
const Notification = require('../models/Notification');
const { signJwt } = require('../utils/jwt');

const sign = (id, role) => signJwt({ id: String(id), role }, process.env.JWT_SECRET || 'testsecret');

describe('Donation lifecycle', () => {
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
      User.deleteMany({}),
      Admin.deleteMany({}),
      DeliveryPerson.deleteMany({}),
      FoodDonation.deleteMany({}),
      Notification.deleteMany({}),
    ]);
  });

  test('user -> ngo claim -> delivery take -> delivered creates notifications', async () => {
    const user = await User.create({
      name: 'Donor User',
      email: 'donor@example.com',
      password: 'pass1234',
      gender: 'male',
      phoneno: '9000001001',
      location: 'Indiranagar',
    });

    const ngo = await Admin.create({
      name: 'NGO Partner',
      email: 'ngo@example.com',
      password: 'pass1234',
      phoneno: '9000001002',
      address: 'Some NGO address',
      location: 'Indiranagar',
    });

    const delivery = await DeliveryPerson.create({
      name: 'Delivery One',
      email: 'delivery@example.com',
      password: 'pass1234',
      phoneno: '9000001003',
      city: 'Bengaluru',
    });

    const userToken = sign(user._id, 'user');
    const ngoToken = sign(ngo._id, 'admin');
    const deliveryToken = sign(delivery._id, 'delivery');

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const yyyyMmDd = tomorrow.toISOString().slice(0, 10);

    const createRes = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        food: 'Rice',
        type: 'veg',
        category: 'cooked-food',
        quantity: '10 plates',
        expiryDate: yyyyMmDd,
        expiryTime: '23:59',
        location: 'Indiranagar',
        address: '12, Main Road, Indiranagar',
        phoneno: '9876543210',
        latitude: 12.9716,
        longitude: 77.5946,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.latitude).toBeCloseTo(12.9716, 4);
    expect(createRes.body.longitude).toBeCloseTo(77.5946, 4);

    const donationId = createRes.body.id;

    const claimRes = await request(app)
      .put(`/api/donations/${donationId}/assign`)
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({});
    expect(claimRes.status).toBe(200);

    const takeRes = await request(app)
      .put(`/api/donations/${donationId}/take`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({});
    expect(takeRes.status).toBe(200);

    const placeRes = await request(app)
      .put(`/api/donations/${donationId}/place`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({});
    expect(placeRes.status).toBe(200);

    const notificationRes = await request(app)
      .get('/api/notifications/my')
      .set('Authorization', `Bearer ${userToken}`);

    expect(notificationRes.status).toBe(200);
    expect(notificationRes.body).toHaveLength(3);
    expect(notificationRes.body.map((n) => n.type).sort()).toEqual(['claimed', 'delivered', 'picked'].sort());

    const trackingRes = await request(app)
      .get('/api/donations/ngo-tracking')
      .set('Authorization', `Bearer ${ngoToken}`);

    expect(trackingRes.status).toBe(200);
    expect(trackingRes.body).toHaveLength(1);
    expect(trackingRes.body[0].status).toBe('Delivered');
  });

  test('preview endpoint returns top 3 ngo recommendations with score breakdown', async () => {
    const user = await User.create({
      name: 'Preview Donor',
      email: 'preview-donor@example.com',
      password: 'pass1234',
      gender: 'female',
      phoneno: '9000001004',
      location: 'Indiranagar',
    });

    await Admin.create({
      name: 'Near NGO',
      email: 'near-ngo@example.com',
      password: 'pass1234',
      phoneno: '9000001005',
      location: 'Indiranagar',
      address: 'Near office (Lat: 12.97160, Lng: 77.59460)',
    });
    await Admin.create({
      name: 'Second NGO',
      email: 'second-ngo@example.com',
      password: 'pass1234',
      phoneno: '9000001006',
      location: 'Indiranagar',
      address: 'Second office (Lat: 12.98160, Lng: 77.60460)',
    });
    await Admin.create({
      name: 'Far NGO',
      email: 'far-ngo@example.com',
      password: 'pass1234',
      phoneno: '9000001007',
      location: 'Whitefield',
      address: 'Far office (Lat: 13.10000, Lng: 77.80000)',
    });
    await Admin.create({
      name: 'Extra NGO',
      email: 'extra-ngo@example.com',
      password: 'pass1234',
      phoneno: '9000001008',
      location: 'Koramangala',
      address: 'Extra office (Lat: 12.94000, Lng: 77.62000)',
    });

    const userToken = sign(user._id, 'user');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const yyyyMmDd = tomorrow.toISOString().slice(0, 10);

    const previewRes = await request(app)
      .post('/api/donations/recommendations/preview')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        expiryDate: yyyyMmDd,
        expiryTime: '22:00',
        location: 'Indiranagar',
        latitude: 12.9716,
        longitude: 77.5946,
      });

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.recommendations).toHaveLength(3);
    expect(previewRes.body.topRecommendation).toBeTruthy();
    expect(previewRes.body.recommendations[0].scoreBreakdown).toBeTruthy();
    expect(typeof previewRes.body.recommendations[0].scoreBreakdown.distanceWeight).toBe('number');
    expect(typeof previewRes.body.recommendations[0].scoreBreakdown.expiryUrgency).toBe('number');
    expect(typeof previewRes.body.recommendations[0].scoreBreakdown.ngoLoad).toBe('number');
    expect(typeof previewRes.body.recommendations[0].score).toBe('number');
  });

  test('ngo available donations include dynamic priority and urgent-first ordering', async () => {
    const ngo = await Admin.create({
      name: 'Priority NGO',
      email: 'priority-ngo@example.com',
      password: 'pass1234',
      phoneno: '9000001009',
      address: 'Priority office',
      location: 'Indiranagar',
    });

    const ngoToken = sign(ngo._id, 'admin');
    const donorEmail = 'prio-donor@example.com';

    const addHours = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const toDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const toTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const high = addHours(1.5);
    const medium = addHours(4);
    const low = addHours(9);

    await FoodDonation.create({
      donorName: 'Donor High',
      donorEmail,
      phoneno: '9999999991',
      food: 'Rice',
      type: 'veg',
      category: 'cooked-food',
      quantity: '5 packs',
      expiryDate: toDate(high),
      expiryTime: toTime(high),
      location: 'Indiranagar',
      address: 'Address H',
    });

    await FoodDonation.create({
      donorName: 'Donor Medium',
      donorEmail,
      phoneno: '9999999992',
      food: 'Dal',
      type: 'veg',
      category: 'cooked-food',
      quantity: '4 packs',
      expiryDate: toDate(medium),
      expiryTime: toTime(medium),
      location: 'Indiranagar',
      address: 'Address M',
    });

    await FoodDonation.create({
      donorName: 'Donor Low',
      donorEmail,
      phoneno: '9999999993',
      food: 'Chapati',
      type: 'veg',
      category: 'cooked-food',
      quantity: '8 packs',
      expiryDate: toDate(low),
      expiryTime: toTime(low),
      location: 'Indiranagar',
      address: 'Address L',
    });

    const res = await request(app)
      .get('/api/donations/available-ngo')
      .set('Authorization', `Bearer ${ngoToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].priority).toBe('High');
    expect(res.body[1].priority).toBe('Medium');
    expect(res.body[2].priority).toBe('Low');
  });

  test('delivery optimized route returns nearest-order sequence for active orders', async () => {
    const ngo = await Admin.create({
      name: 'Route NGO',
      email: 'route-ngo@example.com',
      password: 'pass1234',
      phoneno: '9000001010',
      address: 'Route office',
      location: 'Indiranagar',
    });

    const delivery = await DeliveryPerson.create({
      name: 'Route Delivery',
      email: 'route-delivery@example.com',
      password: 'pass1234',
      phoneno: '9000001011',
      city: 'Bengaluru',
    });

    const deliveryToken = sign(delivery._id, 'delivery');
    const donorEmail = 'route-donor@example.com';

    const now = new Date();
    const addHours = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const toDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const toTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    await FoodDonation.create({
      donorName: 'Far Donor',
      donorEmail,
      phoneno: '9000000011',
      food: 'Rice',
      type: 'veg',
      category: 'cooked-food',
      quantity: '5 packs',
      expiryDate: toDate(addHours(10)),
      expiryTime: toTime(addHours(10)),
      location: 'Area F',
      address: 'Far Addr',
      latitude: 12.9900,
      longitude: 77.6500,
      assignedTo: ngo._id,
      deliveryBy: delivery._id,
    });

    await FoodDonation.create({
      donorName: 'Near Donor',
      donorEmail,
      phoneno: '9000000012',
      food: 'Dal',
      type: 'veg',
      category: 'cooked-food',
      quantity: '3 packs',
      expiryDate: toDate(addHours(10)),
      expiryTime: toTime(addHours(10)),
      location: 'Area N',
      address: 'Near Addr',
      latitude: 12.9719,
      longitude: 77.5950,
      assignedTo: ngo._id,
      deliveryBy: delivery._id,
    });

    await FoodDonation.create({
      donorName: 'No Coord Donor',
      donorEmail,
      phoneno: '9000000013',
      food: 'Beans',
      type: 'veg',
      category: 'raw-food',
      quantity: '2 packs',
      expiryDate: toDate(addHours(10)),
      expiryTime: toTime(addHours(10)),
      location: 'Area X',
      address: 'No Coord Addr',
      assignedTo: ngo._id,
      deliveryBy: delivery._id,
    });

    const res = await request(app)
      .get('/api/donations/my-deliveries/optimized-route?startLat=12.9716&startLng=77.5946')
      .set('Authorization', `Bearer ${deliveryToken}`);

    expect(res.status).toBe(200);
    expect(res.body.optimizedOrder).toHaveLength(2);
    expect(res.body.optimizedOrder[0].donorName).toBe('Near Donor');
    expect(res.body.optimizedOrder[0].sequence).toBe(1);
    expect(res.body.unroutableOrders).toHaveLength(1);
    expect(res.body.totalDistanceKm).toBeGreaterThan(0);
  });

  test('ngo and delivery can fetch persistent role notifications', async () => {
    const user = await User.create({
      name: 'Notify Donor',
      email: 'notify-donor@example.com',
      password: 'pass1234',
      gender: 'male',
      phoneno: '9000001012',
      location: 'Indiranagar',
    });

    const ngo = await Admin.create({
      name: 'Notify NGO',
      email: 'notify-ngo@example.com',
      password: 'pass1234',
      phoneno: '9000001013',
      address: 'NGO Notify Address',
      location: 'Indiranagar',
    });

    const delivery = await DeliveryPerson.create({
      name: 'Notify Delivery',
      email: 'notify-delivery@example.com',
      password: 'pass1234',
      phoneno: '9000001014',
      city: 'Bengaluru',
    });

    const userToken = sign(user._id, 'user');
    const ngoToken = sign(ngo._id, 'admin');
    const deliveryToken = sign(delivery._id, 'delivery');

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const yyyyMmDd = tomorrow.toISOString().slice(0, 10);

    const createRes = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        food: 'Rice',
        type: 'veg',
        category: 'cooked-food',
        quantity: '10 plates',
        expiryDate: yyyyMmDd,
        expiryTime: '23:59',
        location: 'Indiranagar',
        address: '12, Main Road, Indiranagar',
        phoneno: '9876543299',
        latitude: 12.9716,
        longitude: 77.5946,
      });
    expect(createRes.status).toBe(201);

    const donationId = createRes.body.id;

    const claimRes = await request(app)
      .put(`/api/donations/${donationId}/assign`)
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({});
    expect(claimRes.status).toBe(200);

    const takeRes = await request(app)
      .put(`/api/donations/${donationId}/take`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({});
    expect(takeRes.status).toBe(200);

    const ngoNotifications = await request(app)
      .get('/api/notifications/my')
      .set('Authorization', `Bearer ${ngoToken}`);
    expect(ngoNotifications.status).toBe(200);
    expect(ngoNotifications.body.some((n) => n.type === 'donation-created' || n.type === 'delivery-accepted')).toBe(true);

    const deliveryNotifications = await request(app)
      .get('/api/notifications/my')
      .set('Authorization', `Bearer ${deliveryToken}`);
    expect(deliveryNotifications.status).toBe(200);
    expect(deliveryNotifications.body.some((n) => n.type === 'donation-claimed')).toBe(true);
  });
});
