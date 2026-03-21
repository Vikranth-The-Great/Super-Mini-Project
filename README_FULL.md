# 🍎 Food Waste Management - MERN + Mobile Monorepo

A complete food donation platform with **web**, **mobile**, and **backend** services.

## 📱 Project Overview

This monorepo contains:
- **Web App** (`apps/web` or `client/`) - React + Vite for desktop/browser  
- **Mobile App** (`apps/mobile`) - React Native + Expo for Android/iOS
- **Backend** (`apps/server` or `server/`) - Node.js + Express + MongoDB + Socket.IO
- **Shared** (`packages/shared`) - Constants, types, and utilities

### User Roles
- **Users**: Food donors - create and track donations
- **NGOs/Admins**: Receivers - claim available food donations  
- **Delivery Partners**: Transport food from donors to NGOs

---

## 🚀 Quick Start (5 minutes)

### Setup Environment
```bash
# Install all dependencies
npm install

# Configure backend (.env in server/ or apps/server/)
cp server/.env.example server/.env
# Edit server/.env - add MongoDB URI and JWT_SECRET

# Configure mobile (optional, .env.local in apps/mobile/)
# Update EXPO_PUBLIC_API_URL to your API endpoint
```

### Run Everything
```bash
# Terminal 1: Start both backend and web
npm run dev

# Terminal 2: Start mobile (in separate terminal)
npm run dev:mobile

# Or run all three in one command
npm run dev:all
```

**That's it!** Your app is running:
- Backend: `http://localhost:5000`
- Web: `http://localhost:5173`
- Mobile: Expo dev server (scan QR code)

---

## 📂 Directory Structure

```
mern/
├── apps/
│   ├── server/                    # Node.js + Express backend
│   │   ├── app.js                # Express app
│   │   ├── index.js              # Server entry
│   │   ├── socket.js             # Socket.IO setup
│   │   ├── config/db.js          # MongoDB config
│   │   ├── middleware/auth.js    # JWT middleware
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # API routes
│   │   ├── tests/                # Jest tests
│   │   ├── package.json
│   │   └── .env                  # (create this)
│   │
│   ├── web/                       # React + Vite web app
│   │   ├── src/
│   │   │   ├── App.jsx           # Main app component
│   │   │   ├── main.jsx          # Entry point
│   │   │   ├── pages/            # Page components
│   │   │   ├── components/       # Reusable components
│   │   │   ├── context/          # React context
│   │   │   ├── i18n/             # Internationalization
│   │   │   └── index.css
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── mobile/                    # React Native + Expo app
│       ├── src/
│       │   ├── index.tsx          # App entry
│       │   ├── screens/           # Screen components
│       │   ├── components/        # Reusable components
│       │   ├── navigation/        # React Navigation
│       │   ├── context/           # Auth context
│       │   ├── api/               # API client
│       │   ├── hooks/             # Custom hooks
│       │   └── config/            # Config & theme
│       ├── app.json              # Expo config
│       ├── package.json
│       ├── .env.local            # (create this)
│       └── README.md             # Mobile-specific docs
│
├── packages/
│   └── shared/                    # Shared constants & utilities
│       ├── src/
│       │   ├── constants/        # Roles, API routes, statuses
│       │   ├── types/            # TypeScript interfaces
│       │   ├── utils/            # Validation, formatting, errors
│       │   └── index.ts          # Barrel export
│       ├── package.json
│       └── README.md
│
├── package.json                   # Root package (workspaces)
├── README.md                      # This file
└── .gitignore
```

**Note**: Older paths `server/` and `client/` still work for backward compatibility.

---

## 💻 Development Workflow

### Option 1: Web + Backend (Recommended for Getting Started)
```bash
npm run dev
```
Starts:
- Backend on `http://localhost:5000`
- Web on `http://localhost:5173`

### Option 2: Add Mobile
In another terminal:
```bash
npm run dev:mobile
```
Scan QR code with **Expo Go** app (Android/iOS)

### Option 3: Run Each Separately
```bash
# Terminal 1: Backend only
npm run dev:server

# Terminal 2: Web only  
npm run dev:web

# Terminal 3: Mobile only
npm run dev:mobile
npm run dev:mobile:android  # Android emulator specific
```

### Option 4: Everything at Once
```bash
npm run dev:all
```

