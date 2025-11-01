import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface FarmerOfferCardProps {
  crop: string;
  quantity: number;
  status: string;
}

const FarmerOfferCard: React.FC<FarmerOfferCardProps> = ({ crop, quantity, status }) => {
  return (
    <View style={styles.card}>
      <Text>{crop} - {quantity} kg</Text>
      <Text>Status: {status}</Text>
      <View style={styles.buttons}>
        <Button title="Edit" onPress={() => {}} />
        <Button title="Cancel" onPress={() => {}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 12, marginVertical: 6, backgroundColor: '#d0f0c0', borderRadius: 8 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});

export default FarmerOfferCard;
