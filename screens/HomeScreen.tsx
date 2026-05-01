import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, FlatList,
  Image, ActivityIndicator, RefreshControl,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers } from '../utils/api';
import { ProfessionalCard } from '../components/ProfessionalCard';

const { width } = Dimensions.get('window');

const SKILLS = ['Painters', 'Electrician', 'Mechanic', 'Plumber', 'Carpenter', 'Tiler'];

const HERO_IMAGES: Record<string, any> = {
  Painters:    { uri: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800' },
  Electrician: { uri: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800' },
  Mechanic:    { uri: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800' },
  Plumber:     { uri: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800' },
  Carpenter:   { uri: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800' },
  Tiler:       { uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
};

const SKILL_MAP: Record<string, string> = {
  Painters:    'Painter',
  Electrician: 'Electrician',
  Mechanic:    'Mechanic',
  Plumber:     'Plumber',
  Carpenter:   'Carpenter',
  Tiler:       'Tiler',
};

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [allUsers,    setAllUsers]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const heroScrollRef  = useRef<ScrollView>(null);
  const skillScrollRef = useRef<ScrollView>(null);

  const activeSkill = SKILLS[activeIndex];

  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  // Fires when user manually swipes the hero carousel
  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index >= 0 && index < SKILLS.length && index !== activeIndex) {
      setActiveIndex(index);
      skillScrollRef.current?.scrollTo({ x: index * 100, animated: true });
    }
  };

  // Fires when user taps a skill chip — updates everything immediately
  const onSkillPress = (index: number) => {
    setActiveIndex(index);
    heroScrollRef.current?.scrollTo({ x: index * width, animated: true });
    skillScrollRef.current?.scrollTo({ x: index * 100, animated: true });
  };

  const filteredBySkill = allUsers.filter(u => u.category === SKILL_MAP[activeSkill]);
  const topPicks        = filteredBySkill.filter(u => u.availability === true);
  const newProfs        = filteredBySkill.filter(u => u.availability === false);

  const searchResults = searchQuery.trim().length > 0
    ? allUsers.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const toCard = (user: any) => ({
    id:       user.user_id,
    name:     user.name,
    location: user.city || user.location || 'Cameroon',
    rating:   null,
    image:    user.profile_picture
                ? { uri: user.profile_picture }
                : { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  });

  return (
    <ScrollView
      style={styles.screenContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF9D00']} />
      }
    >
      {/* ── Hero Carousel ───────────────────────────────────── */}
      <View style={styles.heroContainer}>
        <ScrollView
          ref={heroScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onHeroScroll}
          onScrollEndDrag={onHeroScroll}
        >
          {SKILLS.map((skill) => (
            <View key={skill} style={styles.heroSlide}>
              <Image source={HERO_IMAGES[skill]} style={styles.heroImage} />
              <View style={styles.heroOverlay} />
              <Text style={styles.heroLabel}>{skill}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Search bar */}
        <View style={styles.heroSearchWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search for Name, Category or location"
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Dots */}
        <View style={styles.heroDots}>
          {SKILLS.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onSkillPress(i)}
              activeOpacity={1}
            >
              <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Search Results ───────────────────────────────────── */}
      {searchQuery.trim().length > 0 && (
        <View style={{ paddingTop: 8 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Results ({searchResults.length})</Text>
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.8}>
              <Text style={styles.seeAll}>Clear</Text>
            </TouchableOpacity>
          </View>
          {searchResults.length === 0 ? (
            <Text style={styles.emptyText}>No users found for "{searchQuery}"</Text>
          ) : (
            <FlatList
              data={searchResults.map(toCard)}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardList}
              renderItem={({ item }) => <ProfessionalCard item={item} />}
            />
          )}
        </View>
      )}

      {/* ── Skill Chips + Content ────────────────────────────── */}
      {searchQuery.trim().length === 0 && (
        <>
          <ScrollView
            ref={skillScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.skillsRow}
          >
            {SKILLS.map((skill, index) => {
              const isActive = index === activeIndex;
              return (
                <TouchableOpacity
                  key={skill}
                  style={[styles.skillChip, isActive && styles.skillChipActive]}
                  onPress={() => onSkillPress(index)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.skillChipText,
                    isActive && styles.skillChipTextActive,
                  ]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#FF9D00" />
              <Text style={styles.loadingText}>Loading professionals...</Text>
            </View>
          ) : (
            <>
              {/* Top Picks */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Our Top picks</Text>
                <TouchableOpacity activeOpacity={0.8}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              {topPicks.length === 0 ? (
                <Text style={styles.emptyText}>
                  No available {activeSkill.toLowerCase()} yet
                </Text>
              ) : (
                <FlatList
                  data={topPicks.map(toCard)}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardList}
                  renderItem={({ item }) => <ProfessionalCard item={item} />}
                />
              )}

              {/* New Professionals */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>New professionals</Text>
                <TouchableOpacity activeOpacity={0.8}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              {newProfs.length === 0 ? (
                <Text style={styles.emptyText}>
                  No new {activeSkill.toLowerCase()} yet
                </Text>
              ) : (
                <FlatList
                  data={newProfs.map(toCard)}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardList}
                  renderItem={({ item }) => <ProfessionalCard item={item} />}
                />
              )}
            </>
          )}
        </>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContainer:   { flex: 1, backgroundColor: '#fff' },
  heroContainer:     { width: '100%', height: 220, position: 'relative' },
  heroSlide:         { width, height: 220, position: 'relative' },
  heroImage:         { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroLabel: {
    position: 'absolute', bottom: 36, left: 16,
    color: 'white', fontSize: 22, fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSearchWrapper: { position: 'absolute', top: 12, left: 16, right: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 25,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  searchInput:       { flex: 1, fontSize: 13, color: '#333' },
  heroDots: {
    position: 'absolute', bottom: 12,
    width: '100%', flexDirection: 'row',
    justifyContent: 'center', gap: 6,
  },
  dot:               { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive:         { backgroundColor: '#FF9D00', width: 22, borderRadius: 4 },
  skillsRow:         { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  skillChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#FF9D00', backgroundColor: 'white',
  },
  skillChipActive:     { backgroundColor: '#FF9D00' },
  skillChipText:       { fontSize: 13, fontWeight: '600', color: '#FF9D00' },
  skillChipTextActive: { color: 'white' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 10,
  },
  sectionTitle:  { fontSize: 16, fontWeight: 'bold', color: '#111' },
  seeAll:        { fontSize: 13, color: '#FF9D00', fontWeight: '600' },
  cardList:      { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  loadingBox:    { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText:   { color: '#999', fontSize: 14 },
  emptyText:     { color: '#999', fontSize: 13, paddingHorizontal: 16, paddingBottom: 16 },
});