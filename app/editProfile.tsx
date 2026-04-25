import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  TextInput, ScrollView, Modal, FlatList, KeyboardAvoidingView, Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const REGIONS = [
  { code: 'CM-AD', name: 'Adamaoua', flag: '🇨🇲' },
  { code: 'CM-CE', name: 'Centre',   flag: '🇨🇲' },
  { code: 'CM-ES', name: 'East',     flag: '🇨🇲' },
  { code: 'CM-EN', name: 'Far North',flag: '🇨🇲' },
  { code: 'CM-LT', name: 'Littoral', flag: '🇨🇲' },
  { code: 'CM-NO', name: 'North',    flag: '🇨🇲' },
  { code: 'CM-NW', name: 'North West',flag: '🇨🇲' },
  { code: 'CM-SU', name: 'South',    flag: '🇨🇲' },
  { code: 'CM-SW', name: 'South West',flag: '🇨🇲' },
];

const SKILLS = [
  'Electrician', 'Plumber', 'Mechanic', 'Carpenter',
  'Tiler', 'Painter', 'Computer repair technician', 'Photographer',
];

const PHONE_CODES = ['+237', '+1', '+33', '+44', '+234'];

export default function EditProfileScreen({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [name,        setName]        = useState('Charles Glosei');
  const [email,       setEmail]       = useState('Email@gmail.com');
  const [city,        setCity]        = useState('');
  const [region,      setRegion]      = useState(REGIONS[0]);
  const [phoneCode,   setPhoneCode]   = useState('+237');
  const [skill,       setSkill]       = useState('');
  const [modalType,   setModalType]   = useState<'region' | 'skill' | 'phone' | null>(null);

  const openModal = (type: 'region' | 'skill' | 'phone') => setModalType(type);
  const closeModal = () => setModalType(null);

  const modalData = () => {
    if (modalType === 'region') return REGIONS.map(r => ({ id: r.code, label: `${r.flag}  ${r.name}` }));
    if (modalType === 'skill')  return SKILLS.map(s => ({ id: s, label: s }));
    if (modalType === 'phone')  return PHONE_CODES.map(c => ({ id: c, label: c }));
    return [];
  };

  const onSelect = (item: { id: string; label: string }) => {
    if (modalType === 'region') setRegion(REGIONS.find(r => r.code === item.id) ?? REGIONS[0]);
    if (modalType === 'skill')  setSkill(item.label);
    if (modalType === 'phone')  setPhoneCode(item.id);
    closeModal();
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      ><SafeAreaView style={{ flex: 1, backgroundColor: "#FF9D00" }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
            <Text style={styles.pageTitle}>Edit Profile</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>

            {/* Name */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#bbb"
            />

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Region + Telephone */}
            <View style={styles.row}>
              <View style={{ flex: 1.2 }}>
                <Text style={styles.label}>Region</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => openModal('region')}>
                  <Text style={styles.dropdownText}>{region.flag}  {region.name}</Text>
                  <Ionicons name="chevron-down" size={16} color="#999" />
                </TouchableOpacity>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Telephone</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => openModal('phone')}>
                  <Text style={styles.dropdownText}>{phoneCode}</Text>
                  <Ionicons name="chevron-down" size={16} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            {/* City */}
            <Text style={styles.label}>City</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => {}}>
              <TextInput
                style={[styles.dropdownText, { flex: 1 }]}
                value={city}
                onChangeText={setCity}
                placeholder="Enter your City"
                placeholderTextColor="#bbb"
              />
              <Ionicons name="chevron-down" size={16} color="#999" />
            </TouchableOpacity>

            {/* Skills */}
            <Text style={styles.label}>Skills</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => openModal('skill')}>
              <Text style={[styles.dropdownText, !skill && { color: '#bbb' }]}>
                {skill || 'Skills'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#999" />
            </TouchableOpacity>

            {/* Update Button */}
            <TouchableOpacity style={styles.updateBtn}>
              <Text style={styles.updateBtnText}>Update Profile</Text>
            </TouchableOpacity>

          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
        </SafeAreaView>
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
            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16,
    paddingTop: 16, paddingBottom: 8,
  },
  backBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  pageTitle:     { fontSize: 18, fontWeight: 'bold', color: '#111' },
  avatarWrapper: { alignItems: 'center', marginTop: 12, marginBottom: 24 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: '#FF9D00',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: '35%',
    backgroundColor: '#FF9D00', borderRadius: 12,
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  form:          { paddingHorizontal: 24, gap: 4 },
  label:         { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#222',
  },
  row:           { flexDirection: 'row', alignItems: 'flex-end' },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  dropdownText:  { fontSize: 14, color: '#222' },
  updateBtn: {
    backgroundColor: '#FF9D00', borderRadius: 30,
    paddingVertical: 16, alignItems: 'center', marginTop: 32,
    shadowColor: '#FF9D00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  updateBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '60%', paddingVertical: 20, paddingHorizontal: 16,
  },
  modalTitle:    { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#111' },
  modalItem:     { paddingVertical: 14 },
  modalItemText: { fontSize: 15, color: '#222' },
  separator:     { height: 1, backgroundColor: '#F3F3F3' },
  cancelBtn: {
    marginTop: 12, alignItems: 'center', paddingVertical: 14,
    borderWidth: 1, borderColor: '#FF9D00', borderRadius: 10,
  },
  cancelText:    { color: '#FF9D00', fontWeight: '600', fontSize: 15 },
});