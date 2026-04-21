const express = require('express');
const FoodDonation = require('../models/FoodDonation');
const Admin = require('../models/Admin');
const DeliveryPerson = require('../models/DeliveryPerson');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { emitNotification } = require('../socket');
const { protect, protectAdmin, protectDelivery } = require('../middleware/auth');
const { logAdminEvent } = require('../utils/adminActivity');

const router = express.Router();

const NGO_AVAILABLE_FIELDS =
  'donorName food category phoneno quantity location address latitude longitude createdAt expiryDate expiryTime';
const NGO_ASSIGNED_FIELDS = `${NGO_AVAILABLE_FIELDS} deliveryBy deliveredAt`;
const DELIVERY_AVAILABLE_FIELDS =
  'donorName phoneno location address latitude longitude createdAt expiryDate expiryTime assignedTo';
const DELIVERY_MY_FIELDS =
  'donorName phoneno location address latitude longitude createdAt expiryDate expiryTime assignedTo deliveredAt';
const USER_MY_FIELDS =
  'food type category quantity location address latitude longitude createdAt expiryDate expiryTime assignedTo deliveryBy deliveredAt';

const getDonationStatus = (donation) => {
  if (donation.status === 'Completed') return 'Completed';
  if (donation.deliveredAt) return 'Delivered';
  if (donation.deliveryBy) return 'In Transit';
  if (donation.assignedTo) return 'Assigned';
  return 'Posted';
};

const toNum = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const parseCoordinates = (payload) => {
  const latitude = toNum(payload.latitude);
  const longitude = toNum(payload.longitude);

  if (latitude !== null && (latitude < -90 || latitude > 90)) {
    return { error: 'Latitude must be between -90 and 90' };
  }
  if (longitude !== null && (longitude < -180 || longitude > 180)) {
    return { error: 'Longitude must be between -180 and 180' };
  }
  return { latitude, longitude };
};

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const trimText = (value) => String(value || '').trim();

const isValidPhone = (value) => /^\d{10}$/.test(String(value || '').trim());

const parsePositiveQuantity = (value) => {
  const text = trimText(value).toLowerCase();
  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const num = Number(match[1]);
  return Number.isFinite(num) && num > 0 ? num : null;
};

const normalizeQuantityText = (value) => {
  const amount = parsePositiveQuantity(value);
  if (!amount) return '';
  return Number.isInteger(amount) ? String(amount) : String(amount);
};

const notExpiredFilterExpr = (now = new Date()) => ({
  $expr: {
    $gt: [
      {
        $dateFromString: {
          dateString: {
            $concat: [
              { $dateToString: { format: '%Y-%m-%d', date: '$expiryDate' } },
              'T',
              '$expiryTime',
            ],
          },
        },
      },
      now,
    ],
  },
});

const extractLatLngFromText = (text) => {
  const val = String(text || '');
  const match = val.match(/Lat:\s*(-?\d+(?:\.\d+)?),\s*Lng:\s*(-?\d+(?:\.\d+)?)/i);
  if (!match) return { latitude: null, longitude: null };

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { latitude: null, longitude: null };
  }
  return { latitude, longitude };
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const estimateMealsFromQuantity = (quantityText) => {
  const raw = String(quantityText || '').trim().toLowerCase();
  const match = raw.match(/(\d+(?:\.\d+)?)/);
  const amount = match ? Number(match[1]) : 0;
  if (!Number.isFinite(amount) || amount <= 0) return 10;

  if (/(kg|kilogram)/.test(raw)) {
    return Math.max(1, Math.round(amount / 0.5));
  }
  if (/(gram|g\b)/.test(raw)) {
    return Math.max(1, Math.round((amount / 1000) / 0.5));
  }
  if (/(plate|meal|pack|piece|serving|box)/.test(raw)) {
    return Math.max(1, Math.round(amount));
  }

  return Math.max(1, Math.round(amount));
};

const buildDonationExpiryDateTime = (donationLike) =>
  new Date(`${new Date(donationLike.expiryDate).toISOString().split('T')[0]}T${donationLike.expiryTime}`);

