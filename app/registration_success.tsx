import { Link } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedImageScreen: React.FC = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={styles.container}>
          <Animated.Image
            source={require('../assets/images/Union2.png')}
            style={[styles.image, { opacity, transform: [{ scale }] }]}
            resizeMode="contain"
          />
          <Text style={styles.congrats}>Congratulations</Text>
          <Text style={styles.message}>Your Account has been Successfully Created</Text>
          <TouchableOpacity style={styles.button}>
          <Link href="/profile_setup">

            <Text style={styles.buttonText}>Continue</Text>
          </Link>

          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  congrats: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FF9D00',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#333',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 100,
    backgroundColor: '#FF9D00',
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AnimatedImageScreen;