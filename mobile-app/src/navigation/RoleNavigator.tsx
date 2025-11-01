import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store/types';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import FarmerDashboardScreen from '../screens/farmer/FarmerDashboardScreen';
import MarketPricesScreen from '../screens/market/MarketPricesScreen';
import PostHarvestScreen from '../screens/farmer/PostHarvestScreen';
import TransportStatusScreen from '../screens/transport/TransportStatusScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// Import types
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  MarketPrices: undefined;
  PostHarvest: undefined;
  Transport: undefined;
  Notifications: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={FarmerDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <span style={{ color, fontSize: size }}>🏠</span>
          ),
        }}
      />
      <Tab.Screen
        name="MarketPrices"
        component={MarketPricesScreen}
        options={{
          tabBarLabel: 'Market',
          tabBarIcon: ({ color, size }) => (
            <span style={{ color, fontSize: size }}>📊</span>
          ),
        }}
      />
      <Tab.Screen
        name="PostHarvest"
        component={PostHarvestScreen}
        options={{
          tabBarLabel: 'Harvest',
          tabBarIcon: ({ color, size }) => (
            <span style={{ color, fontSize: size }}>🌾</span>
          ),
        }}
      />
      <Tab.Screen
        name="Transport"
        component={TransportStatusScreen}
        options={{
          tabBarLabel: 'Transport',
          tabBarIcon: ({ color, size }) => (
            <span style={{ color, fontSize: size }}>🚛</span>
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <span style={{ color, fontSize: size }}>🔔</span>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