const getNgoRecommendations = async ({ location, latitude, longitude, expiryDate, expiryTime, limit = 3 }) => {
  const ngos = await Admin.find({}).select('name location address').lean();
  if (!ngos.length) return [];

  const normalizedDonationLocation = normalizeText(location);
  const now = new Date();
  const expiryAt = buildDonationExpiryDateTime({ expiryDate, expiryTime });
  const hoursToExpiry = Math.max((expiryAt.getTime() - now.getTime()) / (1000 * 60 * 60), 0.1);
  const expiryUrgency = clamp((24 - hoursToExpiry) / 24, 0, 1) * 30;

  const ngoIds = ngos.map((ngo) => ngo._id);
  const activeCounts = await FoodDonation.aggregate([
    {
      $match: {
        assignedTo: { $in: ngoIds },
        deliveredAt: null,
      },
    },
    {
      $group: {
        _id: '$assignedTo',
        count: { $sum: 1 },
      },
    },
  ]);

  const activeMap = new Map(activeCounts.map((row) => [String(row._id), row.count]));
  const donorHasCoords = latitude !== null && longitude !== null;

  const scored = ngos.map((ngo) => {
    const normalizedNgoLocation = normalizeText(ngo.location);
    const sameCity = normalizedDonationLocation && normalizedNgoLocation === normalizedDonationLocation;

    const ngoCoords = extractLatLngFromText(ngo.address);
    const ngoHasCoords = ngoCoords.latitude !== null && ngoCoords.longitude !== null;

    let donorNgoDistanceKm = null;
    if (donorHasCoords && ngoHasCoords) {
      donorNgoDistanceKm = distanceKm(latitude, longitude, ngoCoords.latitude, ngoCoords.longitude);
    } else if (sameCity) {
      donorNgoDistanceKm = 0;
    }

    const nearbyByDistance = donorNgoDistanceKm !== null && donorNgoDistanceKm <= 30;
    const eligible = sameCity || nearbyByDistance;

    const distancePenalty = donorNgoDistanceKm === null ? 25 : clamp(donorNgoDistanceKm, 0, 50);
    const activeDonations = activeMap.get(String(ngo._id)) || 0;
    const ngoLoadPenalty = clamp(activeDonations * 8, 0, 40);

    // Lower score is better: closer NGO, lower load, and urgent expiry prioritized.
    const score = Number((distancePenalty + ngoLoadPenalty - expiryUrgency).toFixed(2));

    return {
      ngoId: ngo._id,
      name: ngo.name,
      location: ngo.location,
      distanceKm: donorNgoDistanceKm === null ? null : Number(donorNgoDistanceKm.toFixed(2)),
      activeDonations,
      scoreBreakdown: {
        distanceWeight: Number(distancePenalty.toFixed(2)),
        expiryUrgency: Number(expiryUrgency.toFixed(2)),
        ngoLoad: Number(ngoLoadPenalty.toFixed(2)),
      },
      score,
      eligible,
      eligibleReason: sameCity ? 'same-city' : nearbyByDistance ? 'nearby' : 'fallback',
    };
  });

  const eligibleScored = scored.filter((item) => item.eligible);
  const pool = eligibleScored.length ? eligibleScored : scored;
  pool.sort((a, b) => a.score - b.score);

  return pool.slice(0, limit).map((item) => ({
    ngoId: item.ngoId,
    name: item.name,
    location: item.location,
    distanceKm: item.distanceKm,
    activeDonations: item.activeDonations,
    scoreBreakdown: item.scoreBreakdown,
    score: item.score,
    eligibleReason: item.eligibleReason,
    hoursToExpiry: Number(hoursToExpiry.toFixed(2)),
  }));
};

const recommendNgoForDonation = async ({ location, latitude, longitude, expiryDate, expiryTime }) => {
  const ranked = await getNgoRecommendations({
    location,
    latitude,
    longitude,
    expiryDate,
    expiryTime,
    limit: 1,
  });

  return ranked[0] || null;
};