---

## 🔐 Authentication Flow

### How It Works
1. User selects **role** (User / NGO / Delivery)
2. User **signs up** or **logs in** with email & password
3. Backend validates and returns **JWT token** + user data
4. App **stores token** securely:
   - Web: `localStorage`
   - Mobile: `AsyncStorage`
5. Token auto-attached to all API requests via **Authorization header**
6. On app launch: token **automatically restored** from storage

### Auth Endpoints
```
User Role:
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me

NGO/Admin Role:
  POST   /api/admin/auth/register    (or /api/ngo/auth)
  POST   /api/admin/auth/login       (or /api/ngo/auth)
  GET    /api/admin/auth/me

Delivery Role:
  POST   /api/delivery/auth/register
  POST   /api/delivery/auth/login
  GET    /api/delivery/auth/me
```

---

## 🍎 Core Features

### User (Donor) Dashboard
- Create food donation (with location)
- View all your donations and status
- Receive notifications when food is claimed/delivered
- Profile management

### NGO Dashboard  
- View available food donations
- Click to claim donations
- Manage claimed donations
- Profile with organization details

### Delivery Dashboard
- View available delivery orders
- Accept orders to deliver
- Mark orders as delivered
- Track assigned deliveries

### Notifications
- Real-time notifications via Socket.IO
- Persistent notification history
- Mark notifications as read
- Separate feeds per role

---

## 📡 API Routes Summary

Complete API documentation: `packages/shared/src/constants/apiRoutes.ts`

### Food Donations
```
POST   /api/donations                  - Create new donation
GET    /api/donations/my              - Get user's donations
GET    /api/donations/available       - Get available to claim
POST   /api/donations/:id/claim       - Claim donation (NGO)
POST   /api/donations/:id/assign      - Accept delivery (Delivery)
POST   /api/donations/:id/complete    - Mark delivered
```

### Notifications
```
GET    /api/notifications/my          - Get user notifications
PUT    /api/notifications/:id/read    - Mark as read
PUT    /api/notifications/read-all    - Mark all as read
```

### NGOs
```
GET    /api/ngos/food-availability    - Get available food with locations
GET    /api/ngos/list                 - List all NGOs
```

### Analytics (Admin)
```
GET    /api/analytics/dashboard       - Dashboard stats
GET    /api/analytics/food-stats      - Food statistics
```

---

## 🔧 Configuration

### Backend (.env)

Create `server/.env` or `apps/server/.env`:

```env
# Server
NODE_ENV=development
PORT=5000
SOCKET_IO_PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/food-donation
# Or cloud: mongodb+srv://user:pass@cluster.mongodb.net/food-donation

# Authentication
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Origins (optional, auto-detected in dev)
REACT_APP_URL=http://localhost:5173
MOBILE_APP_URL=http://localhost:8081
```

### Mobile (.env.local)

Create `apps/mobile/.env.local`:

```env
# Update to match your backend
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api

# For physical device, use your machine IP:
# EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api

# For production:
# EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 📱 Mobile App Details

### Tech Stack
- **React Native** - Cross-platform mobile framework
- **Expo** - Development & distribution platform
- **React Navigation** - Native navigation
- **AsyncStorage** - Secure token storage
- **Axios** - HTTP client
- **expo-location** - GPS location services

### Features
- ✅ Role-based navigation (User/Admin/Delivery)
- ✅ Secure token persistence
- ✅ Location capture for donations
- ✅ Real-time notifications
- ✅ Offline support (AsyncStorage)
- ✅ Material-inspired UI with custom theme

### Running Mobile
```bash
cd apps/mobile

# Install dependencies
npm install

# Start dev server
npm start

# Or specific platform
npm run start:android
npm run start:ios
npm run start:web
```

**First run?** Scan the QR code with **Expo Go** app.

---

## 🛠 Shared Package

`packages/shared/` exports constants known across web and mobile:

```typescript
// Constants
import { ROLE_USER, ROLE_ADMIN, ROLE_DELIVERY } from '@food-donation/shared/constants';
import { API_ROUTES } from '@food-donation/shared/constants';
import { DONATION_STATUS } from '@food-donation/shared/constants';

// Types
import type { Donation, Notification, AuthResponse } from '@food-donation/shared/types';

