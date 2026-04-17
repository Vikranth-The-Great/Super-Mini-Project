const { Server } = require('socket.io');
const Admin = require('./models/Admin');
const DeliveryPerson = require('./models/DeliveryPerson');
const { verifyJwt } = require('./utils/jwt');

let io = null;

const normalizeRoomKey = (value) => String(value || '').trim().toLowerCase();

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const raw = socket.handshake.auth?.token || socket.handshake.headers?.authorization || '';
      const token = raw.startsWith('Bearer ') ? raw.split(' ')[1] : raw;
      if (!token) return next(new Error('Unauthorized'));

      const decoded = verifyJwt(token, process.env.JWT_SECRET);
      socket.user = { id: String(decoded.id), role: decoded.role };

      if (decoded.role === 'admin') {
        const admin = await Admin.findById(decoded.id).select('location').lean();
        if (admin?.location) {
          socket.user.location = admin.location;
        }
      }

      if (decoded.role === 'delivery') {
        const person = await DeliveryPerson.findById(decoded.id).select('city').lean();
        if (person?.city) {
          socket.user.city = person.city;
        }
      }

      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role, location, city } = socket.user;

    socket.join(`role:${role}`);
    socket.join(`${role}:${id}`);

    if (role === 'admin' && location) {
      socket.join(`admin-location:${normalizeRoomKey(location)}`);
    }

    if (role === 'delivery' && city) {
      socket.join(`delivery-city:${normalizeRoomKey(city)}`);
    }
  });

  return io;
};

const emitToRoom = (room, event, payload) => {
  if (!io) return;
  io.to(room).emit(event, payload);
};

const emitNotification = (room, payload) => emitToRoom(room, 'notification', payload);

module.exports = {
  initSocket,
  emitToRoom,
  emitNotification,
  normalizeRoomKey,
};
