import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, StatusBar, TextInput, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getPlans, getSubscription, initiatePayment, checkPaymentStatus } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const PLAN_ICONS: Record<string, string> = {
  quarterly:   '🥉',
  semi_annual: '🥈',
  annual:      '🥇',
};

export default function SubscriptionScreen() {
  const router    = useRouter();
  const { t }     = useLanguage();
  const tAny      = t as (key: string) => string;

  const [plans,        setPlans]        = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [phone,        setPhone]        = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [paying,       setPaying]       = useState(false);
  const [polling,      setPolling]      = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [p, s] = await Promise.all([getPlans(), getSubscription()]);
      setPlans(p);
      setSubscription(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setPhone('');
    setShowModal(true);
  };

  const handlePay = async () => {
    if (!phone.trim()) {
      Alert.alert(t('error'), t('enterMomoError'));
      return;
    }
    setPaying(true);
    try {
      const result = await initiatePayment(selectedPlan.key, phone.trim());
      setPaying(false);
      setPolling(true);
      pollStatus(result.reference);
    } catch (err: any) {
      Alert.alert(t('paymentFailed'), err.message);
      setPaying(false);
    }
  };

  const pollStatus = async (ref: string) => {
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const result = await checkPaymentStatus(ref);
        if (result.status === 'SUCCESSFUL') {
          clearInterval(interval);
          setPolling(false);
          setShowModal(false);
          Alert.alert(
            t('paymentSuccess'),
            tAny('paymentSuccessMsg').replace('{label}', selectedPlan.label)
          );
          loadData();
        } else if (result.status === 'FAILED') {
          clearInterval(interval);
          setPolling(false);
          Alert.alert(t('paymentFailed'), t('paymentFailedMsg'));
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPolling(false);
          Alert.alert(t('paymentTimeout'), t('paymentTimeoutMsg'));
        }
      } catch (err) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 3000);
  };

  const BENEFITS = [
    t('benefit1'), t('benefit2'), t('benefit3'), t('benefit4'), t('benefit5'),
  ];

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#FF9D00" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('subscription')}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Active subscription banner */}
            {subscription?.is_active && (
              <View style={styles.activeBanner}>
                <Ionicons name="checkmark-circle" size={22} color="#27AE60" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.activeBannerTitle}>{t('subscriptionActive')}</Text>
                  <Text style={styles.activeBannerSub}>
                    {tAny('subscriptionActiveSub')
                      .replace('{label}', subscription.label)
                      .replace('{date}', subscription.expires_at)
                      .replace('{days}', subscription.days_left)}
                  </Text>
                </View>
              </View>
            )}

            {/* Hero */}
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>
                {subscription?.is_active ? t('renewYourPlan') : t('subscribeToHireon')}
              </Text>
              <Text style={styles.heroSub}>{t('subscribeHeroSub')}</Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsBox}>
              <Text style={styles.benefitsTitle}>{t('allPlansInclude')}</Text>
              {BENEFITS.map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#FF9D00" />
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>

            {/* Plans */}
            <Text style={styles.plansTitle}>{t('choosePlan')}</Text>
            {plans.map((plan) => {
              const isPopular = plan.key === 'annual';
              return (
                <TouchableOpacity
                  key={plan.key}
                  style={[styles.planCard, isPopular && styles.planCardPopular]}
                  onPress={() => handleSelectPlan(plan)}
                  activeOpacity={0.85}
                >
                  {isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>{t('bestValue')}</Text>
                    </View>
                  )}
                  <View style={styles.planRow}>
                    <Text style={styles.planIcon}>{PLAN_ICONS[plan.key]}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planLabel}>{plan.label}</Text>
                      <Text style={styles.planSub}>
                        {Math.round(plan.amount / (plan.duration_days / 30))} {t('perMonth')}
                      </Text>
                    </View>
                    <View style={styles.planPriceBox}>
                      <Text style={styles.planPrice}>{plan.amount}</Text>
                      <Text style={styles.planCurrency}>XAF</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.planBtn, isPopular && styles.planBtnPopular]}
                    onPress={() => handleSelectPlan(plan)}
                  >
                    <Text style={[styles.planBtnText, isPopular && styles.planBtnTextPopular]}>
                      {t('subscribe')}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Payment Modal */}
          <Modal visible={showModal} transparent animationType="slide">
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => { if (!paying && !polling) setShowModal(false); }}
              >
                <View style={styles.modalSheet}>
                  <View style={styles.modalHandle} />

                  {polling ? (
                    <View style={styles.pollingBox}>
                      <ActivityIndicator size="large" color="#FF9D00" />
                      <Text style={styles.pollingTitle}>{t('waitingPayment')}</Text>
                      <Text style={styles.pollingSub}>{t('approveOnPhone')}</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.modalTitle}>
                        {selectedPlan?.label} — {selectedPlan?.amount} XAF
                      </Text>
                      <Text style={styles.modalSub}>{t('enterMomoNumber')}</Text>

                      <View style={styles.phoneRow}>
                        <View style={styles.phoneFlag}>
                          <Text style={{ fontSize: 18 }}>🇨🇲</Text>
                          <Text style={styles.phonePre}>+237</Text>
                        </View>
                        <TextInput
                          style={styles.phoneInput}
                          placeholder="6XX XXX XXX"
                          placeholderTextColor="#bbb"
                          keyboardType="phone-pad"
                          value={phone}
                          onChangeText={setPhone}
                          maxLength={9}
                        />
                      </View>

                      <TouchableOpacity
                        style={[styles.payBtn, paying && styles.payBtnDisabled]}
                        onPress={handlePay}
                        disabled={paying}
                      >
                        {paying
                          ? <ActivityIndicator color="#fff" />
                          : <>
                              <Ionicons name="phone-portrait-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                              <Text style={styles.payBtnText}>{t('payWithMomo')}</Text>
                            </>
                        }
                      </TouchableOpacity>

                      <Text style={styles.modalNote}>{t('momoNote')}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </Modal>

        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingBox:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  headerTitle:       { fontSize: 18, fontWeight: 'bold', color: '#111' },
  activeBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F8EF', margin: 16, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#27AE60',
  },
  activeBannerTitle: { fontSize: 14, fontWeight: '700', color: '#27AE60' },
  activeBannerSub:   { fontSize: 12, color: '#555', marginTop: 2 },
  hero:              { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  heroTitle:         { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  heroSub:           { fontSize: 14, color: '#666', lineHeight: 20 },
  benefitsBox: {
    marginHorizontal: 16, backgroundColor: '#fff',
    borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  benefitsTitle:     { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 12 },
  benefitRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  benefitText:       { fontSize: 13, color: '#333' },
  plansTitle:        { fontSize: 16, fontWeight: '700', color: '#111', paddingHorizontal: 16, marginBottom: 12 },
  planCard: {
    marginHorizontal: 16, marginBottom: 14, backgroundColor: '#fff',
    borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#E8E8E8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  planCardPopular:   { borderColor: '#FF9D00', backgroundColor: '#FFFBF0' },
  popularBadge: {
    alignSelf: 'flex-start', backgroundColor: '#FF9D00',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10,
  },
  popularBadgeText:  { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  planRow:           { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  planIcon:          { fontSize: 28, marginRight: 12 },
  planLabel:         { fontSize: 16, fontWeight: '700', color: '#111' },
  planSub:           { fontSize: 12, color: '#888', marginTop: 2 },
  planPriceBox:      { alignItems: 'flex-end' },
  planPrice:         { fontSize: 24, fontWeight: '800', color: '#FF9D00' },
  planCurrency:      { fontSize: 12, color: '#888' },
  planBtn: {
    borderWidth: 1.5, borderColor: '#FF9D00', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  planBtnPopular:    { backgroundColor: '#FF9D00' },
  planBtnText:       { color: '#FF9D00', fontWeight: '700', fontSize: 14 },
  planBtnTextPopular:{ color: '#fff' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 44, paddingTop: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle:        { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 6 },
  modalSub:          { fontSize: 13, color: '#888', marginBottom: 20 },
  phoneRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  phoneFlag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F5F5F5', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 14,
  },
  phonePre:          { fontSize: 14, fontWeight: '600', color: '#333' },
  phoneInput: {
    flex: 1, backgroundColor: '#F5F5F5', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 16, color: '#222',
  },
  payBtn: {
    backgroundColor: '#FF9D00', borderRadius: 12,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
  },
  payBtnDisabled:    { backgroundColor: '#FFD580' },
  payBtnText:        { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalNote:         { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 14, lineHeight: 18 },
  pollingBox:        { alignItems: 'center', paddingVertical: 30, gap: 14 },
  pollingTitle:      { fontSize: 18, fontWeight: '700', color: '#111' },
  pollingSub:        { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
});