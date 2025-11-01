/**
 * Tab Navigator Component
 * Provides bottom tab navigation for role-based screens
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store/types';
import { theme } from '../constants/theme';
import { ROUTES } from './routes';

// Import screens
import FarmerDashboardScreen from '../screens/Farmer/FarmerDashboardScreen';
import TraderDashboardScreen from '../screens/Trader/TraderDashboardScreen';
import TransporterDashboardScreen from '../screens/Transporter/TransporterDashboardScreen';
import NotificationsScreen from '../screens/Shared/NotificationsScreen';
import ProfileScreen from '../screens/Shared/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Determine role-based colors
  const getRoleColors = () => {
    switch (user?.role) {
      case 'farmer':
        return theme.colors.farmer;
      case 'trader':
        return theme.colors.trader;
      case 'transporter':
        return theme.colors.transporter;
      default:
        return theme.colors.farmer;
    }
  };

  const roleColors = getRoleColors();

  // Get the appropriate dashboard screen based on role
  const getDashboardScreen = () => {
    switch (user?.role) {
      case 'farmer':
        return FarmerDashboardScreen;
      case 'trader':
        return TraderDashboardScreen;
      case 'transporter':
        return TransporterDashboardScreen;
      default:
        return FarmerDashboardScreen;
    }
  };

  const DashboardScreen = getDashboardScreen();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: roleColors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: theme.spacing.small,
          paddingTop: theme.spacing.small,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false, // We'll handle headers in individual screens
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME_TAB}
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.OFFERS_TAB}
        component={DashboardScreen} // This should be replaced with actual Offers screen
        options={{
          tabBarLabel: user?.role === 'farmer' ? 'My Offers' : 'Marketplace',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon
              name={user?.role === 'farmer' ? 'package-variant' : 'shopping'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.NOTIFICATIONS_TAB}
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="bell" color={color} size={size} />
          ),
          tabBarBadge: 3, // This should be dynamic based on unread notifications
          tabBarBadgeStyle: {
            backgroundColor: roleColors.primary,
          },
        }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE_TAB}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple icon component - in a real app, you'd use react-native-vector-icons or similar
const TabBarIcon = ({ name, color, size }: { name: string; color: string; size: number }) => {
  // This is a placeholder - you'd implement actual icons here
  return null; // Return actual icon component
};

export default TabNavigator;
