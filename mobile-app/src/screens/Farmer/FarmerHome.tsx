import React from 'react';
import { View, ScrollView, Button, StyleSheet } from 'react-native';
import Header from '../Shared/Header';
import FarmerOfferCard from './FarmerOfferCard';
import NotificationCard from '../Shared/NotificationCard';

const FarmerHome = () => {
  return (
    <ScrollView style={styles.container}>
      <Header title="Farmer Dashboard" username="Abebe" />

      <View style={styles.section}>
        <NotificationCard message="Price alert: Maize ↑ 10% in Adama" />
        <NotificationCard message="Buyer request: Teff 50kg" />
      </View>
e      <View style={styles.section}>
        <FarmerOfferCard crop="Teff" quantity={100} status="Pending" />
nd       </View>

      <View style={styles.actions}>
        <Button title="Add New Harvest" onPress={() => {}} />
        <Button title="View Nearby Traders" onPress={() => {}} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  section: { margin: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
});

export default FarmerHome;
