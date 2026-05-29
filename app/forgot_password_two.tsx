import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../context/LanguageContext";

const OTP_LENGTH = 5;

export default function OTPScreen() {
  const [otp,       setOtp]       = useState("");
  const [timer,     setTimer]     = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (timer === 0) { setCanResend(true); return; }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (!canResend) return;
    setOtp(""); setTimer(30); setCanResend(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const digits = otp.split("");

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FF9D00" }}>
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <TextInput
                ref={inputRef} value={otp}
                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH))}
                keyboardType="number-pad" maxLength={OTP_LENGTH}
                style={styles.hiddenInput} caretHidden autoFocus
              />
              <View style={styles.header}>
                <Text style={styles.title}>{t('enterOtp')}</Text>
                <Text style={styles.subtitle}>
                  Check your email inbox for a message. Enter the one-time password (OTP) you received below.
                </Text>
              </View>
              <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}>
                <View style={styles.otpRow}>
                  {Array(OTP_LENGTH).fill("").map((_, index) => {
                    const filled   = digits[index] !== undefined;
                    const isActive = index === digits.length;
                    return (
                      <View key={index} style={[styles.otpBox, filled && styles.otpBoxFilled, isActive && styles.otpBoxActive]}>
                        <Text style={styles.otpText}>{digits[index] || ""}</Text>
                      </View>
                    );
                  })}
                </View>
              </TouchableOpacity>
              <View style={styles.resendRow}>
                {!canResend && (
                  <Text style={styles.resendInfo}>
                    You can resend in <Text style={styles.timerText}>{timer}s</Text>
                  </Text>
                )}
                <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                  <Text style={[styles.resendBtn, !canResend && styles.resendDisabled]}>Resend</Text>
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
  hiddenInput:    { position: "absolute", width: 1, height: 1, opacity: 0 },
  header:         { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 30 },
  title:          { fontSize: 28, fontWeight: "bold", color: "#111", marginBottom: 12 },
  subtitle:       { fontSize: 14, color: "#8f8f8f", lineHeight: 20 },
  otpRow:         { flexDirection: "row", justifyContent: "center", gap: 12, paddingHorizontal: 24, marginBottom: 24 },
  otpBox: {
    width: 52, height: 52, borderRadius: 10, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  otpBoxFilled:   { borderColor: "#FF9D00", backgroundColor: "#FFFBF2" },
  otpBoxActive:   { borderColor: "#FF9D00", borderWidth: 2 },
  otpText:        { fontSize: 22, fontWeight: "600", color: "#111" },
  resendRow:      { alignItems: "center", gap: 6 },
  resendInfo:     { fontSize: 14, color: "#555" },
  timerText:      { color: "#FF9D00", fontWeight: "600" },
  resendBtn:      { fontSize: 15, color: "#FF9D00", fontWeight: "600" },
  resendDisabled: { opacity: 0.4 },
});