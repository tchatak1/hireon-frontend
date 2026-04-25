import { Text, View,ScrollView} from "react-native";
import {Link} from 'expo-router';
import {React} from 'react';


export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href="/accountCreation">
        <Text >account creation</Text>
      </Link>
      <Link href="/registration_success">
        <Text >Registration_account</Text>
      </Link>
      <Link href="/registration_failure">
        <Text >Registration_failure</Text>
      </Link>
      <Link href="/get_started">
        <Text >Getting started</Text>
      </Link>
      <Link href="/Loading">
        <Text >Loader</Text>
      </Link>
      <Text>----------------------------------------</Text>
      <Link href="/profile_setup">
        <Text >profile setup</Text>
      </Link>
      <Link href="/signIn">
        <Text >Sign in</Text>
      </Link>
      <Text>----------------------------------------</Text>
      <Link href="/forgot_password">
        <Text >Forgot Password</Text>
      </Link>
      <Link href="/forgot_password_two">
        <Text >Forgot Password 2</Text>
      </Link>
      <Link href="/secureAccount">
        <Text >Secure account</Text>
      </Link>
      <Text>----------------------------------------</Text>
      <Link href="/home">
        <Text >Home</Text>
      </Link>
    </View>
    
  );
}
