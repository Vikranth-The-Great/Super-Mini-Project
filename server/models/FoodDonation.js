const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema(
  {
    // Donor details
    donorName:  { type: String, required: true },
    donorEmail: { type: String, required: true, lowercase: true },
    phoneno:    { type: String, required: true },

    // Food details
    food:     { type: String, required: true },
    type:     { type: String, enum: ['veg', 'non-veg'], required: true },
    category: { type: String, enum: ['raw-food', 'cooked-food', 'packed-food'], required: true },
    quantity: { type: String, required: true },

    // Expiry
    expiryDate: { type: Date, required: true },
    expiryTime: { type: String, required: true },

    // Location
    location: { type: String, required: true },
    address:  { type: String, required: true },
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },

    // Assignment
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    deliveryBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson', default: null },
    deliveredAt: { type: Date, default: null },
    remainingMeals: { type: Number, min: 0, default: 0 },
    distributedMeals: { type: Number, min: 0, default: 0 },
    distributionStartTime: { type: Date, default: null },
    distributionEndTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ['Posted', 'Assigned', 'In Transit', 'Delivered', 'Completed'],
      default: 'Posted',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodDonation', foodDonationSchema);
