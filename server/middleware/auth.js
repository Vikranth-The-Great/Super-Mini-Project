const { verifyJwt } = require('../utils/jwt');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: no token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyJwt(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized: invalid token' });
  }
};

const protectAdmin = (req, res, next) => {
  protect(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin access required' });
    }
    next();
  });
};

const protectDelivery = (req, res, next) => {
  protect(req, res, () => {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Forbidden: delivery access required' });
    }
    next();
  });
};

module.exports = { protect, protectAdmin, protectDelivery };
