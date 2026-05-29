import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConversations } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function ChatsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [currentUser,   setCurrentUser]   = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then(raw => {
      if (raw) setCurrentUser(JSON.parse(raw));
    });
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchConversations(); };

  const getRelativeTime = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    const diffMs   = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1)   return t('justNow');
    if (diffMins < 60)  return `${diffMins}${t('minsAgo')}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}${t('hoursAgo')}`;
    const diffDays  = Math.floor(diffHours / 24);
    if (diffDays === 1) return t('yesterday');
    return `${diffDays}${t('daysAgo')}`;
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.convRow}
      activeOpacity={0.8}
      onPress={() => router.push({
        pathname: '/chatScreen',
        params: {
          conversation_id: item.conversation_id,
          other_user_id:   item.other_user.user_id,
          other_name:      item.other_user.name,
          other_image:     item.other_user.profile_picture || '',
        },
      })}
    >
      {/* Avatar */}
      <Image
        source={
          item.other_user.profile_picture
            ? { uri: item.other_user.profile_picture }
            : { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
        }
        style={styles.avatar}
      />

      {/* Unread dot */}
      {item.unread_count > 0 && <View style={styles.unreadDot} />}

      {/* Content */}
      <View style={styles.convContent}>
        <View style={styles.convTop}>
          <Text style={[styles.convName, item.unread_count > 0 && styles.convNameBold]}>
            {item.other_user.name}
          </Text>
          <Text style={styles.convTime}>{getRelativeTime(item.last_message_at)}</Text>
        </View>
        <View style={styles.convBottom}>
          <Text
            style={[styles.lastMsg, item.unread_count > 0 && styles.lastMsgBold]}
            numberOfLines={1}
          >
            {item.last_message || t('noConversations')}
          </Text>
          {item.unread_count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unread_count > 9 ? '9+' : item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={
            currentUser?.profile_picture
              ? { uri: currentUser.profile_picture }
              : { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
          }
          style={styles.headerAvatar}
        />
        <Text style={styles.headerTitle}>{t('messages')}</Text>
        <Ionicons name="create-outline" size={24} color="#111" />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FF9D00" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversation_id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF9D00']} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="chatbubbles-outline" size={52} color="#ddd" />
              <Text style={styles.emptyText}>{t('noConversations')}</Text>
              <Text style={styles.emptySubText}>
                {t('noConvSub')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#fff' },
  loadingBox:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  headerAvatar:  { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#FF9D00' },
  headerTitle:   { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#111', marginLeft: 10 },
  convRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, position: 'relative',
  },
  avatar:        { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
  unreadDot: {
    position: 'absolute', left: 56, top: 14,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#FF9D00', borderWidth: 2, borderColor: '#fff',
  },
  convContent:   { flex: 1 },
  convTop:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName:      { fontSize: 15, color: '#111', fontWeight: '500' },
  convNameBold:  { fontWeight: '700' },
  convTime:      { fontSize: 12, color: '#999' },
  convBottom:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lastMsg:       { fontSize: 13, color: '#999', flex: 1 },
  lastMsgBold:   { color: '#333', fontWeight: '600' },
  badge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: '#FF9D00', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 4, marginLeft: 8,
  },
  badgeText:     { color: '#fff', fontSize: 11, fontWeight: '700' },
  separator:     { height: 1, backgroundColor: '#F5F5F5', marginLeft: 80 },
  emptyBox:      { alignItems: 'center', paddingTop: 100, paddingHorizontal: 40, gap: 12 },
  emptyText:     { fontSize: 16, fontWeight: '600', color: '#999' },
  emptySubText:  { fontSize: 13, color: '#bbb', textAlign: 'center', lineHeight: 20 },
});