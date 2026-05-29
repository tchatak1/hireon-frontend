import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Image, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function AccountCreation() {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert(t('error'), t('fillFields')); return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('error'), 'Passwords do not match'); return;
    }
    if (password.length < 6) {
      Alert.alert(t('error'), 'Password must be at least 6 characters'); return;
    }
    try {
      setLoading(true);
      await registerUser({ name, email, phone_number: '00000', password });
      router.push('/registration_success');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
      router.push('/registration_failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={styles.Container}>
                <Text style={styles.Heading}>{t('createAccount')}</Text>

                <View style={styles.inputField}>
                  <Image source={require('../assets/images/User.png')} style={styles.icon} />
                  <TextInput style={styles.input} value={name} onChangeText={setName}
                    placeholder={t('fullName')} placeholderTextColor="#999" />
                </View>

                <View style={styles.inputField}>
                  <Image source={require('../assets/images/gmail.png')} style={styles.icon} />
                  <TextInput style={styles.input} value={email} onChangeText={setEmail}
                    placeholder={t('email')} placeholderTextColor="#999"
                    keyboardType="email-address" autoCapitalize="none" />
                </View>

                <View style={styles.inputField}>
                  <Image source={require('../assets/images/lock.png')} style={styles.icon} />
                  <TextInput style={styles.input} value={password} onChangeText={setPassword}
                    placeholder={t('password')} secureTextEntry={!showPassword} placeholderTextColor="#999" />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#999" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputField}>
                  <Image source={require('../assets/images/lock.png')} style={styles.icon} />
                  <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword}
                    placeholder={t('confirmPassword')} secureTextEntry={!showConfirm} placeholderTextColor="#999" />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={22} color="#999" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.signUp} onPress={handleRegister} disabled={loading}>
                  {loading
                    ? <ActivityIndicator color="white" />
                    : <Text style={{ fontWeight: 'bold', color: 'white' }}>{t('signUp')}</Text>
                  }
                </TouchableOpacity>

                <View style={styles.Or}>
                  <Text>{t('orSignInWith').replace('sign in', 'sign up')}</Text>
                </View>

                <View style={styles.socials}>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Image source={require('../assets/images/facebook.png')} style={styles.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Image source={require('../assets/images/google.png')} style={styles.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Image source={require('../assets/images/apple.png')} style={styles.icon} />
                  </TouchableOpacity>
                </View>

                <View style={{ alignSelf: 'center', marginBottom: 30 }}>
                  <Text>
                    {t('alreadyAccount')}
                    <Link href="/signIn" style={{ color: '#FF9D00' }}>{t('signIn')}</Link>
                  </Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  Container:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, paddingTop: 60, paddingBottom: 40 },
  Heading:     { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inputField: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    width: '80%', padding: 10, borderRadius: 7,
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
  },
  input:       { fontSize: 16, marginLeft: 10, flex: 1, color: '#000' },
  icon:        { width: 24, height: 24, resizeMode: 'contain' },
  signUp: {
    alignItems: 'center', marginTop: 30, backgroundColor: '#FF9D00',
    alignSelf: 'center', paddingVertical: 15, width: '80%', borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
  },
  Or:          { justifyContent: 'center', alignSelf: 'center' },
  socials:     { flexDirection: 'row', alignSelf: 'center', justifyContent: 'space-around', padding: 30, gap: 30 },
  socialIcon: {
    backgroundColor: 'white', borderRadius: 8, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
});