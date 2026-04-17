const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryPersonSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, minlength: 3, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phoneno:  { type: String, required: true, trim: true, match: /^\d{10}$/ },
    city:     { type: String, required: true },
  },
  { timestamps: true }
);

deliveryPersonSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

deliveryPersonSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('DeliveryPerson', deliveryPersonSchema);
