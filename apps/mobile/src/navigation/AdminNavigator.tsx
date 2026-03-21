import React from 'react';
import { Text as RNText } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminDashboardScreen, NotificationsScreen, ProfileScreen } from '../screens';
import { THEME } from '../config/env';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: THEME.colors.secondary,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Available Food',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20, color }}>🏢</RNText>,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20, color }}>🔔</RNText>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20, color }}>👤</RNText>,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Admin/NGO Navigator - NGO app
 * Shows available donations to claim, notifications, and profile
 */
export const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: THEME.colors.secondary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AdminHome"
        component={AdminTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
