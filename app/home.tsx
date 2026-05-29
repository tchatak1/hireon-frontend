import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen          from '../screens/HomeScreen';
import FavouritesScreen    from '../screens/FavouritesScreen';
import ChatsScreen         from '../screens/ChatsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen       from '../screens/ProfileScreen';
import { getNotifications, getConversations } from '../utils/api';

const TABS = [
  { key: 'Home',          icon: 'home',            iconOut: 'home-outline' },
  { key: 'Favourites',    icon: 'star',            iconOut: 'star-outline' },
  { key: 'Chats',         icon: 'chatbubbles',     iconOut: 'chatbubbles-outline' },
  { key: 'Notifications', icon: 'notifications',   iconOut: 'notifications-outline' },
  { key: 'Profile',       icon: 'person',          iconOut: 'person-outline' },
];

export default function MainApp() {
  const [activeTab,    setActiveTab]    = useState('Home');
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadChats,  setUnreadChats]  = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const [notifs, convs] = await Promise.all([getNotifications(), getConversations()]);
      setUnreadNotifs(notifs.filter((n: any) => !n.is_read).length);
      setUnreadChats(convs.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0));
    } catch (_) {}
  }, []);

  useEffect(() => { refreshUnread(); }, []);

  useEffect(() => {
    if (activeTab !== 'Notifications' && activeTab !== 'Chats') refreshUnread();
  }, [activeTab]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':          return <HomeScreen />;
      case 'Favourites':    return <FavouritesScreen />;
      case 'Chats':         return <ChatsScreen />;
      case 'Notifications': return <NotificationsScreen onUnreadChange={setUnreadNotifs} />;
      case 'Profile':       return <ProfileScreen />;
      default:              return <HomeScreen />;
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={styles.appContainer}>
          <View style={{ flex: 1 }}>{renderScreen()}</View>

          {/* Bottom Tab Bar */}
          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const isActive   = activeTab === tab.key;
              const isNotif    = tab.key === 'Notifications';
              const isChat     = tab.key === 'Chats';
              const badgeCount = isNotif ? unreadNotifs : isChat ? unreadChats : 0;

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tabItem}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.7}
                >
                  {isActive && <View style={styles.activePill} />}
                  <View style={{ position: 'relative' }}>
                    <Ionicons
                      name={(isActive ? tab.icon : tab.iconOut) as any}
                      size={24}
                      color={isActive ? '#FF9D00' : '#BDBDBD'}
                    />
                    {badgeCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 10,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4, gap: 3,
  },
  activePill: {
    position: 'absolute', top: -8,
    width: 28, height: 3, borderRadius: 2, backgroundColor: '#FF9D00',
  },
  tabLabel:       { fontSize: 10, color: '#BDBDBD', marginTop: 1 },
  tabLabelActive: { color: '#FF9D00', fontWeight: '700' },
  badge: {
    position: 'absolute', top: -5, right: -7,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#E74C3C', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});