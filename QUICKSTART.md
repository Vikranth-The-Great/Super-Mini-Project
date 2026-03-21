# 🚀 Quick Setup Guide

## For Developers: Get Running in 5 Minutes

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd mern
```

### 2. Install Dependencies
```bash
npm install
```

This installs:
- Root dependencies
- Server dependencies  
- Web frontend dependencies
- Mobile app dependencies
- Shared package dependencies

### 3. Configure Backend

**Copy `.env` example:**
```bash
cp server/.env.example server/.env
```

**Edit `server/.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/food-donation
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=5000
```

**Make sure MongoDB is running:**
```bash
mongod
# On macOS with Homebrew: brew services start mongodb-community
```

### 4. Start Development Servers

**Option A: Web + Backend (fastest for testing)**
```bash
npm run dev
```

**Option B: All three (web + backend + mobile)**
```bash
npm run dev:all
```

### 5. Test the App

**Web**: Open `http://localhost:5173`
- Sign up as a user
- Create a donation
- See it on the dashboard

**Mobile** (if running):
- Scan QR code with Expo Go app
- Sign up with same credentials
- See same donation on mobile

### ✅ You're Done!

The app is now running. Try these next:

1. **Sign up as User** (food donor)
2. **Create a donation** with location
3. **Sign up as NGO** (in another browser tab/device)
4. **Claim the donation** from NGO account
5. **Sign up as Delivery**
6. **Accept delivery** from delivery account
7. **Mark as delivered**

---

## Configuration Guide

### Backend: Change API Port
Edit `server/index.js`:
```javascript
const PORT = process.env.PORT || 5000; // Change to 8000, etc.
```

### Web: Change Frontend Port
Edit `client/vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3000, // Change port here
  },
});
```

### Mobile: Point to Your Backend
Edit `apps/mobile/src/config/env.ts`:
```typescript
const API_BASE_URL = 'http://192.168.1.100:5000/api'; // Your IP
```

---

## Common Issues & Fixes

### Port 5000 Already in Use
```bash
# Find process using port 5000
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Not Running
```bash
# Check if running
mongo --version

# Start it
mongod

# macOS brew:
brew services start mongodb-community

# Windows:
# Start MongoDB from Start Menu
```

### Backend Error: Module Not Found
```bash
cd server
npm install
cd ..
```

### Mobile Won't Connect
1. Check backend is running: `curl http://localhost:5000/api/health`
2. Update `EXPO_PUBLIC_API_URL` in `apps/mobile/.env.local`
3. For Android emulator: use `http://10.0.2.2:5000/api`
4. For physical device: use your IP like `http://192.168.1.100:5000/api`

---

## Project Scripts Reference

```bash
# Installation
npm install              # Install all dependencies

# Development
npm run dev             # Web + Backend (most common)
npm run dev:web        # Web only
npm run dev:server     # Backend only
npm run dev:mobile     # Mobile dev
npm run dev:all        # All three

# Building
npm run build:web      # Build web for production
npm run build:mobile   # Build mobile APK

# Testing
npm run test           # Run all tests
npm run test:server    # Server tests only
```

---

## What Happens When You Run Commands?

### `npm run dev`
- Starts Express server on `http://localhost:5000`
- Starts Vite dev server on `http://localhost:5173`
- Both watch for file changes
- Both reload automatically

### `npm run dev:mobile`
- Starts Expo development server
- Shows QR code in terminal
- Scan with Expo Go app on phone
- Reloads on file changes

### `npm run dev:all`
- Runs all three in parallel with `concurrently`
- Check all three ports are free before running

---

## Next Steps After Setup

1. **Explore the codebase:**
   - Web: `client/src/pages/` → `client/src/context/AuthContext.jsx`
   - Mobile: `apps/mobile/src/screens/` → `apps/mobile/src/context/AuthContext.tsx`
   - Shared: `packages/shared/src/constants/`

2. **Understand the auth flow:**
   - User signs up → JWT token returned → Stored
   - App restarts → Token restored → Auto-logged in

3. **Try the API directly:**
   ```bash
   curl http://localhost:5000/api/health
   ```

4. **Add your first feature:**
   - Create endpoint in `server/routes/`
   - Add API call in `web/` or `mobile/`
   - Add screen/component to show it

5. **Deploy when ready:**
   - Web: Vercel, Netlify
   - Server: Heroku, Railway, AWS
   - Mobile: EAS Build, Google Play Store

---

## Need Help?

1. Check individual READMEs:
   - `server/README.md`
   - `client/README.md`
   - `apps/mobile/README.md`
   - `packages/shared/README.md`

2. Read the full guide: `README_FULL.md`

3. Check backend logs for errors

4. Use browser DevTools for frontend issues

5. Use Expo console (`expo logs`) for mobile issues

---

Happy coding! 🚀
