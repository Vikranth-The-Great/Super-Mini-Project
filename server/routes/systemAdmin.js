const express = require('express');
const FoodDonation = require('../models/FoodDonation');
const AdminActivityEvent = require('../models/AdminActivityEvent');
const { logAdminEvent } = require('../utils/adminActivity');

const router = express.Router();

const TRACKING_FIELDS = 'donorName assignedTo deliveryBy status expiryDate expiryTime deliveredAt createdAt';

const buildExpiryDateTime = (row) =>
  new Date(`${new Date(row.expiryDate).toISOString().split('T')[0]}T${row.expiryTime}`);

const isExpired = (row, now = new Date()) => {
  if (!row.expiryDate || !row.expiryTime) return false;
  if (row.status === 'Delivered' || row.status === 'Completed' || row.deliveredAt) return false;
  return buildExpiryDateTime(row) <= now;
};

const toUiStatus = (row, now = new Date()) => {
  if (isExpired(row, now)) return 'Expired';
  if (row.status === 'Delivered' || row.status === 'Completed' || row.deliveredAt) return 'Delivered';
  if (row.status === 'In Transit' || row.deliveryBy) return 'Picked';
  if (row.status === 'Assigned' || row.assignedTo) return 'Claimed';
  return 'Posted';
};

const formatEventMessage = (eventType, donation) => {
  const foodId = String(donation?._id || '').slice(-6).toUpperCase();
  const donor = donation?.donorName || 'Donor';
  const ngo = donation?.assignedTo?.name || 'NGO';
  const volunteer = donation?.deliveryBy?.name || 'Volunteer';

  switch (eventType) {
    case 'FOOD_POSTED':
      return `${donor} posted Food #${foodId}`;
    case 'FOOD_CLAIMED':
      return `${ngo} claimed Food #${foodId}`;
    case 'VOLUNTEER_ASSIGNED':
      return `${volunteer} was assigned to Food #${foodId}`;
    case 'FOOD_PICKED':
      return `${volunteer} picked up Food #${foodId}`;
    case 'FOOD_DELIVERED':
      return `${volunteer} delivered Food #${foodId}`;
    case 'FOOD_EXPIRED':
      return `Food #${foodId} expired`;
    default:
      return `Activity update for Food #${foodId}`;
  }
};

const ensureExpiredEvents = async (donations) => {
  const expiredIds = donations.filter((d) => toUiStatus(d) === 'Expired').map((d) => d._id);
  if (!expiredIds.length) return;

  const existing = await AdminActivityEvent.find({
    eventType: 'FOOD_EXPIRED',
    donationId: { $in: expiredIds },
  })
    .select('donationId')
    .lean();

  const existingIdSet = new Set(existing.map((e) => String(e.donationId)));
  const missing = expiredIds.filter((id) => !existingIdSet.has(String(id)));

  await Promise.allSettled(missing.map((id) => logAdminEvent('FOOD_EXPIRED', id)));
};

// Public-by-design per requirement: direct admin dashboard access without login/signup.
router.get('/dashboard', async (_req, res) => {
  try {
    const now = new Date();
    const donations = await FoodDonation.find({})
      .select(TRACKING_FIELDS)
      .populate('assignedTo', 'name')
      .populate('deliveryBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    await ensureExpiredEvents(donations);

    const events = await AdminActivityEvent.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const donationMap = new Map(donations.map((d) => [String(d._id), d]));

    const trackingRows = donations.map((row) => {
      const uiStatus = toUiStatus(row, now);
      return {
        foodId: String(row._id).slice(-6).toUpperCase(),
        donor: row.donorName,
        ngo: row.assignedTo?.name || '-',
        volunteer: row.deliveryBy?.name || '-',
        status: uiStatus,
        expiryTime: buildExpiryDateTime(row).toISOString(),
      };
    });

    const summary = trackingRows.reduce(
      (acc, row) => {
        if (row.status === 'Delivered') {
          acc.delivered += 1;
        } else if (row.status === 'Expired') {
          acc.expired += 1;
        } else if (row.status === 'Picked') {
          acc.inTransit += 1;
          acc.active += 1;
        } else if (row.status === 'Claimed') {
          acc.claimed += 1;
          acc.active += 1;
        } else if (row.status === 'Posted') {
          acc.active += 1;
        }
        return acc;
      },
      { active: 0, claimed: 0, inTransit: 0, delivered: 0, expired: 0 }
    );

    let activityFeed = events
      .map((event) => {
        const donation = donationMap.get(String(event.donationId));
        if (!donation) return null;

        return {
          id: String(event._id),
          eventType: event.eventType,
          message: formatEventMessage(event.eventType, donation),
          createdAt: event.createdAt,
        };
      })
      .filter(Boolean)
      .slice(0, 50);

    if (activityFeed.length === 0) {
      activityFeed = donations.slice(0, 20).map((donation) => {
        const status = toUiStatus(donation, now);
        const fallbackType =
          status === 'Delivered'
            ? 'FOOD_DELIVERED'
            : status === 'Picked'
            ? 'FOOD_PICKED'
            : status === 'Claimed'
            ? 'FOOD_CLAIMED'
            : status === 'Expired'
            ? 'FOOD_EXPIRED'
            : 'FOOD_POSTED';

        return {
          id: `seed-${String(donation._id)}`,
          eventType: fallbackType,
          message: formatEventMessage(fallbackType, donation),
          createdAt: donation.createdAt,
        };
      });
    }

    res.json({
      summary,
      activityFeed,
      trackingRows,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load admin dashboard.' });
  }
});

module.exports = router;
