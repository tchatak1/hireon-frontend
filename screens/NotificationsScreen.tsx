import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="notifications-outline" size={48} color="#FF9D00" />
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>You have no new notifications</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#fff' },
  title:     { fontSize: 20, fontWeight: 'bold', color: '#111' },
  subtitle:  { fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 40 },
});