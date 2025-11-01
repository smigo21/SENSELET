import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NotificationCardProps {
  message: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ message }) => {
  return (
    <View style={styles.card}>
      <Text>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 12, marginVertical: 4, backgroundColor: '#f0f0f0', borderRadius: 6 },
});

export default NotificationCard;
