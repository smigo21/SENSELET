import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface TraderOfferCardProps {
  crop: string;
  quantity: number;
  farmer: string;
  price: number;
}

const TraderOfferCard: React.FC<TraderOfferCardProps> = ({ crop, quantity, farmer, price }) => {
  return (
    <View style={styles.card}>
      <Text>{crop} - {quantity} kg from {farmer}</Text>
      <Text>Price: {price} ETB/kg</Text>
      <Button title="Book" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 12, marginVertical: 6, backgroundColor: '#cce0ff', borderRadius: 8 },
});

export default TraderOfferCard;
