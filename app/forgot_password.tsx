import React from 'react';
import {
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

export default function ForgotPassword() {
  const { t } = useLanguage();
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
              <View style={styles.content}>
                <Text style={styles.heading}>{t('passwordForgotten')}</Text>
                <Text style={styles.description}>
                  {t('enterEmail')}
                </Text>
                <Text style={styles.emailheader}>{t('enterEmail')}</Text>
                <View style={styles.inputField}>
                  <Image source={require('../assets/images/gmail.png')} style={styles.icon} />
                  <TextInput
                    style={styles.input} placeholder="Email@gmail.com"
                    placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none"
                  />
                </View>
              </View>
              <View style={styles.buttonWrapper}>
                <TouchableOpacity style={styles.signUp}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('sendOtp')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  content:       { flex: 1, paddingHorizontal: 20, paddingTop: 20, justifyContent: 'center' },
  heading:       { fontSize: 24, fontWeight: 'bold' },
  description:   { fontSize: 16, marginTop: 10, color: '#8f8f8f' },
  emailheader:   { paddingTop: 20, fontSize: 18, fontWeight: 'bold', paddingBottom: 10 },
  input:         { fontSize: 16, marginLeft: 10, flex: 1, color: '#000' },
  icon:          { width: 24, height: 24, resizeMode: 'contain' },
  inputField: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    width: '100%', padding: 10, borderRadius: 7,
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
  },
  buttonWrapper: { paddingBottom: 30, paddingTop: 20, alignItems: 'center' },
  signUp: {
    alignItems: 'center', backgroundColor: '#FF9D00', paddingVertical: 15,
    width: '80%', borderRadius: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
  },
});