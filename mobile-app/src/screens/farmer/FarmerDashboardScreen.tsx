/**
 * Farmer Dashboard Screen
 * Main screen for farmers to view their produce, market prices, and upcoming deliveries
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Subheading, Paragraph, Button, List, Avatar, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

interface DashboardData {
  totalProduce: number;
  pendingDeliveries: number;
  activeShipments: number;
  totalRevenue: number;
  marketPrices: Array<{
    crop: string;
    price: number;
    change: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
  }>;
}

const FarmerDashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/farmer/dashboard/`, {
        headers: {
          'Authorization': `Token ${user?.token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
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

  const handleAddProduce = () => {
    navigation.navigate('AddProduce');
  };

  const handleViewProduce = () => {
    navigation.navigate('MyProduce');
  };

  const handleViewPrices = () => {
    navigation.navigate('MarketPrices');
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString()}`;
  };

  if (loading && !dashboardData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Paragraph>Loading dashboard...</Paragraph>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.title}>Welcome, {user?.full_name}</Title>
        <Subheading style={styles.subtitle}>Your farm at a glance</Subheading>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddProduce}>
          <Avatar.Icon size={40} icon="plus" />
          <Paragraph style={styles.actionText}>Add Produce</Paragraph>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleViewProduce}>
          <Avatar.Icon size={40} icon="agriculture" />
          <Paragraph style={styles.actionText}>My Produce</Paragraph>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleViewPrices}>
          <Avatar.Icon size={40} icon="trending-up" />
          <Paragraph style={styles.actionText}>Market Prices</Paragraph>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{dashboardData?.totalProduce || 0}</Title>
            <Subheading>Total Produce (kg)</Subheading>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{dashboardData?.pendingDeliveries || 0}</Title>
            <Subheading>Pending Deliveries</Subheading>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{formatCurrency(dashboardData?.totalRevenue || 0)}</Title>
            <Subheading>Revenue This Month</Subheading>
          </Card.Content>
        </Card>
      </View>

      {/* Market Prices */}
      <Card style={styles.sectionCard}>
        <Card.Title title="Current Market Prices" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {dashboardData?.marketPrices && dashboardData.marketPrices.length > 0 ? (
            <List>
              {dashboardData.marketPrices.map((price, index) => (
                <React.Fragment key={index}>
                  <List.Item
                    title={price.crop}
                    description={
                      <View style={styles.priceRow}>
                        <Paragraph>{formatCurrency(price.price)}</Paragraph>
                        <Paragraph style={[
                          styles.priceChange,
                          price.change >= 0 ? styles.priceUp : styles.priceDown
                        ]}>
                          {price.change >= 0 ? '↑' : '↓'} {Math.abs(price.change)}%
                        </Paragraph>
                      </View>
                    }
                    left={() => <Avatar.Icon icon="currency-usd" />}
                  />
                  {index < dashboardData.marketPrices.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Paragraph>No market price data available</Paragraph>
          )}
          <Button 
            mode="outlined" 
            onPress={handleViewPrices}
            style={styles.button}
          >
            View All Prices
          </Button>
        </Card.Content>
      </Card>

      {/* Active Shipments */}
      <Card style={styles.sectionCard}>
        <Card.Title title="Active Shipments" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {dashboardData?.activeShipments && dashboardData.activeShipments > 0 ? (
            <View>
              <Paragraph>{dashboardData.activeShipments} shipment(s) in transit</Paragraph>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('MyProduce')}
                style={styles.button}
              >
                Track Shipments
              </Button>
            </View>
          ) : (
            <Paragraph>No active shipments</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Recent Activities */}
      <Card style={styles.sectionCard}>
        <Card.Title title="Recent Activities" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
            <List>
              {dashboardData.recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <List.Item
                    title={activity.title}
                    description={
                      <View>
                        <Paragraph>{activity.description}</Paragraph>
                        <Subheading style={styles.activityTime}>{activity.time}</Subheading>
                      </View>
                    }
                    left={() => <Avatar.Icon icon={activity.type === 'delivery' ? 'truck' : 'plus'} />}
                  />
                  {index < dashboardData.recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Paragraph>No recent activities</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Weather Alert */}
      <Card style={styles.sectionCard}>
        <Card.Title title="Weather Advisory" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <Paragraph>Light rain expected in your area tomorrow. Consider harvesting before then to avoid crop damage.</Paragraph>
          <Button 
            mode="contained" 
            icon="weather-rainy"
            style={styles.button}
          >
            View Weather Forecast
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.primary,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.medium,
    backgroundColor: 'white',
  },
  actionButton: {
    alignItems: 'center',
    padding: theme.spacing.small,
  },
  actionText: {
    marginTop: theme.spacing.small,
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.medium,
  },
  statCard: {
    flex: 1,
    marginHorizontal: theme.spacing.small,
    elevation: 2,
  },
  sectionCard: {
    margin: theme.spacing.medium,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceChange: {
    fontSize: 12,
  },
  priceUp: {
    color: theme.colors.success,
  },
  priceDown: {
    color: theme.colors.error,
  },
  button: {
    marginTop: theme.spacing.medium,
  },
  activityTime: {
    fontSize: 12,
    color: 'gray',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FarmerDashboardScreen;
