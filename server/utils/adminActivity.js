const AdminActivityEvent = require('../models/AdminActivityEvent');

const logAdminEvent = async (eventType, donationId) => {
  if (!eventType || !donationId) return;

  try {
    await AdminActivityEvent.create({ eventType, donationId });
  } catch (err) {
    // Duplicate key means this event was already recorded for the donation.
    if (err && err.code === 11000) return;
  }
};

module.exports = { logAdminEvent };
