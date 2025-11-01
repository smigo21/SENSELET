/**
 * Trader Dashboard Screen
 * Main screen for traders to view available crops, track shipments, and manage transactions
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Subheading, Paragraph, Button, List, Avatar, Divider, FAB, Chip, Badge, ProgressBar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../navigation/routes';

interface TraderDashboardData {
  availableOffers: Array<{
    id: string;
    crop: string;
    quantity: number;
    unit: string;
    price: number;
    farmer_name: string;
    farmer_location: string;
    distance: number;
    quality_grade: string;
    created_at: string;
  }>;
  activeShipments: Array<{
    id: string;
    crop: string;
    quantity: number;
    farmer_name: string;
    status: 'in_transit' | 'delayed' | 'arriving_soon';
    expected_arrival: string;
    current_location: string;
    temperature: number;
    alerts: string[];
  }>;
  transactionHistory: Array<{
    id: string;
    crop: string;
    quantity: number;
    farmer_name: string;
    amount: number;
    status: 'completed' | 'pending_payment' | 'cancelled';
    date: string;
  }>;
  notifications: Array<{
    id: string;
    type: 'shipment_alert' | 'price_update' | 'payment_due' | 'general';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

const TraderDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<TraderDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Mock API call - replace with actual API
      const mockData: TraderDashboardData = {
        availableOffers: [
          {
            id: '1',
            crop: 'Teff',
            quantity: 500,
            unit: 'kg',
            price: 42,
            farmer_name: 'Abebe Kebede',
            farmer_location: 'Holeta, Oromia',
            distance: 25,
            quality_grade: 'A',
            created_at: '2024-01-15'
          },
          {
            id: '2',
            crop: 'Wheat',
            quantity: 300,
            unit: 'kg',
            price: 35,
            farmer_name: 'Tigist Mengistu',
            farmer_location: 'Debre Birhan, Amhara',
            distance: 45,
            quality_grade: 'B',
            created_at: '2024-01-14'
          },
          {
            id: '3',
            crop: 'Maize',
            quantity: 200,
            unit: 'kg',
            price: 30,
            farmer_name: 'Dawit Assefa',
            farmer_location: 'Adama, Oromia',
            distance: 60,
            quality_grade: 'A',
            created_at: '2024-01-13'
          },
        ],
        activeShipments: [
          {
            id: '1',
            crop: 'Teff',
            quantity: 400,
            farmer_name: 'Abebe Kebede',
            status: 'in_transit',
            expected_arrival: '2024-01-16 14:00',
            current_location: 'En route to Addis Ababa',
            temperature: 22,
            alerts: []
          },
          {
            id: '2',
            crop: 'Wheat',
            quantity: 250,
            farmer_name: 'Tigist Mengistu',
            status: 'arriving_soon',
            expected_arrival: '2024-01-15 16:30',
            current_location: 'Approaching warehouse',
            temperature: 20,
            alerts: ['Temperature slightly elevated']
          },
        ],
        transactionHistory: [
          {
            id: '1',
            crop: 'Barley',
            quantity: 150,
            farmer_name: 'Solomon Tadesse',
            amount: 4500,
            status: 'completed',
            date: '2024-01-12'
          },
          {
            id: '2',
            crop: 'Teff',
            quantity: 300,
            farmer_name: 'Abebe Kebede',
            amount: 12600,
            status: 'pending_payment',
            date: '2024-01-14'
          },
        ],
        notifications: [
          {
            id: '1',
            type: 'shipment_alert',
            title: 'Shipment Delayed',
            message: 'Teff shipment from Abebe Kebede is running 2 hours late',
            timestamp: '2 hours ago',
            read: false
          },
          {
            id: '2',
            type: 'payment_due',
            title: 'Payment Due',
            message: 'Payment of ETB 12,600 for Teff is due in 2 days',
            timestamp: '4 hours ago',
            read: false
          },
        ],
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleBookOffer = (offerId: string) => {
    Alert.alert(
      'Book Offer',
      'Are you sure you want to book this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book', onPress: () => navigation.navigate('BookTransport') },
      ]
    );
  };

  const handleViewShipment = (shipmentId: string) => {
    navigation.navigate('ConfirmDelivery');
  };

  const handleViewNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleViewMarketplace = () => {
    navigation.navigate('Marketplace');
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit': return theme.colors.info;
      case 'arriving_soon': return theme.colors.success;
      case 'delayed': return theme.colors.warning;
      case 'completed': return theme.colors.success;
      case 'pending_payment': return theme.colors.warning;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  if (loading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <Paragraph>Loading dashboard...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.trader.primary }]}>
          <View style={styles.headerContent}>
            <Title style={styles.title}>Welcome, {user?.full_name}</Title>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar.Icon size={32} icon="account" style={styles.profileIcon} />
            </TouchableOpacity>
          </View>
          <Subheading style={styles.subtitle}>Manage your trades & track shipments</Subheading>
        </View>

        {/* Available Offers */}
        <Card style={styles.sectionCard}>
          <Card.Title
            title="Available Offers"
            titleStyle={styles.sectionTitle}
            right={(props) => (
              <TouchableOpacity onPress={handleViewMarketplace}>
                <Paragraph style={styles.viewAllText}>View All</Paragraph>
              </TouchableOpacity>
            )}
          />
          <Card.Content>
            {dashboardData?.availableOffers && dashboardData.availableOffers.length > 0 ? (
              dashboardData.availableOffers.slice(0, 3).map((offer, index) => (
                <View key={offer.id} style={styles.offerItem}>
                  <View style={styles.offerInfo}>
                    <Title style={styles.offerTitle}>{offer.crop} - {offer.quantity}{offer.unit}</Title>
                    <Paragraph style={styles.offerDetails}>
                      {offer.farmer_name} • {offer.farmer_location} ({offer.distance}km)
                    </Paragraph>
                    <View style={styles.offerMeta}>
                      <Paragraph style={styles.offerPrice}>{formatCurrency(offer.price)} per {offer.unit}</Paragraph>
                      <Chip style={styles.qualityChip} textStyle={styles.chipText}>
                        Grade {offer.quality_grade}
                      </Chip>
                    </View>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => handleBookOffer(offer.id)}
                    style={styles.bookButton}
                  >
                    Book
                  </Button>
                  {index < Math.min(dashboardData.availableOffers.length, 3) - 1 && <Divider style={styles.divider} />}
                </View>
              ))
            ) : (
              <Paragraph>No available offers at the moment</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Shipment Tracker */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Active Shipments" titleStyle={styles.sectionTitle} />
          <Card.Content>
            {dashboardData?.activeShipments && dashboardData.activeShipments.length > 0 ? (
              dashboardData.activeShipments.map((shipment, index) => (
                <View key={shipment.id} style={styles.shipmentItem}>
                  <View style={styles.shipmentInfo}>
                    <Title style={styles.shipmentTitle}>
                      {shipment.crop} - {shipment.quantity}kg
                    </Title>
                    <Paragraph style={styles.shipmentDetails}>
                      From: {shipment.farmer_name}
                    </Paragraph>
                    <Paragraph style={styles.shipmentLocation}>
                      📍 {shipment.current_location}
                    </Paragraph>
                    <View style={styles.shipmentMeta}>
                      <Paragraph style={styles.shipmentTime}>
                        Expected: {new Date(shipment.expected_arrival).toLocaleString()}
                      </Paragraph>
                      <Paragraph style={styles.shipmentTemp}>
                        🌡️ {shipment.temperature}°C
                      </Paragraph>
                    </View>
                    {shipment.alerts.length > 0 && (
                      <View style={styles.alertsContainer}>
                        {shipment.alerts.map((alert, alertIndex) => (
                          <Chip
                            key={alertIndex}
                            style={styles.alertChip}
                            textStyle={styles.alertText}
                            icon="alert"
                          >
                            {alert}
                          </Chip>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.shipmentActions}>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(shipment.status) }]}
                      textStyle={styles.statusText}
                    >
                      {shipment.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleViewShipment(shipment.id)}
                      style={styles.trackButton}
                    >
                      Track
                    </Button>
                  </View>
                  {index < dashboardData.activeShipments.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))
            ) : (
              <Paragraph>No active shipments</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Transaction History */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Recent Transactions" titleStyle={styles.sectionTitle} />
          <Card.Content>
            {dashboardData?.transactionHistory && dashboardData.transactionHistory.length > 0 ? (
              dashboardData.transactionHistory.map((transaction, index) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Title style={styles.transactionTitle}>
                      {transaction.crop} - {transaction.quantity}kg
                    </Title>
                    <Paragraph style={styles.transactionDetails}>
                      {transaction.farmer_name} • {new Date(transaction.date).toLocaleDateString()}
                    </Paragraph>
                  </View>
                  <View style={styles.transactionMeta}>
                    <Paragraph style={styles.transactionAmount}>
                      {formatCurrency(transaction.amount)}
                    </Paragraph>
                    <Chip
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(transaction.status) }
                      ]}
                      textStyle={styles.statusText}
                    >
                      {transaction.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                  </View>
                  {index < dashboardData.transactionHistory.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))
            ) : (
              <Paragraph>No transaction history</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Notifications */}
        <Card style={styles.sectionCard}>
          <Card.Title
            title="Notifications"
            titleStyle={styles.sectionTitle}
            right={(props) => (
              <TouchableOpacity onPress={handleViewNotifications}>
                <Paragraph style={styles.viewAllText}>View All</Paragraph>
              </TouchableOpacity>
            )}
          />
          <Card.Content>
            {dashboardData?.notifications && dashboardData.notifications.length > 0 ? (
              dashboardData.notifications.slice(0, 3).map((notification, index) => (
                <View key={notification.id} style={styles.notificationItem}>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Title style={styles.notificationTitle}>{notification.title}</Title>
                      {!notification.read && <Badge style={styles.unreadBadge} />}
                    </View>
                    <Paragraph style={styles.notificationMessage}>{notification.message}</Paragraph>
                    <Paragraph style={styles.notificationTime}>{notification.timestamp}</Paragraph>
                  </View>
                  <Avatar.Icon
                    size={24}
                    icon={
                      notification.type === 'shipment_alert' ? 'truck-alert' :
                      notification.type === 'payment_due' ? 'cash' :
                      notification.type === 'price_update' ? 'trending-up' : 'bell'
                    }
                    style={styles.notificationIcon}
                  />
                  {index < Math.min(dashboardData.notifications.length, 3) - 1 && <Divider style={styles.divider} />}
                </View>
              ))
            ) : (
              <Paragraph>No notifications</Paragraph>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <FAB
          icon="shopping"
          label="Book Farmer Offer"
          onPress={handleViewMarketplace}
          style={styles.fab}
        />
        <FAB
          icon="truck"
          label="Track Shipment"
          onPress={() => navigation.navigate('ConfirmDelivery')}
          style={[styles.fab, styles.secondaryFab]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  profileIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: theme.spacing.small,
  },
  sectionCard: {
    margin: theme.spacing.medium,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  offerDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.xs,
  },
  offerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  qualityChip: {
    backgroundColor: '#e8f5e8',
  },
  chipText: {
    fontSize: 10,
  },
  bookButton: {
    marginLeft: theme.spacing.small,
  },
  divider: {
    marginVertical: theme.spacing.small,
  },
  shipmentItem: {
    paddingVertical: theme.spacing.small,
  },
  shipmentInfo: {
    marginBottom: theme.spacing.small,
  },
  shipmentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  shipmentDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.xs,
  },
  shipmentLocation: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  shipmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  shipmentTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  shipmentTemp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  alertsContainer: {
    marginTop: theme.spacing.small,
  },
  alertChip: {
    backgroundColor: theme.colors.warning,
    marginRight: theme.spacing.small,
    marginBottom: theme.spacing.xs,
  },
  alertText: {
    color: 'white',
    fontSize: 10,
  },
  shipmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusChip: {
    marginRight: theme.spacing.small,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
  },
  trackButton: {
    marginLeft: theme.spacing.small,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.xs,
  },
  transactionMeta: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.small,
  },
  notificationContent: {
    flex: 1,
    marginRight: theme.spacing.small,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.small,
  },
  notificationMessage: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  notificationTime: {
    fontSize: 11,
    color: 'gray',
  },
  notificationIcon: {
    backgroundColor: 'transparent',
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.medium,
    bottom: theme.spacing.medium,
  },
  fab: {
    marginVertical: theme.spacing.xs,
  },
  secondaryFab: {
    backgroundColor: theme.colors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TraderDashboardScreen;
