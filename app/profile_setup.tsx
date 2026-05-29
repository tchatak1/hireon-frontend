import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  TextInput, ScrollView, Modal, FlatList,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile, uploadProfilePicture, generateBioFromCV } from '../utils/api';

const REGIONS = [
  { code: 'Adamaoua',   name: 'Adamaoua' },
  { code: 'Centre',     name: 'Centre' },
  { code: 'East',       name: 'East' },
  { code: 'Far North',  name: 'Far North' },
  { code: 'Littoral',   name: 'Littoral' },
  { code: 'North',      name: 'North' },
  { code: 'North West', name: 'North West' },
  { code: 'South',      name: 'South' },
  { code: 'South West', name: 'South West' },
];

const SKILLS = [
  'Electrician', 'Plumber', 'Mechanic', 'Carpenter',
  'Tiler', 'Painter', 'Computer repair technician', 'Photographer',
];

const PHONE_CODES = ['+237', '+1', '+33', '+44', '+234'];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  // Form state
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [city,      setCity]      = useState('');
  const [age,       setAge]       = useState('');
  const [bio,       setBio]       = useState('');
  const [region,    setRegion]    = useState('');
  const [phoneCode, setPhoneCode] = useState('+237');
  const [phone,     setPhone]     = useState('');
  const [skill,     setSkill]     = useState('');
  const [imageUri,  setImageUri]  = useState<string | null>(null);

  // CV state
  const [cvUri,         setCvUri]         = useState<string | null>(null);
  const [cvName,        setCvName]        = useState<string | null>(null);
  const [generatingBio, setGeneratingBio] = useState(false);

  // UI state
  const [modalType, setModalType] = useState<'region' | 'skill' | 'phone' | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load existing user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        setName(user.name      || '');
        setEmail(user.email    || '');
        setCity(user.city      || '');
        setBio(user.bio        || '');
        setRegion(user.location || '');
        setSkill(user.category  || '');
        setImageUri(user.profile_picture || null);
        if (user.phone_number) {
          const code = PHONE_CODES.find(c => user.phone_number.startsWith(c));
          if (code) {
            setPhoneCode(code);
            setPhone(user.phone_number.replace(code, ''));
          } else {
            setPhone(user.phone_number);
          }
        }
      }
    };
    loadUser();
  }, []);

  // ── Pick profile image ────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      try {
        setUploading(true);
        await uploadProfilePicture(uri);
      } catch (err: any) {
        Alert.alert('Upload failed', err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  // ── Pick CV and auto-generate bio ─────────────────────────────
  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      setCvUri(file.uri);
      setCvName(file.name);

      setGeneratingBio(true);
      try {
        const generatedBio = await generateBioFromCV(file.uri);
        setBio(generatedBio);
      } catch (err: any) {
        Alert.alert('Bio generation failed', err.message);
      } finally {
        setGeneratingBio(false);
      }
    } catch {
      Alert.alert('Error', 'Could not open file picker');
    }
  };

  // ── Save profile ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!phone)  { Alert.alert('Error', 'Phone number is required'); return; }
    if (!region) { Alert.alert('Error', 'Region is required');       return; }
    if (!city)   { Alert.alert('Error', 'City is required');         return; }
    if (!skill)  { Alert.alert('Error', 'Please select your skill'); return; }

    try {
      setLoading(true);
      await updateProfile({
        name,
        phone_number: `${phoneCode}${phone}`,
        location:     region,
        city,
        category:     skill,
        bio,
      });
      router.push('/home');
    } catch (err: any) {
      Alert.alert('Update failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalData = () => {
    if (modalType === 'region') return REGIONS.map(r => ({ id: r.code, label: r.name }));
    if (modalType === 'skill')  return SKILLS.map(s => ({ id: s, label: s }));
    if (modalType === 'phone')  return PHONE_CODES.map(c => ({ id: c, label: c }));
    return [];
  };

  const onSelect = (item: { id: string; label: string }) => {
    if (modalType === 'region') setRegion(item.id);
    if (modalType === 'skill')  setSkill(item.id);
    if (modalType === 'phone')  setPhoneCode(item.id);
    setModalType(null);
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#111" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>{t('completeProfile')}</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Avatar */}
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="white" />
              </View>
            )}
            <View style={styles.cameraBtn}>
              {uploading
                ? <ActivityIndicator size="small" color="white" />
                : <Ionicons name="camera" size={16} color="white" />
              }
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>{t('tapToUpload')}</Text>

          <View style={styles.form}>

            {/* Name */}
            <Text style={styles.label}>{t('name')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('fullName')}
              placeholderTextColor="#bbb"
            />

            {/* Email (read only) */}
            <Text style={styles.label}>{t('emailAddress')}</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholder={t('emailAddress')}
              placeholderTextColor="#bbb"
            />

            {/* Region + Phone code */}
            <View style={styles.row}>
              <View style={{ flex: 1.2 }}>
                <Text style={styles.label}>{t('region')}</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setModalType('region')}
                >
                  <Text style={[styles.dropdownText, !region && { color: '#bbb' }]}>
                    {region || 'Select region'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#999" />
                </TouchableOpacity>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('phoneCode')}</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setModalType('phone')}
                >
                  <Text style={styles.dropdownText}>{phoneCode}</Text>
                  <Ionicons name="chevron-down" size={16} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Phone number */}
            <Text style={styles.label}>{t('phoneNumber')}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="6XXXXXXXX"
              placeholderTextColor="#bbb"
              keyboardType="phone-pad"
            />

            {/* City */}
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder={t('city')}
              placeholderTextColor="#bbb"
            />

            {/* Age */}
            <Text style={styles.label}>{t('age')}</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder={t('age')}
              placeholderTextColor="#bbb"
              keyboardType="numeric"
            />

            {/* Skills */}
            <Text style={styles.label}>{t('skills')}</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setModalType('skill')}
            >
              <Text style={[styles.dropdownText, !skill && { color: '#bbb' }]}>
                {skill || 'Select your skill'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#999" />
            </TouchableOpacity>

            {/* CV Upload */}
            <Text style={styles.label}>{t('uploadCv')}</Text>
            <TouchableOpacity style={styles.cvUploadBtn} onPress={pickCV}>
              <Ionicons
                name={cvUri ? 'document-text' : 'cloud-upload-outline'}
                size={22}
                color={cvUri ? '#FF9D00' : '#999'}
              />
              <Text style={[styles.cvUploadText, cvUri && { color: '#FF9D00' }]}>
                {cvName || 'Tap to select PDF'}
              </Text>
              {cvUri && <Ionicons name="checkmark-circle" size={18} color="#27AE60" />}
            </TouchableOpacity>

            {/* Bio */}
            <Text style={styles.label}>
              Bio
              {generatingBio && (
                <Text style={{ color: '#FF9D00', fontSize: 12 }}> — Generating...</Text>
              )}
            </Text>
            {generatingBio ? (
              <View style={styles.generatingBox}>
                <ActivityIndicator color="#FF9D00" />
                <Text style={styles.generatingText}>
                  Reading your CV and generating bio...
                </Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder={t('bioPlaceholder')}
                placeholderTextColor="#bbb"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={loading || generatingBio}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.saveBtnText}>{t('saveAndContinue')}</Text>
              }
            </TouchableOpacity>

          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selection Modal */}
      <Modal visible={modalType !== null} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'region' ? 'Select Region'
               : modalType === 'skill' ? 'Select Skill'
               : 'Phone Code'}
            </Text>
            <FlatList
              data={modalData()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalType(null)}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16,
    paddingTop: 50, paddingBottom: 8,
  },
  backBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  pageTitle:     { fontSize: 18, fontWeight: 'bold', color: '#111' },
  avatarWrapper: { alignItems: 'center', marginTop: 16, marginBottom: 4 },
  avatar:        { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FF9D00' },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FF9D00', alignItems: 'center', justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: '35%',
    backgroundColor: '#FF9D00', borderRadius: 12,
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  avatarHint:    { textAlign: 'center', color: '#999', fontSize: 12, marginBottom: 16 },
  form:          { paddingHorizontal: 24, gap: 4 },
  label:         { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#222',
  },
  inputDisabled: { backgroundColor: '#F5F5F5', color: '#999' },
  textArea:      { height: 100, paddingTop: 12 },
  row:           { flexDirection: 'row', alignItems: 'flex-end' },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  dropdownText:  { fontSize: 14, color: '#222' },
  cvUploadBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8,
    borderStyle: 'dashed', paddingHorizontal: 14, paddingVertical: 14,
    gap: 10, backgroundColor: '#FAFAFA',
  },
  cvUploadText:  { flex: 1, fontSize: 14, color: '#999' },
  generatingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#FFE0A0', borderRadius: 8,
    padding: 14, backgroundColor: '#FFF8EE',
  },
  generatingText: { fontSize: 13, color: '#FF9D00', flex: 1 },
  saveBtn: {
    backgroundColor: '#FF9D00', borderRadius: 30,
    paddingVertical: 16, alignItems: 'center', marginTop: 32,
    shadowColor: '#FF9D00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  saveBtnText:   { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '60%', paddingVertical: 20, paddingHorizontal: 16,
  },
  modalTitle:    { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  modalItem:     { paddingVertical: 14 },
  modalItemText: { fontSize: 15, color: '#222' },
  separator:     { height: 1, backgroundColor: '#F3F3F3' },
  cancelBtn: {
    marginTop: 12, alignItems: 'center', paddingVertical: 14,
    borderWidth: 1, borderColor: '#FF9D00', borderRadius: 10,
  },
  cancelText:    { color: '#FF9D00', fontWeight: '600', fontSize: 15 },
});