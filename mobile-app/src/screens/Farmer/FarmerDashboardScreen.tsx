/**
 * Farmer Dashboard Screen
 * Main screen for farmers to view market prices, record crops, track sales, and access notifications
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Subheading, Paragraph, Button, List, Avatar, Divider, FAB, Chip, Badge } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../navigation/routes';

interface DashboardData {
  marketPrices: Array<{
    crop: string;
    price: number;
    change: number;
    market: string;
    region: string;
  }>;
  yourOffers: Array<{
    id: string;
    crop: string;
    quantity: number;
    unit: string;
    price: number;
    status: 'pending' | 'sold' | 'delivered';
    created_at: string;
  }>;
  notifications: Array<{
    id: string;
    type: 'price_alert' | 'buyer_request' | 'cold_storage' | 'general';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  coldStorage: {
    available: boolean;
    capacity: number;
    used: number;
    temperature: number;
  };
}

const FarmerDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Mock API call - replace with actual API
      const mockData: DashboardData = {
        marketPrices: [
          { crop: 'Teff', price: 45, change: 2.5, market: 'Merkato', region: 'Addis Ababa' },
          { crop: 'Wheat', price: 38, change: -1.2, market: 'Piassa', region: 'Addis Ababa' },
          { crop: 'Maize', price: 32, change: 0.8, market: 'Merkato', region: 'Addis Ababa' },
          { crop: 'Barley', price: 28, change: 3.1, market: 'Piassa', region: 'Addis Ababa' },
        ],
        yourOffers: [
          { id: '1', crop: 'Teff', quantity: 500, unit: 'kg', price: 42, status: 'pending', created_at: '2024-01-15' },
          { id: '2', crop: 'Wheat', quantity: 300, unit: 'kg', price: 35, status: 'sold', created_at: '2024-01-14' },
          { id: '3', crop: 'Maize', quantity: 200, unit: 'kg', price: 30, status: 'delivered', created_at: '2024-01-13' },
        ],
        notifications: [
          { id: '1', type: 'price_alert', title: 'Teff Price Increased', message: 'Teff prices have increased by 2.5% in Merkato market', timestamp: '2 hours ago', read: false },
          { id: '2', type: 'buyer_request', title: 'New Buyer Request', message: 'Buyer interested in your 500kg Teff offer', timestamp: '4 hours ago', read: false },
          { id: '3', type: 'cold_storage', title: 'Cold Storage Available', message: 'Cold storage facility in your area has 200kg capacity available', timestamp: '1 day ago', read: true },
        ],
        coldStorage: {
          available: true,
          capacity: 1000,
          used: 800,
          temperature: 4,
        },
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

  const handleAddNewHarvest = () => {
    navigation.navigate('CreateOffer');
  };

  const handleViewNearbyTraders = () => {
    // Navigate to traders list or marketplace
    navigation.navigate('Marketplace');
  };

  const handleViewPrices = () => {
    navigation.navigate('PriceView');
  };

  const handleViewNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleEditOffer = (offerId: string) => {
    // Navigate to edit offer screen
    Alert.alert('Edit Offer', `Edit offer ${offerId}`);
  };

  const handleCancelOffer = (offerId: string) => {
    Alert.alert(
      'Cancel Offer',
      'Are you sure you want to cancel this offer?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => console.log(`Cancel offer ${offerId}`) },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString()}`;
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
        <View style={[styles.header, { backgroundColor: theme.colors.farmer.primary }]}>
          <View style={styles.headerContent}>
            <Title style={styles.title}>Welcome, {user?.full_name}</Title>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar.Icon size={32} icon="account" style={styles.profileIcon} />
            </TouchableOpacity>
          </View>
          <Subheading style={styles.subtitle}>Manage your farm & track your sales</Subheading>
        </View>

        {/* Market Prices Widget - Prominent */}
        <Card style={styles.marketPricesCard}>
          <Card.Title
            title="Market Prices"
            titleStyle={styles.sectionTitle}
            right={(props) => (
              <TouchableOpacity onPress={handleViewPrices}>
                <Paragraph style={styles.viewAllText}>View All</Paragraph>
              </TouchableOpacity>
            )}
          />
          <Card.Content>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceScroll}>
              {dashboardData?.marketPrices && dashboardData.marketPrices.length > 0 ? (
                dashboardData.marketPrices.map((price, index) => (
                  <View key={index} style={styles.priceCard}>
                    <Title style={styles.cropName}>{price.crop}</Title>
                    <Paragraph style={styles.marketName}>{price.market}</Paragraph>
                    <Paragraph style={styles.priceValue}>{formatCurrency(price.price)}</Paragraph>
                    <View style={styles.priceChangeContainer}>
                      <Paragraph style={[
                        styles.priceChange,
                        price.change >= 0 ? styles.priceUp : styles.priceDown
                      ]}>
                        {price.change >= 0 ? '↑' : '↓'} {Math.abs(price.change)}%
                      </Paragraph>
                    </View>
                  </View>
                ))
              ) : (
                <Paragraph>No market price data available</Paragraph>
              )}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Your Offers */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Your Offers" titleStyle={styles.sectionTitle} />
          <Card.Content>
            {dashboardData?.yourOffers && dashboardData.yourOffers.length > 0 ? (
              dashboardData.yourOffers.map((offer, index) => (
                <View key={offer.id} style={styles.offerItem}>
                  <View style={styles.offerInfo}>
                    <Title style={styles.offerTitle}>{offer.crop} - {offer.quantity}{offer.unit}</Title>
                    <Paragraph style={styles.offerPrice}>{formatCurrency(offer.price)} per {offer.unit}</Paragraph>
                    <Chip
                      style={[
                        styles.statusChip,
                        offer.status === 'pending' && styles.pendingChip,
                        offer.status === 'sold' && styles.soldChip,
                        offer.status === 'delivered' && styles.deliveredChip,
                      ]}
                      textStyle={styles.chipText}
                    >
                      {offer.status.toUpperCase()}
                    </Chip>
                  </View>
                  <View style={styles.offerActions}>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleEditOffer(offer.id)}
                      style={styles.editButton}
                    >
                      Edit
                    </Button>
                    {offer.status === 'pending' && (
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => handleCancelOffer(offer.id)}
                        style={styles.cancelButton}
                      >
                        Cancel
                      </Button>
                    )}
                  </View>
                  {index < dashboardData.yourOffers.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))
            ) : (
              <Paragraph>No offers yet. Add your first harvest!</Paragraph>
            )}
            <Button
              mode="contained"
              onPress={handleAddNewHarvest}
              style={styles.addOfferButton}
              icon="plus"
            >
              Add New Harvest
            </Button>
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
                      notification.type === 'price_alert' ? 'trending-up' :
                      notification.type === 'buyer_request' ? 'account-plus' :
                      notification.type === 'cold_storage' ? 'snowflake' : 'bell'
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

        {/* Cold Storage Availability */}
        {dashboardData?.coldStorage && (
          <Card style={styles.sectionCard}>
            <Card.Title title="Cold Storage" titleStyle={styles.sectionTitle} />
            <Card.Content>
              <View style={styles.coldStorageInfo}>
                <View style={styles.storageStats}>
                  <Paragraph>Capacity: {dashboardData.coldStorage.capacity}kg</Paragraph>
                  <Paragraph>Available: {dashboardData.coldStorage.capacity - dashboardData.coldStorage.used}kg</Paragraph>
                  <Paragraph>Temperature: {dashboardData.coldStorage.temperature}°C</Paragraph>
                </View>
                <View style={styles.storageIndicator}>
                  <View style={styles.storageBar}>
                    <View
                      style={[
                        styles.storageUsed,
                        { width: `${(dashboardData.coldStorage.used / dashboardData.coldStorage.capacity) * 100}%` }
                      ]}
                    />
                  </View>
                  <Paragraph style={styles.storageText}>
                    {dashboardData.coldStorage.available ? 'Available' : 'Full'}
                  </Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          label="Add New Harvest"
          onPress={handleAddNewHarvest}
          style={styles.fab}
        />
        <FAB
          icon="account-group"
          label="View Nearby Traders"
          onPress={handleViewNearbyTraders}
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
  marketPricesCard: {
    margin: theme.spacing.medium,
    elevation: 3,
    backgroundColor: 'white',
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
  priceScroll: {
    marginVertical: theme.spacing.small,
  },
  priceCard: {
    backgroundColor: '#f8f9fa',
    padding: theme.spacing.medium,
    marginRight: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    minWidth: 140,
    alignItems: 'center',
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  marketName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.xs,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  priceChangeContainer: {
    marginTop: theme.spacing.xs,
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceUp: {
    color: theme.colors.success,
  },
  priceDown: {
    color: theme.colors.error,
  },
  offerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  offerPrice: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.xs,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  pendingChip: {
    backgroundColor: '#fff3cd',
  },
  soldChip: {
    backgroundColor: '#d4edda',
  },
  deliveredChip: {
    backgroundColor: '#cce5ff',
  },
  chipText: {
    fontSize: 10,
  },
  offerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginRight: theme.spacing.small,
  },
  cancelButton: {
    marginRight: theme.spacing.small,
  },
  divider: {
    marginVertical: theme.spacing.small,
  },
  addOfferButton: {
    marginTop: theme.spacing.medium,
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
  coldStorageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageStats: {
    flex: 1,
  },
  storageIndicator: {
    alignItems: 'center',
    marginLeft: theme.spacing.medium,
  },
  storageBar: {
    width: 100,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: theme.spacing.small,
  },
  storageUsed: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  storageText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
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

export default FarmerDashboardScreen;
