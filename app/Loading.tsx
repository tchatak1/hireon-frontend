import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoadingScreen = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={styles.container}>
          <Animated.Image
            source={require('../assets/images/logo_final.png')}
            style={[styles.logo, { transform: [{ rotate: spin }] }]}
          />
          <Text style={styles.text}>Loading...</Text>
          <ActivityIndicator size="large" color="#FF9D00" style={styles.indicator} />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#FF9D00',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  indicator: {
    marginTop: 10,
  },
});

export default LoadingScreen;