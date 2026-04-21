const mongoose = require('mongoose');

const adminActivityEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'FOOD_POSTED',
        'FOOD_CLAIMED',
        'VOLUNTEER_ASSIGNED',
        'FOOD_PICKED',
        'FOOD_DELIVERED',
        'FOOD_EXPIRED',
      ],
      required: true,
      index: true,
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

adminActivityEventSchema.index({ eventType: 1, donationId: 1 }, { unique: true });

module.exports = mongoose.model('AdminActivityEvent', adminActivityEventSchema);
