import React, { useRef, useEffect } from 'react';
import { Link } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedImageScreen: React.FC = () => {
  const { t } = useLanguage();
  const opacity = useRef(new Animated.Value(0));
  const scale = useRef(new Animated.Value(0.5));

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity.current, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scale.current, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={styles.container}>
          <Animated.Image
            source={require('../assets/images/oups.png')}
            style={[
              styles.image,
              {
                opacity: opacity.current,
                transform: [{ scale: scale.current }],
              },
            ]}
            resizeMode="contain"
          />
          <Text style={styles.congrats}>{t('oopsSorry')}</Text>
          <Text style={styles.message}>{t('errorOccurred')}</Text>
          <Link href="/accountCreation" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>{t('back')}</Text>
            </TouchableOpacity>
          </Link>
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