// Utilities
import { validateEmail, formatDate, parseApiError } from '@food-donation/shared/utils';
```

This prevents duplication and ensures consistency!

---

## 🗄️ Database Schema

### users
```javascript
{
  name, email, password (hashed), gender,
  createdAt, updatedAt
}
```

### admins (NGOs)
```javascript
{
  name, email, password (hashed), address, location,
  createdAt, updatedAt
}
```

### deliverypersons
```javascript
{
  name, email, password (hashed), city,
  createdAt, updatedAt
}
```

### fooddonations
```javascript
{
  donorName, food, category, quantity,
  location, address, latitude, longitude,
  expiryDate, expiryTime, phoneno,
  assignedTo (NGO ID), deliveryBy (Delivery ID),
  deliveredAt (timestamp), userId,
  createdAt, updatedAt
}
```

### notifications
```javascript
{
  recipientRole, recipientId, title, message,
  type, relatedId, isRead, userId (legacy),
  createdAt
}
```

---

## 🚀 Deployment

### Deploy Web (Vercel / Netlify)
```bash
# Build
npm run build:web

# Deploy dist/ folder to Vercel/Netlify
```

### Deploy Backend (Heroku / Railway / AWS)
```bash
# Ensure PORT env var is used: process.env.PORT || 5000
# Push to your hosting platform
```

### Deploy Mobile (EAS Build)
```bash
# Setup EAS CLI
npm install -g eas-cli
eas login

# Build APK
npm run build:mobile

# Or build AAB for Play Store
eas build --platform android --profile production
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```
Error: Cannot find module 'express'
→ Run: npm install --prefix server
  or: npm install (in server/ directory)
```

### Can't Connect from Mobile
```
Error: Backend unreachable
→ Check backend is running: curl http://localhost:5000/api/health
→ Update EXPO_PUBLIC_API_URL in apps/mobile/.env.local
→ For emulator: use http://10.0.2.2:5000/api
→ For device: use http://{YOUR_IP}:5000/api (find with: ipconfig)
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Error
```
MongooseError: Cannot connect to mongodb://localhost
→ Start MongoDB: mongod
→ Or use cloud: MONGODB_URI=mongodb+srv://...
```

### Expo Didn't Install Dependencies
```bash
cd apps/mobile
npm install

# On Windows, may need:
npm install --legacy-peer-deps
```

### Mobile App Crashes on Login
```
Check browser console for detailed error
Common issues:
- API_BASE_URL points to wrong server
- JWT_SECRET mismatch between web/mobile
- CORS not configured for mobile origin
```

---

## 📚 Project Documentation

- **Backend**: See `server/README.md` or `apps/server/README.md`
- **Web**: See `client/README.md` or `apps/web/README.md`
- **Mobile**: See `apps/mobile/README.md`
- **Shared**: See `packages/shared/README.md`

---

## 🎯 Next Steps

1. **Copy `.env` template**:
   ```bash
   cp server/.env.example server/.env
   ```

2. **Start backend**:
   ```bash
   npm run dev:server
   ```

3. **Verify it works**:
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status":"ok"}
   ```

4. **Start web frontend**:
   ```bash
   npm run dev:web
   ```

5. **Test mobile** (optional):
   ```bash
   npm run dev:mobile
   npm run dev:mobile:android
   ```

6. **Create a test account** and test the flow!

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Test: `npm test` (for backend)
4. Commit: `git commit -m "Add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

---

## 📄 License

MIT © Food Donation Project

---

## 💡 Architecture Notes

### Why This Structure?

- **Monorepo**: All code in one place, easier to manage
- **Shared Package**: Constants consistent across all clients
- **Frontend Separation**: Web and Mobile can update independently
- **Single Backend**: Both frontends share same APIs
- **AsyncStorage**: Mobile has no localStorage, uses device storage

### Token Strategy

Different tokens for each role allow:
- ✅ Users logged in as donors  
- ✅ Same user switching to NGO mode
- ✅ Delivery persons logging in separately
- ✅ Better role-based access control

### Real-time Updates

Socket.IO integrated for:
- Live notifications
- Donation claim updates
- Delivery status changes
- Future: Live chat, typing indicators, etc.

---

**Ready to build?** Start with `npm run dev` and happy coding! 🚀
