const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { signJwt } = require('../utils/jwt');

const router = express.Router();

const trimText = (value) => String(value || '').trim();
const isValidPhone = (value) => /^\d{10}$/.test(trimText(value));

const signToken = (id) =>
  signJwt({ id, role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const normalizeGender = (gender) => {
  if (!gender) return null;

  const value = String(gender).trim().toLowerCase();

  if (value === 'm' || value === 'male') return 'male';
  if (value === 'f' || value === 'female') return 'female';
  if (value === 'o' || value === 'other') return 'other';

  return null;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, gender, phoneno, location } = req.body;
    const nameText = trimText(name);
    const emailText = trimText(email).toLowerCase();
    const phoneText = trimText(phoneno);
    const locationText = trimText(location);
    const normalizedGender = normalizeGender(gender);

    if (!nameText || !emailText || !password || !gender || !phoneText || !locationText) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isValidPhone(phoneText)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    if (!normalizedGender) {
      return res.status(400).json({ message: 'Invalid gender value' });
    }

    const existing = await User.findOne({ email: emailText });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name: nameText,
      email: emailText,
      password,
      gender: normalizedGender,
      phoneno: phoneText,
      location: locationText,
    });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        phoneno: user.phoneno,
        location: user.location,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailText = trimText(email).toLowerCase();

    if (!emailText || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: emailText });
    if (!user) {
      return res.status(404).json({ message: "Account doesn't exist" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        phoneno: user.phoneno,
        location: user.location,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
