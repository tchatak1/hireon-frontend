import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 200 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.heading}>Secure your account</Text>
            <Text style={styles.description}>
              Enter a new password for your account. Make sure it's strong and unique too.
            </Text>

            {/* New Password */}
            <Text style={styles.emailheader}>Enter new password</Text>
            <View style={styles.inputField}>
              <Image source={require('../assets/images/lock.png')} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="**********"
                placeholderTextColor="#999"
                autoCapitalize="none"
                secureTextEntry={!showPassword} // ✅ toggles visibility
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.emailheader}>Confirm password</Text>
            <View style={styles.inputField}>
              <Image source={require('../assets/images/lock.png')} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="**********"
                placeholderTextColor="#999"
                autoCapitalize="none"
                secureTextEntry={!showConfirm} // ✅ toggles visibility
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons
                  name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.signUp}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginTop: 10,
    color: '#8f8f8f',
  },
  emailheader: {
    paddingTop: 20,
    fontSize: 18,
    paddingBottom: 10,
  },
  input: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    color: '#000',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    padding: 10,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonWrapper: {
    paddingBottom: 30,
    paddingTop: 20,
    alignItems: 'center',
  },
  signUp: {
    alignItems: 'center',
    backgroundColor: '#FF9D00',
    paddingVertical: 15,
    width: '80%',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});