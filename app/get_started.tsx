import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

export class get_started extends Component {
  render() {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView>
              <View style={styles.container1}>
                <Image source={require('../assets/images/logo_final.png')} style={styles.logo} />
                <Text style={styles.start}>Let's Get Started</Text>
                <Text>Let's Dive into your account</Text>
              </View>
              <View style={styles.underView}>
                <TouchableOpacity style={styles.continue}>
                  <Image source={require('../assets/images/apple.png')} />
                  <Text style={styles.orangeText}> Continue with apple</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continue}>
                  <Image source={require('../assets/images/google.png')} />
                  <Text style={styles.orangeText}> Continue with google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continue}>
                  <Image source={require('../assets/images/facebook.png')} />
                  <Text style={styles.orangeText}> Continue with facebook</Text>
                </TouchableOpacity>
                <Link href="/signIn" style={styles.signIn}>
                  <Text style={styles.whiteText}>Sign in</Text>
                </Link>
                <Link href="/accountCreation" style={styles.signUp}>
                  <Text style={styles.orangeText}>Sign up</Text>
                </Link>
                <View style={styles.end}>
                  <Text>Terms and Conditions</Text>
                  <Text>.</Text>
                  <Text>Privacy Policy</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </>
    )
  }
}

const styles = StyleSheet.create({
  logo: {
    height: 200,
    resizeMode: 'contain',
  },
  container1: {
    alignItems: 'center',
    marginTop: 30,
  },
  start: {
    fontWeight: "bold",
    fontSize: 30,
  },
  underView: {
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: '#ffce80ff',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: "#FF9D00",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  continue: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: "#FF9D00",
    borderRadius: 7,
    paddingLeft: 10,
    marginVertical: 10,
    width: "80%",
    height: 50,
    textAlign: 'center',
    alignItems: 'center',
  },
  orangeText: {
    color: '#FF9D00',
    fontSize: 15,
  },
  whiteText: {
    color: '#ffffff',
    fontSize: 15,
  },
  signIn: {
    textAlign: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#FF9D00",
    backgroundColor: '#FF9D00',
    borderRadius: 7,
    paddingVertical: 15,
    marginTop: 20,
    width: '80%',
  },
  signUp: {
    textAlign: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#FF9D00",
    borderRadius: 7,
    paddingVertical: 15,
    marginTop: 10,
    width: '80%',
  },
  end: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 30,
    justifyContent: 'space-around',
    width: "80%",
  }
})

export default get_started