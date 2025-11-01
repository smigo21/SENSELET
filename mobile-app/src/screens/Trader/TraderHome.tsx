import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Header from '../Shared/Header';
import TraderOfferCard from './TraderOfferCard';
import NotificationCard from '../Shared/NotificationCard';

const TraderHome = () => {
  return (
    <ScrollView style={styles.container}>
      <Header title="Trader Dashboard" username="Bekele" />

      <NotificationCard message="Shipment delayed: Teff 50kg" />

      <TraderOfferCard crop="Teff" quantity={100} farmer="Abebe" price={50} />
      <TraderOfferCard crop="Maize" quantity={200} farmer="Alemayehu" price={30} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 8 },
});

export default TraderHome;