const notifyDonor = async ({ donorEmail, donationId, type, message }) => {
  if (!donorEmail) return;
  const user = await User.findOne({ email: donorEmail.toLowerCase() }).select('_id');
  if (!user) return;

  await Notification.create({
    userId: user._id,
    recipientRole: 'user',
    recipientId: user._id,
    donationId,
    type,
    message,
  });

  emitNotification(`user:${user._id}`, {
    type,
    message,
    donationId,
    audience: 'donor',
    createdAt: new Date().toISOString(),
  });
};

const notifyRoleRecipient = async ({ recipientRole, recipientId, donationId, type, message }) => {
  if (!recipientId) return;
  await Notification.create({
    recipientRole,
    recipientId,
    donationId,
    type,
    message,
  });
};

const isNotExpired = (donation, now = new Date()) => {
  const exp = new Date(`${donation.expiryDate.toISOString().split('T')[0]}T${donation.expiryTime}`);
  return exp > now;
};

const getExpiryMeta = (donation, now = new Date()) => {
  const expiryAt = buildDonationExpiryDateTime(donation);
  const hoursToExpiry = (expiryAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursToExpiry < 2) {
    return { priority: 'High', priorityRank: 1, hoursToExpiry: Number(hoursToExpiry.toFixed(2)) };
  }
  if (hoursToExpiry < 6) {
    return { priority: 'Medium', priorityRank: 2, hoursToExpiry: Number(hoursToExpiry.toFixed(2)) };
  }
  return { priority: 'Low', priorityRank: 3, hoursToExpiry: Number(hoursToExpiry.toFixed(2)) };
};

const withExpiryPriority = (donation, now = new Date()) => {
  const doc = donation.toObject ? donation.toObject() : donation;
  const expiryMeta = getExpiryMeta(doc, now);
  return {
    ...doc,
    priority: expiryMeta.priority,
    hoursToExpiry: expiryMeta.hoursToExpiry,
    priorityRank: expiryMeta.priorityRank,
  };
};

const sortByUrgency = (a, b) => {
  if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
};

const hasCoordinates = (item) =>
  item &&
  typeof item.latitude === 'number' &&
  Number.isFinite(item.latitude) &&
  typeof item.longitude === 'number' &&
  Number.isFinite(item.longitude);

const optimizeDeliverySequence = ({ donations, startLat = null, startLng = null }) => {
  const withCoords = donations.filter((d) => hasCoordinates(d));
  const withoutCoords = donations.filter((d) => !hasCoordinates(d));

  const startProvided = typeof startLat === 'number' && typeof startLng === 'number';
  const sortedByTime = [...withCoords].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let remaining;
  let current;
  let startPoint;
  const ordered = [];

  if (startProvided) {
    current = { latitude: startLat, longitude: startLng };
    startPoint = { latitude: startLat, longitude: startLng, source: 'delivery-live-location' };
    remaining = sortedByTime;
  } else if (sortedByTime.length > 0) {
    const first = sortedByTime[0];
    ordered.push({
      ...first,
      sequence: 1,
      distanceFromPreviousKm: 0,
    });
    current = { latitude: first.latitude, longitude: first.longitude };
    startPoint = {
      latitude: first.latitude,
      longitude: first.longitude,
      source: 'first-donor-location',
      donationId: first._id,
    };
    remaining = sortedByTime.slice(1);
  } else {
    return {
      startPoint: null,
      optimizedOrder: [],
      unroutableOrders: withoutCoords,
      totalDistanceKm: 0,
      mapPath: [],
    };
  }

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i];
      const dist = distanceKm(current.latitude, current.longitude, candidate.latitude, candidate.longitude);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestIdx = i;
      }
    }

    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push({
      ...next,
      sequence: ordered.length + 1,
      distanceFromPreviousKm: Number(bestDistance.toFixed(2)),
    });
    current = { latitude: next.latitude, longitude: next.longitude };
  }

  const totalDistanceKm = Number(
    ordered.reduce((sum, step) => sum + (step.distanceFromPreviousKm || 0), 0).toFixed(2)
  );

  const mapPath = [];
  if (startPoint) mapPath.push([startPoint.latitude, startPoint.longitude]);
  ordered.forEach((step) => mapPath.push([step.latitude, step.longitude]));

  return {
    startPoint,
    optimizedOrder: ordered,
    unroutableOrders: withoutCoords,
    totalDistanceKm,
    mapPath,
  };
};

