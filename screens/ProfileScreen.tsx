import React from 'react';
import { Link } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const USER = {
  name: 'Charles Glosei',
  city: 'Soa, Yaounde',
  phone: '6********',
  email: 'Email@gmail.com',
  image: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
};

const MENU_ITEMS = [
  { icon: 'shield-checkmark-outline', label: 'Account & Security', value: null,      key: 'security' },
  { icon: 'language-outline',         label: 'Languages',          value: 'English', key: 'languages' },
  { icon: 'headset-outline',          label: 'Contact Us',         value: null,      key: 'contact' },
  { icon: 'gift-outline',             label: 'Invite Your friends', value: null,     key: 'invite' },
];

export default function ProfileScreen() {

  const handleMenuPress = (key: string) => {
    Alert.alert(key, `${key} screen coming soon`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Title */}
      <Text style={styles.pageTitle}>Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image source={USER.image} style={styles.avatar} />
      </View>
      <Text style={styles.userName}>{USER.name}</Text>

      {/* Edit Profile — ✅ href points to app/editProfile.tsx */}
      <Link href="/editProfile" asChild>
        <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
          <View style={styles.menuIconBox}>
            <Ionicons name="pencil-outline" size={18} color="#FF9D00" />
          </View>
          <Text style={styles.menuLabel}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      </Link>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Lives in {USER.city}</Text>
        <Text style={styles.infoText}>Phone number: {USER.phone}</Text>
        <Text style={styles.infoText}>Email :{USER.email}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuRow}
            onPress={() => handleMenuPress(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name={item.icon as any} size={18} color="#FF9D00" />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutRow}
        onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?')}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#fff' },
  pageTitle: {
    fontSize: 18, fontWeight: 'bold',
    textAlign: 'center', marginTop: 16, color: '#111',
  },
  avatarWrapper: { alignItems: 'center', marginTop: 16 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: '#FF9D00',
  },
  userName: {
    fontSize: 22, fontWeight: 'bold', textAlign: 'center',
    color: '#111', marginTop: 12, marginBottom: 8,
  },
  infoBox:  { paddingHorizontal: 24, marginVertical: 12, gap: 4 },
  infoText: { fontSize: 14, color: '#444', lineHeight: 22 },
  menuSection: { marginTop: 4 },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF4E5', alignItems: 'center',
    justifyContent: 'center', marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, color: '#222' },
  menuValue: { fontSize: 14, color: '#FF9D00', marginRight: 6 },
  logoutRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 20, gap: 10,
  },
  logoutText: { fontSize: 16, color: '#FF3B30', fontWeight: '600' },
});