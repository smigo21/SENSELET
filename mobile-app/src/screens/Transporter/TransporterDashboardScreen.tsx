/**
 * Transporter Dashboard Screen
 * Main screen for transporters to manage trips, track routes, and verify deliveries
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Card, Title, Subheading, Paragraph, Button, List, Avatar, Divider, Chip, ProgressBar, FAB, Badge } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../navigation/routes';

interface TransporterDashboardData {
  assignedTrips: Array<{
    id: string;
    pickup_location: string;
    dropoff_location: string;
    cargo_type: string;
    cargo_quantity: number;
    cargo_unit: string;
    farmer_name: string;
    trader_name: string;
    status: 'not_started' | 'in_transit' | 'delivered' | 'cancelled';
    scheduled_pickup: string;
    estimated_delivery: string;
    distance: number;
    checkpoints: Array<{
      id: string;
      location: string;
      type: 'pickup' | 'checkpoint' | 'dropoff';
      status: 'pending' | 'completed' | 'current';
      qr_code?: string;
    }>;
  }>;
  currentTrip?: {
    id: string;
    current_location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    next_checkpoint: {
      id: string;
      location: string;
      distance: number;
      eta: string;
    };
    progress: number;
    temperature: number;
    alerts: string[];
  };
  tripHistory: Array<{
    id: string;
    pickup_location: string;
    dropoff_location: string;
    cargo_type: string;
    cargo_quantity: number;
    cargo_unit: string;
    completed_at: string;
    duration: string;
    status: 'completed' | 'cancelled';
  }>;
  notifications: Array<{
    id: string;
    type: 'new_trip' | 'checkpoint_alert' | 'delay_warning' | 'general';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

const TransporterDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<TransporterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Mock API call - replace with actual API
      const mockData: TransporterDashboardData = {
        assignedTrips: [
          {
            id: '1',
            pickup_location: 'Holeta, Oromia',
            dropoff_location: 'Piassa Market, Addis Ababa',
            cargo_type: 'Teff',
            cargo_quantity: 500,
            cargo_unit: 'kg',
            farmer_name: 'Abebe Kebede',
            trader_name: 'Solomon Tadesse',
            status: 'not_started',
            scheduled_pickup: '2024-01-16 08:00',
            estimated_delivery: '2024-01-16 12:00',
            distance: 45,
            checkpoints: [
              {
                id: '1',
                location: 'Holeta Farm',
                type: 'pickup',
                status: 'pending',
                qr_code: 'QR123456'
              },
              {
                id: '2',
                location: 'Debre Libanos Checkpoint',
                type: 'checkpoint',
                status: 'pending',
                qr_code: 'QR789012'
              },
              {
                id: '3',
                location: 'Piassa Market',
                type: 'dropoff',
                status: 'pending',
                qr_code: 'QR345678'
              },
            ],
          },
          {
            id: '2',
            pickup_location: 'Debre Birhan, Amhara',
            dropoff_location: 'Merkato, Addis Ababa',
            cargo_type: 'Wheat',
            cargo_quantity: 300,
            cargo_unit: 'kg',
            farmer_name: 'Tigist Mengistu',
            trader_name: 'Dawit Assefa',
            status: 'in_transit',
            scheduled_pickup: '2024-01-15 09:00',
            estimated_delivery: '2024-01-15 14:00',
            distance: 120,
            checkpoints: [
              {
                id: '4',
                location: 'Debre Birhan Farm',
                type: 'pickup',
                status: 'completed',
                qr_code: 'QR901234'
              },
              {
                id: '5',
                location: 'Shewa Robit Checkpoint',
                type: 'checkpoint',
                status: 'current',
                qr_code: 'QR567890'
              },
              {
                id: '6',
                location: 'Merkato',
                type: 'dropoff',
                status: 'pending',
                qr_code: 'QR123789'
              },
            ],
          },
        ],
        currentTrip: {
          id: '2',
          current_location: {
            latitude: 9.1450,
            longitude: 38.7319,
            address: 'En route to Addis Ababa'
          },
          next_checkpoint: {
            id: '5',
            location: 'Shewa Robit Checkpoint',
            distance: 25,
            eta: '45 minutes'
          },
          progress: 0.6,
          temperature: 24,
          alerts: ['Temperature slightly elevated']
        },
        tripHistory: [
          {
            id: '3',
            pickup_location: 'Adama, Oromia',
            dropoff_location: 'Kazanchis Market, Addis Ababa',
            cargo_type: 'Maize',
            cargo_quantity: 200,
            cargo_unit: 'kg',
            completed_at: '2024-01-14 16:30',
            duration: '4h 30m',
            status: 'completed'
          },
          {
            id: '4',
            pickup_location: 'Bahir Dar, Amhara',
            dropoff_location: 'Shiro Meda Market, Addis Ababa',
            cargo_type: 'Barley',
            cargo_quantity: 150,
            cargo_unit: 'kg',
            completed_at: '2024-01-13 14:15',
            duration: '6h 45m',
            status: 'completed'
          },
        ],
        notifications: [
          {
            id: '1',
            type: 'new_trip',
            title: 'New Trip Assigned',
            message: 'Teff delivery from Holeta to Addis Ababa has been assigned to you',
            timestamp: '2 hours ago',
            read: false
          },
          {
            id: '2',
            type: 'checkpoint_alert',
            title: 'Checkpoint Approaching',
            message: 'You are approaching Shewa Robit Checkpoint. Prepare QR code.',
            timestamp: '30 minutes ago',
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

  const handleStartTrip = (tripId: string) => {
    Alert.alert(
      'Start Trip',
      'Are you sure you want to start this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => navigation.navigate('RouteStatus') },
      ]
    );
  };

  const handleScanQR = (checkpointId: string) => {
    navigation.navigate('QRScan');
  };

  const handleMarkDelivered = (tripId: string) => {
    Alert.alert(
      'Mark as Delivered',
      'Confirm that the cargo has been delivered successfully?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Delivery', onPress: () => {
          // Update trip status logic here
          Alert.alert('Success', 'Delivery marked as completed!');
        }},
      ]
    );
  };

  const handleViewNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleViewTripList = () => {
    navigation.navigate('TripList');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return theme.colors.info;
      case 'in_transit': return theme.colors.primary;
      case 'delivered': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      case 'pending': return theme.colors.textSecondary;
      case 'completed': return theme.colors.success;
      case 'current': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const getCheckpointIcon = (type: string) => {
    switch (type) {
      case 'pickup': return 'package-up';
      case 'checkpoint': return 'map-marker';
      case 'dropoff': return 'package-down';
      default: return 'map-marker';
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
        <View style={[styles.header, { backgroundColor: theme.colors.transporter.primary }]}>
          <View style={styles.headerContent}>
            <Title style={styles.title}>Welcome, {user?.full_name}</Title>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar.Icon size={32} icon="account" style={styles.profileIcon} />
            </TouchableOpacity>
          </View>
          <Subheading style={styles.subtitle}>Manage your deliveries & track routes</Subheading>
        </View>

        {/* Current Trip Status */}
        {dashboardData?.currentTrip && (
          <Card style={styles.sectionCard}>
            <Card.Title title="Current Trip" titleStyle={styles.sectionTitle} />
            <Card.Content>
              <View style={styles.currentTripContainer}>
                <View style={styles.tripProgress}>
                  <Paragraph style={styles.progressLabel}>Trip Progress</Paragraph>
                  <ProgressBar progress={dashboardData.currentTrip.progress} color={theme.colors.primary} style={styles.progressBar} />
                  <Paragraph style={styles.progressText}>
                    {Math.round(dashboardData.currentTrip.progress * 100)}% Complete
                  </Paragraph>
                </View>

                <View style={styles.tripDetails}>
                  <Paragraph style={styles.locationText}>
                    📍 {dashboardData.currentTrip.current_location.address}
                  </Paragraph>
                  <Paragraph style={styles.nextCheckpointText}>
                    Next: {dashboardData.currentTrip.next_checkpoint.location} ({dashboardData.currentTrip.next_checkpoint.distance}km, {dashboardData.currentTrip.next_checkpoint.eta})
                  </Paragraph>
                  <View style={styles.tripMetaCurrent}>
                    <Paragraph style={styles.tempText}>🌡️ {dashboardData.currentTrip.temperature}°C</Paragraph>
                  </View>
                </View>

                {dashboardData.currentTrip.alerts.length > 0 && (
                  <View style={styles.alertsContainer}>
                    {dashboardData.currentTrip.alerts.map((alert, index) => (
                      <Chip
                        key={index}
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
            </Card.Content>
          </Card>
        )}

        {/* Assigned Trips */}
        <Card style={styles.sectionCard}>
          <Card.Title
            title="Assigned Trips"
            titleStyle={styles.sectionTitle}
            right={(props) => (
              <TouchableOpacity onPress={handleViewTripList}>
                <Paragraph style={styles.viewAllText}>View All</Paragraph>
              </TouchableOpacity>
            )}
          />
          <Card.Content>
            {dashboardData?.assignedTrips && dashboardData.assignedTrips.length > 0 ? (
              dashboardData.assignedTrips.map((trip, index) => (
                <View key={trip.id} style={styles.tripItem}>
                  <View style={styles.tripInfo}>
                    <Title style={styles.tripTitle}>
                      {trip.cargo_type} - {trip.cargo_quantity}{trip.cargo_unit}
                    </Title>
                    <Paragraph style={styles.tripRoute}>
                      {trip.pickup_location} → {trip.dropoff_location}
                    </Paragraph>
                    <Paragraph style={styles.tripDetails}>
                      Farmer: {trip.farmer_name} | Trader: {trip.trader_name}
                    </Paragraph>
                    <View style={styles.tripMeta}>
                      <Paragraph style={styles.tripTime}>
                        Pickup: {new Date(trip.scheduled_pickup).toLocaleString()}
                      </Paragraph>
                      <Paragraph style={styles.tripDistance}>
                        {trip.distance}km
                      </Paragraph>
                    </View>
                  </View>

                  <View style={styles.tripActions}>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(trip.status) }]}
                      textStyle={styles.statusText}
                    >
                      {trip.status.replace('_', ' ').toUpperCase()}
                    </Chip>

                    {trip.status === 'not_started' && (
                      <Button
                        mode="contained"
                        compact
                        onPress={() => handleStartTrip(trip.id)}
                        style={styles.actionButton}
                      >
                        Start Trip
                      </Button>
                    )}

                    {trip.status === 'in_transit' && (
                      <View style={styles.inTransitActions}>
                        <Button
                          mode="outlined"
                          compact
                          onPress={() => handleScanQR(trip.checkpoints.find(c => c.status === 'current')?.id || '')}
                          style={styles.scanButton}
                        >
                          Scan QR
                        </Button>
                        <Button
                          mode="contained"
                          compact
                          onPress={() => handleMarkDelivered(trip.id)}
                          style={styles.deliverButton}
                        >
                          Mark Delivered
                        </Button>
                      </View>
                    )}
                  </View>

                  {/* Checkpoints */}
                  <View style={styles.checkpointsContainer}>
                    {trip.checkpoints.map((checkpoint, checkpointIndex) => (
                      <View key={checkpoint.id} style={styles.checkpointItem}>
                        <Avatar.Icon
                          size={24}
                          icon={getCheckpointIcon(checkpoint.type)}
                          style={[
                            styles.checkpointIcon,
                            { backgroundColor: getStatusColor(checkpoint.status) }
                          ]}
                        />
                        <View style={styles.checkpointInfo}>
                          <Paragraph style={styles.checkpointLocation}>
                            {checkpoint.location}
                          </Paragraph>
                          <Paragraph style={styles.checkpointType}>
                            {checkpoint.type.toUpperCase()}
                          </Paragraph>
                        </View>
                        <Chip
                          style={[styles.checkpointStatusChip, { backgroundColor: getStatusColor(checkpoint.status) }]}
                          textStyle={styles.checkpointStatusText}
                        >
                          {checkpoint.status.toUpperCase()}
                        </Chip>
                      </View>
                    ))}
                  </View>

                  {index < dashboardData.assignedTrips.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))
            ) : (
              <Paragraph>No assigned trips at the moment</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Trip History */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Recent Deliveries" titleStyle={styles.sectionTitle} />
          <Card.Content>
            {dashboardData?.tripHistory && dashboardData.tripHistory.length > 0 ? (
              dashboardData.tripHistory.map((trip, index) => (
                <View key={trip.id} style={styles.historyItem}>
                  <View style={styles.historyInfo}>
                    <Title style={styles.historyTitle}>
                      {trip.cargo_type} - {trip.cargo_quantity}{trip.cargo_unit}
                    </Title>
                    <Paragraph style={styles.historyRoute}>
                      {trip.pickup_location} → {trip.dropoff_location}
                    </Paragraph>
                    <Paragraph style={styles.historyTime}>
                      Completed: {new Date(trip.completed_at).toLocaleString()} ({trip.duration})
                    </Paragraph>
                  </View>
                  <Chip
                    style={[styles.historyStatusChip, { backgroundColor: getStatusColor(trip.status) }]}
                    textStyle={styles.historyStatusText}
                  >
                    {trip.status.toUpperCase()}
                  </Chip>
                  {index < dashboardData.tripHistory.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))
            ) : (
              <Paragraph>No trip history</Paragraph>
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
                      notification.type === 'new_trip' ? 'truck-plus' :
                      notification.type === 'checkpoint_alert' ? 'map-marker-alert' :
                      notification.type === 'delay_warning' ? 'clock-alert' : 'bell'
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
          icon="truck"
          label="Start Trip"
          onPress={() => handleStartTrip(dashboardData?.assignedTrips.find(t => t.status === 'not_started')?.id || '')}
          style={styles.fab}
        />
        <FAB
          icon="qrcode-scan"
          label="Scan QR"
          onPress={() => handleScanQR('')}
          style={[styles.fab, styles.secondaryFab]}
        />
        <FAB
          icon="check-circle"
          label="Mark Delivered"
          onPress={() => handleMarkDelivered(dashboardData?.currentTrip?.id || '')}
          style={[styles.fab, styles.tertiaryFab]}
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
  currentTripContainer: {
    paddingVertical: theme.spacing.small,
  },
  tripProgress: {
    marginBottom: theme.spacing.medium,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  tripDetails: {
    marginBottom: theme.spacing.small,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  nextCheckpointText: {
    fontSize: 13,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  tempText: {
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
  tripItem: {
    paddingVertical: theme.spacing.small,
  },
  tripInfo: {
    marginBottom: theme.spacing.small,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tripRoute: {
    fontSize: 14,
    color: theme.colors.primary,
    marginVertical: theme.spacing.xs,
  },
  tripDetails: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  tripMetaCurrent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  tripTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tripDistance: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tripActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.small,
  },
  statusChip: {
    marginRight: theme.spacing.small,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
  },
  actionButton: {
    marginLeft: theme.spacing.small,
  },
  inTransitActions: {
    flexDirection: 'row',
    marginLeft: theme.spacing.small,
  },
  scanButton: {
    marginRight: theme.spacing.small,
  },
  deliverButton: {
    marginLeft: theme.spacing.small,
  },
  checkpointsContainer: {
    marginTop: theme.spacing.small,
  },
  checkpointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  checkpointIcon: {
    marginRight: theme.spacing.small,
  },
  checkpointInfo: {
    flex: 1,
  },
  checkpointLocation: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkpointType: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  checkpointStatusChip: {
    marginLeft: theme.spacing.small,
  },
  checkpointStatusText: {
    color: 'white',
    fontSize: 10,
  },
  divider: {
    marginVertical: theme.spacing.small,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyRoute: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.xs,
  },
  historyTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  historyStatusChip: {
    marginLeft: theme.spacing.small,
  },
  historyStatusText: {
    color: 'white',
    fontSize: 10,
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
    backgroundColor: theme.colors.transporter.primary,
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
  tertiaryFab: {
    backgroundColor: theme.colors.success,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransporterDashboardScreen;
