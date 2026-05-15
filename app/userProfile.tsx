import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Modal,
  TextInput, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, submitReview, markJobCompleted } from '../utils/api';

export default function UserProfileScreen() {
  const router = useRouter();
  const { user_id, request_id, can_rate, can_complete } = useLocalSearchParams<{
    user_id:      string;
    request_id?:  string;
    can_rate?:    string;
    can_complete?:string;
  }>();

  const [profile,       setProfile]       = useState<any>(null);
  const [loading,       setLoading]       = useState(true);
  const [showRating,    setShowRating]    = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [comment,       setComment]       = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [completing,    setCompleting]    = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile(user_id);
      setProfile(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    Alert.alert(
      'Mark as Completed',
      'Are you sure you want to mark this job as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Completed',
          onPress: async () => {
            try {
              setCompleting(true);
              await markJobCompleted(request_id!);
              Alert.alert(
                '✅ Job Completed',
                'The job has been marked as completed. You can now rate the provider.',
                [{ text: 'Rate Now', onPress: () => setShowRating(true) }]
              );
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setCompleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmitReview = async () => {
    if (selectedStars === 0) {
      Alert.alert('Error', 'Please select a star rating');
      return;
    }
    try {
      setSubmitting(true);
      await submitReview({
        request_id: request_id!,
        rating:     selectedStars,
        comment:    comment.trim() || undefined,
      });
      setShowRating(false);
      Alert.alert('✅ Review Submitted', 'Thank you for your feedback!');
      fetchProfile(); // refresh to show new rating
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size = 16, interactive = false) => (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => interactive && setSelectedStars(star)}
          disabled={!interactive}
          activeOpacity={interactive ? 0.7 : 1}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color="#FF9D00"
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#FF9D00" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingBox}>
        <Text style={{ color: '#999' }}>Profile not found</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={22} color="#111" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile</Text>
              <View style={{ width: 22 }} />
            </View>

            {/* Avatar + Name */}
            <View style={styles.profileTop}>
              <Image
                source={
                  profile.profile_picture
                    ? { uri: profile.profile_picture }
                    : { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }
                }
                style={styles.avatar}
              />
              <Text style={styles.name}>{profile.name}</Text>

              {/* Skill + Availability */}
              <View style={styles.badgeRow}>
                {profile.category && (
                  <View style={styles.skillBadge}>
                    <Text style={styles.skillBadgeText}>{profile.category}</Text>
                  </View>
                )}
                <View style={[
                  styles.availBadge,
                  { backgroundColor: profile.availability ? '#EAFAF1' : '#FDEDEC' }
                ]}>
                  <View style={[
                    styles.availDot,
                    { backgroundColor: profile.availability ? '#27AE60' : '#E74C3C' }
                  ]} />
                  <Text style={[
                    styles.availText,
                    { color: profile.availability ? '#27AE60' : '#E74C3C' }
                  ]}>
                    {profile.availability ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>

              {/* Location */}
              {profile.city && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-sharp" size={14} color="#FF9D00" />
                  <Text style={styles.locationText}>
                    {profile.city}{profile.location ? `, ${profile.location}` : ''}
                  </Text>
                </View>
              )}

              {/* Rating summary */}
              <View style={styles.ratingRow}>
                {renderStars(Math.round(profile.average_rating || 0))}
                <Text style={styles.ratingText}>
                  {profile.average_rating
                    ? `${profile.average_rating} / 5`
                    : 'No ratings yet'}
                </Text>
                <Text style={styles.reviewCount}>
                  ({profile.total_reviews} review{profile.total_reviews !== 1 ? 's' : ''})
                </Text>
              </View>
            </View>

            {/* Bio */}
            {profile.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              {/* Mark Completed button */}
              {can_complete === 'true' && (
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={handleMarkCompleted}
                  disabled={completing}
                >
                  {completing
                    ? <ActivityIndicator color="white" size="small" />
                    : <>
                        <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                        <Text style={styles.completeBtnText}>Mark Completed</Text>
                      </>
                  }
                </TouchableOpacity>
              )}

              {/* Rate button */}
              {can_rate === 'true' && (
                <TouchableOpacity
                  style={styles.rateBtn}
                  onPress={() => setShowRating(true)}
                >
                  <Ionicons name="star-outline" size={18} color="#FF9D00" />
                  <Text style={styles.rateBtnText}>Rate</Text>
                </TouchableOpacity>
              )}

              {/* Hire button */}
              <TouchableOpacity
                style={styles.hireBtn}
                onPress={() => router.push({
                  pathname: '/hireForm',
                  params: { provider_id: user_id, provider_name: profile.name },
                })}
              >
                <Ionicons name="briefcase-outline" size={18} color="white" />
                <Text style={styles.hireBtnText}>Hire</Text>
              </TouchableOpacity>
            </View>

            {/* Reviews */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Reviews ({profile.total_reviews})
              </Text>
              {profile.reviews.length === 0 ? (
                <Text style={styles.noReviews}>No reviews yet</Text>
              ) : (
                profile.reviews.map((review: any) => (
                  <View key={review.review_id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Image
                        source={
                          review.reviewer?.profile_picture
                            ? { uri: review.reviewer.profile_picture }
                            : { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
                        }
                        style={styles.reviewerAvatar}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewerName}>
                          {review.reviewer?.name || 'Anonymous'}
                        </Text>
                        {renderStars(review.rating, 14)}
                      </View>
                    </View>
                    {review.comment && (
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    )}
                  </View>
                ))
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Rating Modal */}
      <Modal visible={showRating} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate {profile.name}</Text>
            <Text style={styles.modalSubtitle}>How was your experience?</Text>

            {/* Stars */}
            <View style={styles.starsRow}>
              {renderStars(selectedStars, 40, true)}
            </View>
            <Text style={styles.starLabel}>
              {selectedStars === 0 ? 'Tap to rate'
               : selectedStars === 1 ? 'Poor'
               : selectedStars === 2 ? 'Fair'
               : selectedStars === 3 ? 'Good'
               : selectedStars === 4 ? 'Very Good'
               : 'Excellent!'}
            </Text>

            {/* Comment */}
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Leave a comment (optional)..."
              placeholderTextColor="#bbb"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowRating(false); setSelectedStars(0); setComment(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitReview}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={styles.submitBtnText}>Submit</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loadingBox:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  headerTitle:   { fontSize: 18, fontWeight: 'bold', color: '#111' },
  profileTop:    { alignItems: 'center', paddingTop: 24, paddingBottom: 16, paddingHorizontal: 20 },
  avatar: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: '#FF9D00', marginBottom: 12,
  },
  name:          { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  badgeRow:      { flexDirection: 'row', gap: 8, marginBottom: 8 },
  skillBadge: {
    backgroundColor: '#FFF4E5', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: '#FF9D00',
  },
  skillBadgeText:{ color: '#FF9D00', fontWeight: '600', fontSize: 13 },
  availBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  availDot:      { width: 8, height: 8, borderRadius: 4 },
  availText:     { fontSize: 12, fontWeight: '600' },
  locationRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  locationText:  { fontSize: 14, color: '#666' },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingText:    { fontSize: 14, fontWeight: '600', color: '#FF9D00' },
  reviewCount:   { fontSize: 13, color: '#999' },
  section:       { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  sectionTitle:  { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  bioText:       { fontSize: 14, color: '#555', lineHeight: 22 },
  actionRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#F3F3F3',
  },
  hireBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    backgroundColor: '#FF9D00', borderRadius: 10, paddingVertical: 12,
    shadowColor: '#FF9D00', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  hireBtnText:    { color: 'white', fontWeight: 'bold', fontSize: 14 },
  completeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    backgroundColor: '#27AE60', borderRadius: 10, paddingVertical: 12,
  },
  completeBtnText:{ color: 'white', fontWeight: 'bold', fontSize: 14 },
  rateBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#FF9D00', borderRadius: 10, paddingVertical: 12,
  },
  rateBtnText:    { color: '#FF9D00', fontWeight: 'bold', fontSize: 14 },
  noReviews:      { color: '#999', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  reviewCard: {
    backgroundColor: '#FAFAFA', borderRadius: 10,
    padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  reviewHeader:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  reviewerAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewerName:   { fontSize: 13, fontWeight: '600', color: '#222', marginBottom: 3 },
  reviewComment:  { fontSize: 13, color: '#555', lineHeight: 18 },
  modalBackdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle:     { fontSize: 20, fontWeight: 'bold', color: '#111', textAlign: 'center', marginBottom: 4 },
  modalSubtitle:  { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 20 },
  starsRow:       { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starLabel:      { textAlign: 'center', color: '#FF9D00', fontWeight: '600', fontSize: 15, marginBottom: 16 },
  commentInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#222', height: 90,
    marginBottom: 20,
  },
  modalButtons:   { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center',
  },
  cancelBtnText:  { color: '#666', fontWeight: '600' },
  submitBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10,
    backgroundColor: '#FF9D00', alignItems: 'center',
  },
  submitBtnText:  { color: 'white', fontWeight: 'bold' },
});