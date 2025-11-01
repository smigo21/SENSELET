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
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  addNotification 
} from '../../store/slices/notificationsSlice';
import { RootState } from '../../store/types';
import { theme } from '../../constants/theme';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  action_url?: string;
}

const NotificationsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    // Simulate receiving new notifications
    const interval = setInterval(() => {
      const randomNotification = generateRandomNotification();
      dispatch(addNotification(randomNotification));
    }, 30000); // Every 30 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const generateRandomNotification = () => {
    const notifications = [
      {
        id: Date.now().toString(),
        title: 'Temperature Alert',
        message: 'High temperature detected in storage container',
        type: 'warning' as const,
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: (Date.now() + 1).toString(),
        title: 'Payment Received',
        message: 'Payment of ETB 5,000 received for crop delivery',
        type: 'success' as const,
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: (Date.now() + 2).toString(),
        title: 'Shipment Update',
        message: 'Your crop shipment has arrived at destination',
        type: 'info' as const,
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: (Date.now() + 3).toString(),
        title: 'IoT Sensor Alert',
        message: 'Humidity levels exceed optimal range',
        type: 'error' as const,
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];

    return notifications[Math.floor(Math.random() * notifications.length)];
  };

  const loadNotifications = async () => {
    try {
      await dispatch(fetchNotifications()).unwrap();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      // In a real app, this would navigate to the relevant screen
      console.log('Navigate to:', notification.action_url);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info':
        return theme.colors.info;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.notificationIcon}>
            {getNotificationIcon(item.type)}
          </Text>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={[
            styles.notificationTitle,
            !item.read && styles.unreadTitle,
          ]}>
            {item.title}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        
        {!item.read && (
          <View style={styles.unreadDot} />
        )}
      </View>

      <Text style={[
        styles.notificationMessage,
        !item.read && styles.unreadMessage,
      ]}>
        {item.message}
      </Text>

      {item.action_url && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            Stay updated with IoT alerts and payments
          </Text>
        </View>
        
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllReadButtonText}>
              Mark All Read ({unreadCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load notifications</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNotifications}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>
            You'll receive alerts for IoT sensors, payments, and shipments
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: 'white',
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  markAllReadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.round,
  },
  markAllReadButtonText: {
    color: 'white',
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
  },
  listContainer: {
    padding: theme.spacing.medium,
  },
  notificationItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.small,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unreadNotification: {
    borderLeftColor: theme.colors.primary,
    backgroundColor: 'rgba(44, 122, 43, 0.05)',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.small,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.medium,
  },
  notificationIcon: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  notificationMessage: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  unreadMessage: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.small,
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
  emptyIcon: {
    fontSize: 60,
    marginBottom: theme.spacing.medium,
  },
  emptyText: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
  },
  emptySubtext: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
