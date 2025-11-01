import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderProps {
  title: string;
  username: string;
}

const Header: React.FC<HeaderProps> = ({ title, username }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.user}>Welcome, {username}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#4CAF50' },
  title: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  user: { fontSize: 14, color: '#fff', marginTop: 4 },
});

export default Header;
