#  Food Donation Mobile App

React Native mobile application for the Food Donation platform using Expo.

## Project Structure

```
src/
├── api/               - API client and endpoints
├── components/        - Reusable React Native components
├── config/            - Configuration and theme
├── context/           - React context (Auth)
├── hooks/             - Custom React hooks
├── navigation/        - React Navigation setup
├── screens/           - Screen components
└── index.tsx          - App entry point
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- Expo CLI: `npm install -g expo-cli`
- Android emulator or physical device (Android 8+)

### Install Dependencies
```bash
npm install
```

### Configure Backend URL

Edit `src/config/env.ts` and update `API_BASE_URL`:

```typescript
// For local development
const API_BASE_URL = 'http://192.168.1.100:5000/api'; // Your machine IP

// Or use your server URL
const API_BASE_URL = 'https://your-server.com/api';
```

## Running the App

### Start Expo Development Server
```bash
npm run start
```

### Run on Android Emulator
```bash
npm run start:android
```

###Run on Physical Android Device

1. Install Expo Go app from Google Play Store
2. Scan the QR code shown in terminal

### Run on Web (for testing UI)
```bash
npm run start:web
```

## Features

### User (Food Donor) Role
- View your donations
- Create new donation (with location)
- Track donation status
- Receive notifications

### Admin (NGO/Receiver) Role
- View available donations
- Claim donations
- Manage claimed donations
- Receive notifications

### Delivery Role
- View available delivery orders
- Accept delivery orders
- Mark orders as delivered
- Receive notifications

## API Integration

All API endpoints use the shared constants from `@food-donation/shared`:

### Authentication
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

- `POST /api/admin/auth/register` - NGO signup
- `POST /api/admin/auth/login` - NGO login

- `POST /api/delivery/auth/register` - Delivery signup
- `POST /api/delivery/auth/login` - Delivery login

### Core Features
- **Donations**: Create, view, manage food donations
- **Claims**: NGO can claim donations
- **Deliveries**: Delivery partners accept and complete orders
- **Notifications**: Real-time and persistent notifications

## Token Persistence

Tokens are stored in Expo AsyncStorage:
- `user_token` - User JWT
- `admin_token` - NGO/Admin JWT
- `delivery_token` - Delivery person JWT

Tokens are automatically restored when app launches.

## Location Services

The app uses `expo-location` for:
- Requesting location permission
- Getting device's current latitude/longitude
- Attaching coordinates to donations

Location is optional but recommended for better food discovery.

## Navigation Structure

### Auth Flow
```
auth
├── login
└── signup
```

### User App
```
user
├── dashboard (My Donations)
├── create-donation
├── notifications
└── profile
```

### Admin App
```
admin
├── dashboard (Available Food)
├── notifications
└── profile
```

### Delivery App
```
delivery
├── dashboard (Orders)
├── notifications
└── profile
```

## Hooks

### useAuth()
Access authentication state and methods:
```typescript
const { currentUser, currentRole, currentToken, logout } = useAuth();
```

### useAuthRole()
Check user's role quickly:
```typescript
const { isUser, isAdmin, isDelivery } = useAuthRole();
```

### useLocation()
Request and get device location:
```typescript
const { location, requestLocation, isLoading, error } = useLocation();
```

### useAsync()
Manage async operations:
```typescript
const { data, isLoading, error } = useAsync(() => fetchData());
```

## Error Handling

The app automatically handles:
- Network errors - shows user-friendly messages
- Invalid tokens - clears storage and redirects to login
- API errors - parses backend error messages

## Building for Android

### Create APK (Debug)
```bash
npm run build:android
```

### Create APK (Release)
```bash
eas build --platform android --profile production
```

Requires EAS Build setup: https://docs.expo.dev/build/setup/

## Troubleshooting

### "Cannot reach backend"
- Check backend is running (`npm run dev` in server/)
- Update `API_BASE_URL` to match your backend address
- On Android emulator, use your machine's IP: `10.0.2.2:5000`

### "Location permission denied"
- App will still work without location
- Manually enable location permission in device settings

### "AsyncStorage appears to be empty"
- First run: app initializes empty storage
- This is normal, login will populate it

### Button Presses Not Registering
- Ensure all imports of `Text` use `react-native` version
- Check screen is not covered by overlay
