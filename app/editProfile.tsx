import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  TextInput, ScrollView, Modal, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Switch, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile, uploadProfilePicture } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const REGIONS = [
  { code: 'CM-AD', name: 'Adamaoua' },
  { code: 'CM-CE', name: 'Centre' },
  { code: 'CM-ES', name: 'East' },
  { code: 'CM-EN', name: 'Far North' },
  { code: 'CM-LT', name: 'Littoral' },
  { code: 'CM-NO', name: 'North' },
  { code: 'CM-NW', name: 'North West' },
  { code: 'CM-SU', name: 'South' },
  { code: 'CM-SW', name: 'South West' },
];

const SKILLS = [
  'Electrician', 'Plumber', 'Mechanic', 'Carpenter',
  'Tiler', 'Painter', 'Computer repair technician', 'Photographer',
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { t }  = useLanguage();

  const [user,         setUser]         = useState<any>(null);
  const [city,         setCity]         = useState('');
  const [region,       setRegion]       = useState(REGIONS[1]);
  const [skill,        setSkill]        = useState('');
  const [bio,          setBio]          = useState('');
  const [availability, setAvailability] = useState(true);
  const [modalType,    setModalType]    = useState<'region' | 'skill' | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [localImage,   setLocalImage]   = useState<string | null>(null);

  // ── Load current user data ────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem('user').then(raw => {
      if (!raw) return;
      const u = JSON.parse(raw);
      setUser(u);
      setCity(u.city         ?? '');
      setBio(u.bio           ?? '');
      setAvailability(u.availability ?? true);
      if (u.category) setSkill(u.category);
      if (u.location) {
        const found = REGIONS.find(r => r.name === u.location);
        if (found) setRegion(found);
      }
    });
  }, []);

  // ── Pick photo ────────────────────────────────────────────────
  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('error'), 'Permission to access photos is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setLocalImage(uri);
      setUploading(true);
      try {
        const data = await uploadProfilePicture(uri);
        const updated = { ...user, profile_picture: data.profile_picture_url };
        setUser(updated);
        await AsyncStorage.setItem('user', JSON.stringify(updated));
      } catch (err: any) {
        Alert.alert(t('error'), err.message || 'Failed to upload photo');
        setLocalImage(null);
      } finally {
        setUploading(false);
      }
    }
  };

  // ── Save profile ──────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateUserProfile({
        city,
        location:     region.name,
        category:     skill || undefined,
        bio:          bio || undefined,
        availability,
      });
      const merged = { ...user, ...updated };
      await AsyncStorage.setItem('user', JSON.stringify(merged));
      Alert.alert('✅', t('profileUpdated'));
      router.back();
    } catch (err: any) {
      Alert.alert(t('error'), err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const modalItems = modalType === 'region'
    ? REGIONS.map(r => ({ id: r.code, label: r.name }))
    : SKILLS.map(s => ({ id: s, label: s }));

  const onSelect = (item: { id: string; label: string }) => {
    if (modalType === 'region') setRegion(REGIONS.find(r => r.code === item.id) ?? REGIONS[1]);
    if (modalType === 'skill')  setSkill(item.label);
    setModalType(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('editProfile')}</Text>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveBtnText}>{t('saveChanges')}</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                localImage
                  ? { uri: localImage }
                  : user?.profile_picture
                    ? { uri: user.profile_picture }
                    : { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }
              }
              style={styles.avatar}
            />
            {uploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickPhoto}>
            <Ionicons name="camera-outline" size={16} color="#FF9D00" />
            <Text style={styles.changePhotoText}>{t('changePhoto')}</Text>
          </TouchableOpacity>
          {/* Name shown but not editable */}
          <Text style={styles.nameDisplay}>{user?.name ?? ''}</Text>
        </View>

        {/* Fields */}
        <View style={styles.fields}>

          {/* City */}
          <Text style={styles.label}>{t('city')}</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Yaoundé"
            placeholderTextColor="#bbb"
          />

          {/* Region */}
          <Text style={styles.label}>{t('region')}</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setModalType('region')}>
            <Text style={styles.pickerText}>🇨🇲  {region.name}</Text>
            <Ionicons name="chevron-down" size={18} color="#999" />
          </TouchableOpacity>

          {/* Category */}
          <Text style={styles.label}>{t('category')}</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setModalType('skill')}>
            <Text style={[styles.pickerText, !skill && { color: '#bbb' }]}>
              {skill || 'Select a skill...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#999" />
          </TouchableOpacity>

          {/* Bio */}
          <Text style={styles.label}>{t('bio')}</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Write a short bio..."
            placeholderTextColor="#bbb"
            multiline
            maxLength={300}
          />

          {/* Availability */}
          <View style={styles.switchRow}>
            <Text style={styles.label}>{t('availability')}</Text>
            <Switch
              value={availability}
              onValueChange={setAvailability}
              trackColor={{ false: '#E0E0E0', true: '#FFD580' }}
              thumbColor={availability ? '#FF9D00' : '#fff'}
            />
          </View>

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Picker Modal */}
      <Modal visible={!!modalType} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalType(null)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {modalType === 'region' ? t('region') : t('category')}
            </Text>
            <FlatList
              data={modalItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  backBtn:          { padding: 4, marginRight: 8 },
  headerTitle:      { flex: 1, fontSize: 17, fontWeight: '700', color: '#111' },
  saveBtn: {
    backgroundColor: '#FF9D00', borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  saveBtnDisabled:  { backgroundColor: '#FFD580' },
  saveBtnText:      { color: '#fff', fontWeight: '700', fontSize: 14 },
  avatarSection:    { alignItems: 'center', paddingVertical: 24 },
  avatarWrapper:    { position: 'relative' },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: '#FF9D00',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 50, alignItems: 'center', justifyContent: 'center',
  },
  changePhotoBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  changePhotoText:  { color: '#FF9D00', fontWeight: '600', fontSize: 14 },
  nameDisplay:      { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 8 },
  fields:           { paddingHorizontal: 20 },
  label:            { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#222',
  },
  bioInput:         { height: 100, textAlignVertical: 'top' },
  picker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  pickerText:       { fontSize: 15, color: '#222' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 16,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, maxHeight: '60%',
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 16,
  },
  modalTitle:    { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 12 },
  modalItem: {
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  modalItemText: { fontSize: 15, color: '#333' },
});