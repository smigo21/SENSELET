import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShipments, updateShipmentStatus } from '../../store/slices/shipmentsSlice';
import { RootState } from '../../store/types';
import { theme } from '../../constants/theme';

interface ShipmentItem {
  id: string;
  crop_id: string;
  transporter_id: string;
  origin: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  estimated_arrival: string;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  temperature: number;
  humidity: number;
  alerts: string[];
}

const TransportStatusScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const dispatch = useDispatch();
  const { shipments, loading, error } = useSelector((state: RootState) => state.shipments);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      await dispatch(fetchShipments()).unwrap();
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadShipments();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (shipmentId: string, newStatus: string) => {
    try {
      await dispatch(updateShipmentStatus({ 
        id: shipmentId, 
        status: newStatus 
      })).unwrap();
    } catch (error) {
      console.error('Failed to update shipment status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'in_transit':
        return theme.colors.info;
      case 'delivered':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'in_transit':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ET', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 10 || temp > 30) return theme.colors.error;
    if (temp < 15 || temp > 25) return theme.colors.warning;
    return theme.colors.success;
  };

  const getHumidityColor = (humidity: number) => {
    if (humidity < 40 || humidity > 80) return theme.colors.error;
    if (humidity < 50 || humidity > 70) return theme.colors.warning;
    return theme.colors.success;
  };

  const renderShipmentItem = ({ item }: { item: ShipmentItem }) => (
    <View style={styles.shipmentCard}>
      <View style={styles.shipmentHeader}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>
            {getStatusIcon(item.status)}
          </Text>
          <View>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}>
              {formatStatus(item.status)}
            </Text>
            <Text style={styles.shipmentId}>
              ID: {item.id.slice(-8)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>From:</Text>
          <Text style={styles.locationText}>{item.origin.address}</Text>
        </View>
        
        <View style={styles.routeArrow}>
          <Text style={styles.routeArrowText}>→</Text>
        </View>
        
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>To:</Text>
          <Text style={styles.locationText}>{item.destination.address}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Est. Arrival:</Text>
          <Text style={styles.detailValue}>
            {formatDate(item.estimated_arrival)}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Temperature:</Text>
          <Text style={[
            styles.detailValue,
            { color: getTemperatureColor(item.temperature) }
          ]}>
            {item.temperature}°C
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Humidity:</Text>
          <Text style={[
            styles.detailValue,
            { color: getHumidityColor(item.humidity) }
          ]}>
            {item.humidity}%
          </Text>
        </View>
      </View>

      {item.alerts && item.alerts.length > 0 && (
        <View style={styles.alertsContainer}>
          <Text style={styles.alertsTitle}>⚠️ Alerts</Text>
          {item.alerts.map((alert, index) => (
            <Text key={index} style={styles.alertText}>
              • {alert}
            </Text>
          ))}
        </View>
      )}

      {item.status === 'in_transit' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleStatusUpdate(item.id, 'delivered')}
          >
            <Text style={styles.actionButtonText}>Confirm Delivery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.reportButton]}
            onPress={() => {
              // In a real app, this would open a report screen
              console.log('Report issue for shipment:', item.id);
            }}
          >
            <Text style={styles.actionButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'pending' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleStatusUpdate(item.id, 'cancelled')}
          >
            <Text style={styles.actionButtonText}>Cancel Shipment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filterOptions = [
    { key: 'all', label: 'All Shipments' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const filteredShipments = shipments.filter(shipment => {
    if (selectedFilter === 'all') return true;
    return shipment.status === selectedFilter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transport Status</Text>
        <Text style={styles.subtitle}>
          Track your crop shipments in real-time
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContainer}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterChip,
                selectedFilter === option.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === option.key && styles.filterChipTextActive,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading shipments...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load shipments</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadShipments}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredShipments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No shipments found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredShipments}
          renderItem={renderShipmentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.large,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: 'white',
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  filterContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterScrollContainer: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  filterChip: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    marginRight: theme.spacing.small,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: theme.spacing.medium,
  },
  shipmentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.small,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: theme.spacing.small,
  },
  statusText: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
  },
  shipmentId: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  moreButton: {
    padding: theme.spacing.small,
  },
  moreButtonText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
  },
  routeContainer: {
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  locationContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  locationText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
  },
  routeArrow: {
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.medium,
  },
  routeArrowText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
  },
  detailsContainer: {
    padding: theme.spacing.medium,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  detailLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
  },
  alertsContainer: {
    backgroundColor: '#fff3cd',
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.small,
  },
  alertsTitle: {
    fontSize: theme.typography.caption.fontSize,
    color: '#856404',
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  alertText: {
    fontSize: theme.typography.caption.fontSize,
    color: '#856404',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flex: 1,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginHorizontal: theme.spacing.small,
  },
  confirmButton: {
    backgroundColor: theme.colors.success,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
  reportButton: {
    backgroundColor: theme.colors.warning,
  },
  actionButtonText: {
    color: 'white',
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    marginBottom: theme.spacing.medium,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  retryButtonText: {
    color: 'white',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
});

export default TransportStatusScreen;
