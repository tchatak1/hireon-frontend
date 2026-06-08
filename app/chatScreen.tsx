import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Image, KeyboardAvoidingView,
  Platform, ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessages, sendMessage } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function ChatScreen() {
  const router = useRouter();
  const { conversation_id, other_name, other_image } = useLocalSearchParams<{
    conversation_id: string;
    other_user_id:   string;
    other_name:      string;
    other_image:     string;
  }>();

  const [messages,    setMessages]    = useState<any[]>([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { t }   = useLanguage();
  const listRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then(raw => {
      if (raw) setCurrentUser(JSON.parse(raw));
    });
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await getMessages(conversation_id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await sendMessage(conversation_id, text);
      setMessages(prev => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      if (err.message?.includes('subscription')) {
        Alert.alert(
          '⚠️ Subscription Required',
          'You need an active subscription to send messages.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: '📋 Subscribe', onPress: () => router.push('/subscription' as any) },
          ]
        );
      } else {
        setInput(text);
        Alert.alert('Error', err.message || 'Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  const getRelativeTime = (dateStr: string): string => {
    if (!dateStr) return '';
    const tAny     = t as (key: string) => string;
    const diffMs   = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1)   return tAny('justNow');
    if (diffMins < 60)  return `${diffMins}${tAny('minsAgo')}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}${tAny('hoursAgo')}`;
    return `${Math.floor(diffHours / 24)}${tAny('daysAgo')}`;
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isMe     = currentUser && String(item.sender_id) === String(currentUser.user_id);
    const prevItem = index > 0 ? messages[index - 1] : null;
    const showTime = !prevItem ||
      new Date(item.created_at).getTime() - new Date(prevItem.created_at).getTime() > 5 * 60_000;

    return (
      <>
        {showTime && (
          <Text style={styles.timeLabel}>{getRelativeTime(item.created_at)}</Text>
        )}
        <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}>
          {!isMe && (
            <Image
              source={
                other_image
                  ? { uri: other_image }
                  : { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
              }
              style={styles.bubbleAvatar}
            />
          )}
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
              {item.content}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Image
          source={
            other_image
              ? { uri: other_image }
              : { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
          }
          style={styles.headerAvatar}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerName}>{other_name}</Text>
          <Text style={styles.headerSub}>{t('tapViewProfile')}</Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={22} color="#111" />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF9D00" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.message_id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ddd" />
                <Text style={styles.emptyText}>{t('sayHello')}</Text>
              </View>
            }
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={t('typeMessage')}
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={18} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#fff' },
  loadingBox:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
    backgroundColor: '#fff',
  },
  headerAvatar:    { width: 40, height: 40, borderRadius: 20 },
  headerName:      { fontSize: 15, fontWeight: '700', color: '#111' },
  headerSub:       { fontSize: 11, color: '#999' },
  messagesList:    { padding: 16, paddingBottom: 8, gap: 4 },
  timeLabel:       { textAlign: 'center', fontSize: 11, color: '#bbb', marginVertical: 8 },
  bubbleRow:       { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 2 },
  bubbleRowMe:     { justifyContent: 'flex-end' },
  bubbleRowThem:   { justifyContent: 'flex-start', gap: 8 },
  bubbleAvatar:    { width: 28, height: 28, borderRadius: 14 },
  bubble: {
    maxWidth: '72%', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe:        { backgroundColor: '#FF9D00', borderBottomRightRadius: 4 },
  bubbleThem:      { backgroundColor: '#F1F1F1', borderBottomLeftRadius: 4 },
  bubbleText:      { fontSize: 14, color: '#222', lineHeight: 20 },
  bubbleTextMe:    { color: '#fff' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    backgroundColor: '#fff', gap: 10,
  },
  input: {
    flex: 1, minHeight: 42, maxHeight: 120,
    backgroundColor: '#F5F5F5', borderRadius: 21,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: '#222',
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#FF9D00', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#FFD580' },
  emptyBox:        { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText:       { fontSize: 15, color: '#bbb' },
});