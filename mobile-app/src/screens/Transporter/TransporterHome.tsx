import React from 'react';
import { ScrollView, StyleSheet, Button, View } from 'react-native';
import Header from '../Shared/Header';
import TripCard from './TripCard';
import NotificationCard from '../Shared/NotificationCard';

const TransporterHome = () => {
  return (
    <ScrollView style={styles.container}>
      <Header title="Transporter Dashboard" username="Yared" />

      <NotificationCard message="New trip assigned: Gondar → Addis Ababa" />

      <TripCard from="Gondar" to="Addis Ababa" status="Not Started" />
      <TripCard from="Shashemene" to="Addis Ababa" status="In Transit" />

      <View style={styles.actions}>
        <Button title="Start New Trip" onPress={() => {}} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 8 },
  actions: { marginVertical: 12 },
});

export default TransporterHome;
