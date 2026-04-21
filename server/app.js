const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/adminAuth');
const deliveryAuthRoutes = require('./routes/deliveryAuth');
const donationRoutes = require('./routes/donations');
const ngoRoutes = require('./routes/ngos');
const feedbackRoutes = require('./routes/feedback');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const systemAdminRoutes = require('./routes/systemAdmin');

const app = express();

// CORS configuration for web and production
const allowedOrigins = [
  'http://localhost:5173', // Web frontend
  'http://localhost:3000', // Alternative web port
  process.env.REACT_APP_URL || null, // Web production
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// NGO paths are now primary; admin paths are compatibility aliases.
app.use('/api/ngo/auth', adminAuthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);

app.use('/api/delivery/auth', deliveryAuthRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/system-admin', systemAdminRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
