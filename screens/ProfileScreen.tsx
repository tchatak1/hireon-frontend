import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, Alert, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage, Lang } from '../context/LanguageContext';
import { updateUserProfile } from '../utils/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { lang, t, setLang } = useLanguage();

  const [user,           setUser]           = useState<any>(null);
  const [showLangModal,  setShowLangModal]  = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then(raw => {
      if (raw) setUser(JSON.parse(raw));
    });
  }, []);

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(t('logout'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('confirm'), style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'user']);
          router.replace('/signIn');
        },
      },
    ]);
  };

  // ── Language picker ───────────────────────────────────────────
  const LANGUAGES = [
    { key: 'en' as Lang, label: t('english'), flag: '🇬🇧' },
    { key: 'fr' as Lang, label: t('french'),  flag: '🇫🇷' },
  ];

  const currentLangLabel = LANGUAGES.find(l => l.key === lang)?.label ?? 'English';

  const MENU_ITEMS = [
    { icon: 'shield-checkmark-outline', label: t('accountSecurity'), key: 'security',  value: null },
    { icon: 'language-outline',         label: t('languages'),       key: 'languages', value: currentLangLabel },
    { icon: 'headset-outline',          label: t('contactUs'),       key: 'contact',   value: null },
    { icon: 'gift-outline',             label: t('inviteFriends'),   key: 'invite',    value: null },
  ];

  const handleMenuPress = (key: string) => {
    if (key === 'languages') { setShowLangModal(true); return; }
    Alert.alert(key, `${key} coming soon`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Title */}
      <Text style={styles.pageTitle}>{t('profile')}</Text>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image
          source={
            user?.profile_picture
              ? { uri: user.profile_picture }
              : { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }
          }
          style={styles.avatar}
        />
      </View>
      <Text style={styles.userName}>{user?.name ?? '...'}</Text>

      {/* Edit Profile */}
      <TouchableOpacity
        style={styles.menuRow}
        activeOpacity={0.7}
        onPress={() => router.push('/editProfile')}
      >
        <View style={styles.menuIconBox}>
          <Ionicons name="pencil-outline" size={18} color="#FF9D00" />
        </View>
        <Text style={styles.menuLabel}>{t('editProfile')}</Text>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoBox}>
        {user?.city        && <Text style={styles.infoText}>{t('livesIn')} {user.city}</Text>}
        {user?.phone_number && <Text style={styles.infoText}>{t('phone')}: {user.phone_number}</Text>}
        {user?.email       && <Text style={styles.infoText}>{t('email')}: {user.email}</Text>}
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
      <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />

      {/* Language Modal */}
      <Modal visible={showLangModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLangModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.key}
                style={[styles.langRow, lang === l.key && styles.langRowActive]}
                onPress={() => { setLang(l.key); setShowLangModal(false); }}
              >
                <Text style={styles.langFlag}>{l.flag}</Text>
                <Text style={[styles.langLabel, lang === l.key && styles.langLabelActive]}>
                  {l.label}
                </Text>
                {lang === l.key && <Ionicons name="checkmark" size={20} color="#FF9D00" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
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
  infoBox:   { paddingHorizontal: 24, marginVertical: 12, gap: 4 },
  infoText:  { fontSize: 14, color: '#444', lineHeight: 22 },
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
  menuLabel:  { flex: 1, fontSize: 15, color: '#222' },
  menuValue:  { fontSize: 14, color: '#FF9D00', marginRight: 6 },
  logoutRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 20, gap: 10,
  },
  logoutText: { fontSize: 16, color: '#FF3B30', fontWeight: '600' },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, paddingHorizontal: 24,
    paddingBottom: 40, paddingTop: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 20,
  },
  modalTitle:   { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 16 },
  langRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  langRowActive: { backgroundColor: '#FFF9F0', borderRadius: 10, paddingHorizontal: 8 },
  langFlag:      { fontSize: 24 },
  langLabel:     { flex: 1, fontSize: 16, color: '#333' },
  langLabelActive: { color: '#FF9D00', fontWeight: '700' },
});