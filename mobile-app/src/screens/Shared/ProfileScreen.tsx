/**
 * Profile Screen
 * User profile management screen
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, Divider, List, Switch } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/types';
import { logout } from '../../store/slices/authSlice';
import { theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../navigation/routes';

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => dispatch(logout()) },
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };

  const handleChangePassword = () => {
    // Navigate to change password screen
    Alert.alert('Change Password', 'Password change coming soon!');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'support@eatms.et\n+251-911-123-456');
  };

  const handleAbout = () => {
    Alert.alert(
      'About EATMS',
      'Ethiopian Agri-Chain Transparency and Monitoring System\nVersion 1.0.0\n\nBringing transparency to Ethiopia\'s agricultural supply chain.'
    );
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'farmer': return 'Farmer';
      case 'trader': return 'Trader';
      case 'transporter': return 'Transporter';
      default: return 'User';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer': return theme.colors.farmer.primary;
      case 'trader': return theme.colors.trader.primary;
      case 'transporter': return theme.colors.transporter.primary;
      default: return theme.colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: getRoleColor(user?.role || 'farmer') }]}>
        <Avatar.Text
          size={80}
          label={user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
          style={styles.avatar}
        />
        <Title style={styles.name}>{user?.full_name}</Title>
        <Paragraph style={styles.role}>{getRoleDisplayName(user?.role || 'user')}</Paragraph>
        <Paragraph style={styles.phone}>{user?.phone_number}</Paragraph>
      </View>

      {/* Account Settings */}
      <Card style={styles.card}>
        <Card.Title title="Account Settings" titleStyle={styles.cardTitle} />
        <Card.Content>
          <TouchableOpacity style={styles.listItem} onPress={handleEditProfile}>
            <List.Item
              title="Edit Profile"
              left={props => <List.Icon {...props} icon="account-edit" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableOpacity>
          <Divider />

          <TouchableOpacity style={styles.listItem} onPress={handleChangePassword}>
            <List.Item
              title="Change Password"
              left={props => <List.Icon {...props} icon="lock-reset" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* App Settings */}
      <Card style={styles.card}>
        <Card.Title title="App Settings" titleStyle={styles.cardTitle} />
        <Card.Content>
          <View style={styles.settingItem}>
            <List.Item
              title="Push Notifications"
              description="Receive alerts for shipments and payments"
              left={props => <List.Icon {...props} icon="bell" />}
            />
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color={getRoleColor(user?.role || 'farmer')}
            />
          </View>
          <Divider />

          <View style={styles.settingItem}>
            <List.Item
              title="Location Services"
              description="Allow location tracking for deliveries"
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              color={getRoleColor(user?.role || 'farmer')}
            />
          </View>
          <Divider />

          <View style={styles.settingItem}>
            <List.Item
              title="Biometric Login"
              description="Use fingerprint/face ID to login"
              left={props => <List.Icon {...props} icon="fingerprint" />}
            />
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              color={getRoleColor(user?.role || 'farmer')}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Support & About */}
      <Card style={styles.card}>
        <Card.Title title="Support & About" titleStyle={styles.cardTitle} />
        <Card.Content>
          <TouchableOpacity style={styles.listItem} onPress={handleContactSupport}>
            <List.Item
              title="Contact Support"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableOpacity>
          <Divider />

          <TouchableOpacity style={styles.listItem} onPress={handleAbout}>
            <List.Item
              title="About EATMS"
              left={props => <List.Icon {...props} icon="information" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          color={theme.colors.error}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  avatar: {
    marginBottom: theme.spacing.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  role: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  phone: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  card: {
    margin: theme.spacing.medium,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listItem: {
    paddingVertical: theme.spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  logoutContainer: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.xl,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
});

export default ProfileScreen;