const getNgoTrackingRows = async (ngoId) => {
  const donations = await FoodDonation.find({ assignedTo: ngoId })
    .select(NGO_ASSIGNED_FIELDS)
    .populate('deliveryBy', 'name city')
    .sort({ createdAt: -1 });

  return donations.map((d) => ({
    _id: d._id,
    donorName: d.donorName,
    food: d.food,
    category: d.category,
    phoneno: d.phoneno,
    quantity: d.quantity,
    location: d.location,
    address: d.address,
    latitude: d.latitude,
    longitude: d.longitude,
    createdAt: d.createdAt,
    expiryDate: d.expiryDate,
    expiryTime: d.expiryTime,
    deliveredAt: d.deliveredAt,
    deliveryPartner: d.deliveryBy ? { name: d.deliveryBy.name, city: d.deliveryBy.city } : null,
    status: getDonationStatus(d),
  }));
};

// ─── User: Create donation ────────────────────────────────────────────────────
// POST /api/donations
router.post('/', protect, async (req, res) => {
  try {
    const { food, type, category, quantity, expiryDate, expiryTime, location, address, phoneno } = req.body;
    const foodText = trimText(food);
    const quantityText = trimText(quantity);
    const quantityValue = parsePositiveQuantity(quantityText);
    const normalizedQuantityText = normalizeQuantityText(quantityText);
    const locationText = trimText(location);
    const addressText = trimText(address);
    const phoneText = trimText(phoneno);

    if (!foodText || !type || !category || !quantityText || !expiryDate || !expiryTime || !locationText || !addressText || !phoneText) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isValidPhone(phoneText)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    if (!quantityValue) {
      return res.status(400).json({ message: 'Quantity must be numeric and greater than 0' });
    }

    if (quantityValue > 10) {
      return res.status(400).json({ message: 'Quantity cannot exceed 10 kg' });
    }

    const coords = parseCoordinates(req.body);
    if (coords.error) {
      return res.status(400).json({ message: coords.error });
    }

    const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
    if (expiryDateTime <= new Date()) {
      return res.status(400).json({ message: 'Expiry date/time must be in the future' });
    }

    const user = await User.findById(req.user.id).select('name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const duplicateWindowStart = new Date(Date.now() - 2 * 60 * 1000);
    const existingDuplicate = await FoodDonation.findOne({
      donorEmail: user.email,
      food: foodText,
      type,
      category,
      quantity: normalizedQuantityText,
      location: locationText,
      address: addressText,
      expiryDate,
      expiryTime,
      createdAt: { $gte: duplicateWindowStart },
    }).select('_id');

    if (existingDuplicate) {
      return res.status(409).json({ message: 'Duplicate submission detected. Please wait before submitting again.' });
    }

    const donation = await FoodDonation.create({
      donorName: user.name,
      donorEmail: user.email,
      phoneno: phoneText,
      food: foodText,
      type,
      category,
      quantity: normalizedQuantityText,
      expiryDate,
      expiryTime,
      location: locationText,
      address: addressText,
      latitude: coords.latitude,
      longitude: coords.longitude,
      status: 'Posted',
    });

    const recommendedNgo = await recommendNgoForDonation({
      location: locationText,
      latitude: coords.latitude,
      longitude: coords.longitude,
      expiryDate,
      expiryTime,
    });

    const nearbyNgoRecommendations = await getNgoRecommendations({
      location,
      latitude: coords.latitude,
      longitude: coords.longitude,
      expiryDate,
      expiryTime,
      limit: 5,
    });

    const basePayload = {
      type: 'donation-created',
      title: 'New donation nearby',
      message: `New donation from ${user.name} in ${location}.`,
      donationId: donation._id,
      location: locationText,
      address: addressText,
      createdAt: new Date().toISOString(),
    };

    await Promise.all(
      nearbyNgoRecommendations.map((ngo) =>
        notifyRoleRecipient({
          recipientRole: 'admin',
          recipientId: ngo.ngoId,
          donationId: donation._id,
          type: 'donation-created',
          message: `New donation from ${user.name} in ${locationText}.`,
        })
      )
    );

    nearbyNgoRecommendations.forEach((ngo) => {
      emitNotification(`admin:${ngo.ngoId}`, {
        ...basePayload,
        distanceKm: ngo.distanceKm,
      });
    });

    if (location) {
      emitNotification(`admin-location:${normalizeText(locationText)}`, basePayload);
    }

    await logAdminEvent('FOOD_POSTED', donation._id);

    res.status(201).json({
      id: donation._id,
      status: getDonationStatus(donation),
      createdAt: donation.createdAt,
      latitude: donation.latitude,
      longitude: donation.longitude,
      recommendedNgo,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── User: Preview top NGO recommendations before final submission ───────────
// POST /api/donations/recommendations/preview
router.post('/recommendations/preview', protect, async (req, res) => {
  try {
    const { expiryDate, expiryTime, location } = req.body;
    if (!expiryDate || !expiryTime || !location) {
      return res.status(400).json({ message: 'expiryDate, expiryTime and location are required' });
    }

    const coords = parseCoordinates(req.body);
    if (coords.error) {
      return res.status(400).json({ message: coords.error });
    }

    const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
    if (expiryDateTime <= new Date()) {
      return res.status(400).json({ message: 'Expiry date/time must be in the future' });
    }

    const recommendations = await getNgoRecommendations({
      location,
      latitude: coords.latitude,
      longitude: coords.longitude,
      expiryDate,
      expiryTime,
      limit: 3,
    });

    res.json({
      recommendations,
      topRecommendation: recommendations[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── User: Get own donations ──────────────────────────────────────────────────
// GET /api/donations/my
router.get('/my', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const donations = await FoodDonation.find({ donorEmail: user.email }).select(USER_MY_FIELDS).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── NGO/Admin: Get available (unassigned, non-expired) donations ───────────
const getAvailableNgoDonations = async (_req, res) => {
  try {
    const donations = await FoodDonation.find({ assignedTo: null }).select(NGO_AVAILABLE_FIELDS).sort({ createdAt: -1 });

    const now = new Date();
    const prioritized = donations
      .filter((d) => isNotExpired(d, now))
      .map((d) => withExpiryPriority(d, now))
      .sort(sortByUrgency);

    res.json(prioritized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/donations/available-ngo (primary)
router.get('/available-ngo', protectAdmin, getAvailableNgoDonations);
// GET /api/donations/available-admin (compat)
router.get('/available-admin', protectAdmin, getAvailableNgoDonations);

// ─── NGO/Admin: Filter donations by location ─────────────────────────────────
// GET /api/donations/by-location?location=Indiranagar
router.get('/by-location', protectAdmin, async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) return res.status(400).json({ message: 'location query param required' });

    const donations = await FoodDonation.find({ location }).select(NGO_AVAILABLE_FIELDS).sort({ createdAt: -1 });

    const now = new Date();
    const prioritized = donations
      .filter((d) => isNotExpired(d, now))
      .map((d) => withExpiryPriority(d, now))
      .sort(sortByUrgency);

    res.json(prioritized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── NGO/Admin: Own assigned list ─────────────────────────────────────────────
const getNgoAssignedDonations = async (req, res) => {
  try {
    const trackingRows = await getNgoTrackingRows(req.user.id);
    res.json(trackingRows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/donations/ngo-assigned (primary)
router.get('/ngo-assigned', protectAdmin, getNgoAssignedDonations);
// GET /api/donations/admin-assigned (compat)
router.get('/admin-assigned', protectAdmin, getNgoAssignedDonations);

// ─── NGO/Admin: Track order lifecycle ─────────────────────────────────────────
const getNgoTracking = async (req, res) => {
  try {
    const trackingRows = await getNgoTrackingRows(req.user.id);
    res.json(trackingRows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/donations/ngo-tracking (primary)
router.get('/ngo-tracking', protectAdmin, getNgoTracking);
// GET /api/donations/admin-tracking (compat)
router.get('/admin-tracking', protectAdmin, getNgoTracking);

// ─── NGO/Admin: Claim / assign a donation to self ─────────────────────────────
// PUT /api/donations/:id/assign
router.put('/:id/assign', protectAdmin, async (req, res) => {
  try {
    const now = new Date();
    const donation = await FoodDonation.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedTo: null,
        deliveryBy: null,
        deliveredAt: null,
        ...notExpiredFilterExpr(now),
      },
      {
        $set: {
          assignedTo: req.user.id,
          status: 'Assigned',
        },
      },
      { new: true }
    );

    if (!donation) {
      const exists = await FoodDonation.findById(req.params.id).select('_id assignedTo expiryDate expiryTime');
      if (!exists) return res.status(404).json({ message: 'Donation not found' });

      if (!isNotExpired(exists, now)) {
        return res.status(400).json({ message: 'Food expired' });
      }

      return res.status(409).json({ message: 'This donation has already been claimed by another NGO.' });
    }

    await notifyDonor({
      donorEmail: donation.donorEmail,
      donationId: donation._id,
      type: 'claimed',
      message: 'Your donation has been claimed by an NGO partner.',
    });

    const deliveryPeople = await DeliveryPerson.find({}).select('_id').lean();
    await Promise.all(
      deliveryPeople.map((p) =>
        notifyRoleRecipient({
          recipientRole: 'delivery',
          recipientId: p._id,
          donationId: donation._id,
          type: 'donation-claimed',
          message: `NGO partner claimed a donation in ${donation.location}.`,
        })
      )
    );

    emitNotification('role:delivery', {
      type: 'donation-claimed',
      title: 'New pickup available',
      message: `NGO partner claimed a donation in ${donation.location}.`,
      donationId: donation._id,
      location: donation.location,
      address: donation.address,
      createdAt: new Date().toISOString(),
      audience: 'delivery',
    });

    await logAdminEvent('FOOD_CLAIMED', donation._id);

    res.json({ message: 'Donation claimed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delivery: Get available pickups ──────────────────────────────────────────
// GET /api/donations/available-delivery?lat=..&lng=..
router.get('/available-delivery', protectDelivery, async (req, res) => {
  try {
    const refLat = toNum(req.query.lat);
    const refLng = toNum(req.query.lng);

    const donations = await FoodDonation.find({
      assignedTo: { $ne: null },
      deliveryBy: null,
    })
      .select(DELIVERY_AVAILABLE_FIELDS)
      .populate('assignedTo', 'name address location')
      .sort({ createdAt: -1 });

    const nonExpired = donations.filter((d) => isNotExpired(d));

    if (refLat === null || refLng === null) {
      return res.json(nonExpired);
    }

    const withDistance = nonExpired.map((d) => {
      const doc = d.toObject();
      if (doc.latitude === null || doc.longitude === null) {
        doc.distanceKm = null;
      } else {
        doc.distanceKm = Number(distanceKm(refLat, refLng, doc.latitude, doc.longitude).toFixed(2));
      }
      return doc;
    });

    withDistance.sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

    res.json(withDistance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delivery: Get own orders ─────────────────────────────────────────────────
// GET /api/donations/my-deliveries
router.get('/my-deliveries', protectDelivery, async (req, res) => {
  try {
    const donations = await FoodDonation.find({ deliveryBy: req.user.id })
      .select(DELIVERY_MY_FIELDS)
      .populate('assignedTo', 'name address location')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delivery: Get optimized visit order for active assigned orders ──────────
// GET /api/donations/my-deliveries/optimized-route?startLat=..&startLng=..
router.get('/my-deliveries/optimized-route', protectDelivery, async (req, res) => {
  try {
    const startLat = toNum(req.query.startLat);
    const startLng = toNum(req.query.startLng);

    const donations = await FoodDonation.find({
      deliveryBy: req.user.id,
      deliveredAt: null,
    })
      .select(DELIVERY_MY_FIELDS)
      .populate('assignedTo', 'name address location')
      .sort({ createdAt: 1 })
      .lean();

    const sequence = optimizeDeliverySequence({
      donations,
      startLat,
      startLng,
    });

    const optimizedOrder = sequence.optimizedOrder.map((item) => ({
      donationId: item._id,
      donorName: item.donorName,
      phoneno: item.phoneno,
      location: item.location,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      expiryDate: item.expiryDate,
      expiryTime: item.expiryTime,
      assignedTo: item.assignedTo,
      sequence: item.sequence,
      distanceFromPreviousKm: item.distanceFromPreviousKm,
    }));

    const unroutableOrders = sequence.unroutableOrders.map((item) => ({
      donationId: item._id,
      donorName: item.donorName,
      phoneno: item.phoneno,
      location: item.location,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      expiryDate: item.expiryDate,
      expiryTime: item.expiryTime,
      assignedTo: item.assignedTo,
    }));

    res.json({
      startPoint: sequence.startPoint,
      optimizedOrder,
      unroutableOrders,
      totalDistanceKm: sequence.totalDistanceKm,
      mapPath: sequence.mapPath,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delivery: Take an order ──────────────────────────────────────────────────
// PUT /api/donations/:id/take
router.put('/:id/take', protectDelivery, async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (!donation.assignedTo) {
      return res.status(400).json({ message: 'Cannot pick unassigned food' });
    }
    if (!isNotExpired(donation)) {
      return res.status(400).json({ message: 'Food expired' });
    }
    if (donation.deliveredAt) {
      return res.status(400).json({ message: 'Order already completed' });
    }
    if (donation.status !== 'Assigned') {
      return res.status(400).json({ message: 'Invalid status flow. Only assigned orders can be picked.' });
    }
    if (donation.deliveryBy) return res.status(409).json({ message: 'Already taken' });

    donation.deliveryBy = req.user.id;
    donation.status = 'In Transit';
    await donation.save();

    await notifyRoleRecipient({
      recipientRole: 'admin',
      recipientId: donation.assignedTo,
      donationId: donation._id,
      type: 'delivery-accepted',
      message: 'A delivery partner accepted your assigned donation order.',
    });

    emitNotification(`admin:${donation.assignedTo}`, {
      type: 'delivery-accepted',
      title: 'Delivery partner assigned',
      message: 'A delivery partner accepted your assigned donation order.',
      donationId: donation._id,
      location: donation.location,
      address: donation.address,
      createdAt: new Date().toISOString(),
      audience: 'ngo',
    });

    await notifyDonor({
      donorEmail: donation.donorEmail,
      donationId: donation._id,
      type: 'picked',
      message: 'Your donation has been picked by a delivery partner.',
    });

    await logAdminEvent('VOLUNTEER_ASSIGNED', donation._id);
    await logAdminEvent('FOOD_PICKED', donation._id);

    res.json({ message: 'Order taken successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delivery: Mark order as placed / delivered ───────────────────────────────
// PUT /api/donations/:id/place
router.put('/:id/place', protectDelivery, async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (String(donation.deliveryBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not your order' });
    }
    if (donation.deliveredAt) {
      return res.status(409).json({ message: 'Order already marked as delivered' });
    }
    if (donation.status !== 'In Transit') {
      return res.status(400).json({ message: 'Invalid status flow. Only picked orders can be delivered.' });
    }

    donation.deliveredAt = new Date();
    donation.status = 'Delivered';

    if (!Number.isFinite(donation.distributedMeals)) {
      donation.distributedMeals = 0;
    }

    if (!Number.isFinite(donation.remainingMeals) || donation.remainingMeals <= 0) {
      donation.remainingMeals = estimateMealsFromQuantity(donation.quantity);
    }

    if (!donation.distributionStartTime) {
      donation.distributionStartTime = donation.deliveredAt;
    }

    if (!donation.distributionEndTime) {
      const end = new Date(donation.deliveredAt);
      end.setHours(end.getHours() + 3);
      donation.distributionEndTime = end;
    }

    await donation.save();

    await notifyDonor({
      donorEmail: donation.donorEmail,
      donationId: donation._id,
      type: 'delivered',
      message: 'Your donation has been delivered successfully. Thank you for your support.',
    });

    await logAdminEvent('FOOD_DELIVERED', donation._id);

    res.json({ message: 'Order marked as placed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
