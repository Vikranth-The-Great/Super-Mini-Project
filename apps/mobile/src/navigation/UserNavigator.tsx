import React from 'react';
import { Text as RNText } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserDashboardScreen, CreateDonationScreen, NotificationsScreen, ProfileScreen } from '../screens';
import { THEME } from '../config/env';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const UserTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={UserDashboardScreen}
        options={{
          tabBarLabel: 'My Donations',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20, color }}>🍎</RNText>,
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
 * User Navigator - Food donor app
 * Shows donation list, create donation, notifications, and profile
 */
export const UserNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: THEME.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="UserHome"
        component={UserTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateDonation"
        component={CreateDonationScreen}
        options={{
          title: 'Create Donation',
        }}
      />
    </Stack.Navigator>
  );
};
