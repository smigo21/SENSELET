import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface TripCardProps {
  from: string;
  to: string;
  status: string;
}

const TripCard: React.FC<TripCardProps> = ({ from, to, status }) => {
  return (
    <View style={styles.card}>
      <Text>From: {from}</Text>
      <Text>To: {to}</Text>
      <Text>Status: {status}</Text>
      <Button title="Mark Delivered" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 12, marginVertical: 6, backgroundColor: '#ffe0b3', borderRadius: 8 },
});

export default TripCard;
