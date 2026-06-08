import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
  Platform, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendHireRequest } from '../utils/api';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function HireFormScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { provider_id, provider_name } = useLocalSearchParams<{
    provider_id: string;
    provider_name: string;
  }>();

  const [description,   setDescription]   = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker,setShowDatePicker]= useState(false);
  const [showTimePicker,setShowTimePicker]= useState(false);
  const [latitude,      setLatitude]      = useState<number | null>(null);
  const [longitude,     setLongitude]     = useState<number | null>(null);
  const [address,       setAddress]       = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading,       setLoading]       = useState(false);

  // Get location automatically on mount
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), 'Location is needed so the provider knows where to go');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      // Reverse geocode to get address
      const geocode = await Location.reverseGeocodeAsync({
        latitude:  loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode.length > 0) {
        const g = geocode[0];
        const addr = [g.street, g.district, g.city].filter(Boolean).join(', ');
        setAddress(addr);
      }
    } catch {
      Alert.alert(t('error'), 'Could not get your location');
    } finally {
      setLocationLoading(false);
    }
  };

  const formatDate = (date: Date) =>
    date.toISOString().split('T')[0]; // YYYY-MM-DD

  const formatTime = (date: Date) =>
    date.toTimeString().slice(0, 5); // HH:MM

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(t('error'), t('describeRequired'));
      return;
    }
    if (!latitude || !longitude) {
      Alert.alert(t('error'), t('locationRequired'));
      return;
    }

    try {
      setLoading(true);
      await sendHireRequest({
        provider_id:    provider_id as string,
        description:    description.trim(),
        scheduled_date: formatDate(scheduledDate),
        scheduled_time: formatTime(scheduledTime),
        latitude,
        longitude,
        address:        address || '',
      });
      Alert.alert(
        'Request Sent! ✅',
        `Your hiring request has been sent to ${provider_name}. You will be notified when they respond.`,
        [{ text: 'OK', onPress: () => router.push('/home') }]
      );
    } catch (err: any) {
  if (err.message?.includes('subscription')) {
    Alert.alert(
      '⚠️ Subscription Required',
      'You need an active subscription to send hire requests.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '📋 Subscribe', onPress: () => router.push('/subscription' as any) },
      ]
    );
  } else {
    Alert.alert('Failed', err.message);
  }
}finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={22} color="#111" />
              </TouchableOpacity>
              <Text style={styles.title}>{t('hireTitle')} {provider_name}</Text>
              <View style={{ width: 22 }} />
            </View>

            <View style={styles.form}>

              {/* Job Description */}
              <Text style={styles.label}>{t('describeJob')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('jobPlaceholder')}
                placeholderTextColor="#bbb"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Date */}
              <Text style={styles.label}>{t('scheduledDate')}</Text>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#FF9D00" />
                <Text style={styles.pickerText}>{formatDate(scheduledDate)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={scheduledDate}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) setScheduledDate(date);
                  }}
                />
              )}

              {/* Time */}
              <Text style={styles.label}>{t('scheduledTime')}</Text>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#FF9D00" />
                <Text style={styles.pickerText}>{formatTime(scheduledTime)}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={scheduledTime}
                  mode="time"
                  onChange={(_, time) => {
                    setShowTimePicker(false);
                    if (time) setScheduledTime(time);
                  }}
                />
              )}

              {/* Location */}
              <Text style={styles.label}>{t('yourLocation')}</Text>
              <View style={styles.locationBox}>
                <Ionicons
                  name="location-sharp"
                  size={20}
                  color={latitude ? '#27AE60' : '#999'}
                />
                {locationLoading ? (
                  <ActivityIndicator color="#FF9D00" style={{ marginLeft: 10 }} />
                ) : (
                  <Text style={[styles.locationText, latitude && { color: '#27AE60' }]}>
                    {address || 'Getting your location...'}
                  </Text>
                )}
                <TouchableOpacity onPress={getLocation}>
                  <Ionicons name="refresh" size={18} color="#FF9D00" />
                </TouchableOpacity>
              </View>
              {latitude && (
                <Text style={styles.coordsText}>
                  {latitude.toFixed(5)}, {longitude?.toFixed(5)}
                </Text>
              )}

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.submitBtnText}>{t('sendHireRequest')}</Text>
                }
              </TouchableOpacity>

            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  title:       { fontSize: 18, fontWeight: 'bold', color: '#111' },
  form:        { paddingHorizontal: 24, paddingTop: 16 },
  label:       { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#222',
  },
  textArea:    { height: 120, paddingTop: 12 },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  pickerText:  { fontSize: 14, color: '#222' },
  locationBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: '#FAFAFA',
  },
  locationText: { flex: 1, fontSize: 13, color: '#999' },
  coordsText:   { fontSize: 11, color: '#bbb', marginTop: 4, paddingLeft: 4 },
  submitBtn: {
    backgroundColor: '#FF9D00', borderRadius: 30,
    paddingVertical: 16, alignItems: 'center', marginTop: 32, marginBottom: 20,
    shadowColor: '#FF9D00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});