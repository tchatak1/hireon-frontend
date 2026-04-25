import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen          from '../screens/HomeScreen';
import FavouritesScreen    from '../screens/FavouritesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen       from '../screens/ProfileScreen';

const TABS = [
  { key: 'Home',          icon: 'home',          iconOut: 'home-outline' },
  { key: 'Favourites',    icon: 'star',          iconOut: 'star-outline' },
  { key: 'Notifications', icon: 'notifications', iconOut: 'notifications-outline' },
  { key: 'Profile',       icon: 'person',        iconOut: 'person-outline' },
];

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':          return <HomeScreen />;
      case 'Favourites':    return <FavouritesScreen />;
      case 'Notifications': return <NotificationsScreen />;
      case 'Profile':       return <ProfileScreen />;
      default:              return <HomeScreen />;
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={styles.appContainer}>

          <View style={{ flex: 1 }}>
            {renderScreen()}
          </View>

          {/* Bottom Tab Bar */}
          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tabItem}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Ionicons
                    name={(isActive ? tab.icon : tab.iconOut) as any}
                    size={24}
                    color={isActive ? '#FF9D00' : '#999'}
                  />
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.key}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#FFF8EE',
    borderTopWidth: 1, borderTopColor: '#FFE0A0',
    paddingVertical: 10, paddingHorizontal: 10,
    alignItems: 'center', position: 'relative',
  },
  tabItem:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel:       { fontSize: 10, color: '#999', marginTop: 3 },
  tabLabelActive: { color: '#FF9D00', fontWeight: '600' },
  fab: {
    position: 'absolute', left: '50%', top: -22,
    transform: [{ translateX: -24 }],
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FF9D00', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF9D00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
});