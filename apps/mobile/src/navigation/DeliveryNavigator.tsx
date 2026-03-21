import React from 'react';
import { Text as RNText } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DeliveryDashboardScreen, NotificationsScreen, ProfileScreen } from '../screens';
import { THEME } from '../config/env';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DeliveryTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: THEME.colors.warning,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DeliveryDashboardScreen}
        options={{
          tabBarLabel: 'Deliveries',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20, color }}>🔄</RNText>,
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
 * Delivery Navigator - Delivery partner app
 * Shows delivery orders, notifications, and profile
 */
export const DeliveryNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: THEME.colors.warning,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="DeliveryHome"
        component={DeliveryTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
