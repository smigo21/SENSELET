import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Title, Subheading, Button, List, Divider } from 'react-native-paper';
import SupplyChainMap from './SupplyChainMap';
import { theme } from '../constants/theme';

const Dashboard: React.FC = () => {
  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.title}>EATMS Government Dashboard</Title>
        <Subheading style={styles.subtitle}>
          Ethiopian Agri-Chain Transparency and Monitoring System
        </Subheading>
      </View>

      {/* Supply Chain Map */}
      <Card style={styles.mapCard}>
        <Card.Title
          title="Supply Chain Monitoring"
          subtitle="Real-time tracking of agricultural shipments"
        />
        <Card.Content>
          <SupplyChainMap />
        </Card.Content>
      </Card>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>1,247</Title>
            <Subheading style={styles.statLabel}>Active Shipments</Subheading>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>98.5%</Title>
            <Subheading style={styles.statLabel}>On-Time Delivery</Subheading>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>23</Title>
            <Subheading style={styles.statLabel}>Regions Monitored</Subheading>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>156</Title>
            <Subheading style={styles.statLabel}>IoT Devices Active</Subheading>
          </Card.Content>
        </Card>
      </View>

      {/* Recent Alerts */}
      <Card style={styles.alertsCard}>
        <Card.Title
          title="Recent Alerts"
          subtitle="System notifications and issues"
        />
        <Card.Content>
          <List.Section>
            <List.Item
              title="Temperature Alert"
              description="Shipment #ET-2024-001 exceeded temperature threshold"
              left={() => <List.Icon icon="thermometer" color={theme.colors.error} />}
            />
            <Divider />
            <List.Item
              title="Delay Notification"
              description="Shipment #ET-2024-002 is 2 hours delayed"
              left={() => <List.Icon icon="clock-alert" color={theme.colors.accent} />}
            />
            <Divider />
            <List.Item
              title="Quality Check Passed"
              description="Shipment #ET-2024-003 passed all quality checks"
              left={() => <List.Icon icon="check-circle" color={theme.colors.primary} />}
            />
          </List.Section>
        </Card.Content>
        <Card.Actions>
          <Button>View All Alerts</Button>
        </Card.Actions>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Title
          title="Quick Actions"
          subtitle="Common administrative tasks"
        />
        <Card.Content>
          <View style={styles.actionsGrid}>
            <Button
              mode="contained"
              icon="map-search"
              style={styles.actionButton}
              onPress={() => console.log('Navigate to map')}
            >
              View Full Map
            </Button>
            <Button
              mode="outlined"
              icon="chart-line"
              style={styles.actionButton}
              onPress={() => console.log('View analytics')}
            >
              Analytics
            </Button>
            <Button
              mode="outlined"
              icon="cog"
              style={styles.actionButton}
              onPress={() => console.log('System settings')}
            >
              Settings
            </Button>
            <Button
              mode="outlined"
              icon="file-report"
              style={styles.actionButton}
              onPress={() => console.log('Generate report')}
            >
              Reports
            </Button>
          </View>
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
    padding: theme.spacing.large,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  mapCard: {
    margin: theme.spacing.medium,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.medium,
  },
  statCard: {
    width: '48%',
    marginBottom: theme.spacing.medium,
    elevation: 2,
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  alertsCard: {
    margin: theme.spacing.medium,
    elevation: 4,
  },
  actionsCard: {
    margin: theme.spacing.medium,
    marginBottom: theme.spacing.xlarge,
    elevation: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: theme.spacing.medium,
  },
});

export default Dashboard;
