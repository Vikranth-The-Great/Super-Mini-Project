/**
 * App.tsx - Entry point for React Native mobile app
 *
 * Flow:
 * 1. AuthProvider wraps the app to manage auth state and persistence
 * 2. RootNavigator handles routing based on auth state
 * 3. Splash screen shows while app initializes
 * 4. Auth navigator for unauthenticated users
 * 5. Role-based navigator for authenticated users (User/Admin/Delivery)
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { RootNavigator } from './navigation';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
