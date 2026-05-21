import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, FlatList,
  Image, ActivityIndicator, RefreshControl,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers, getRecommendations } from '../utils/api';
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
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingRec,  setLoadingRec]  = useState(true);
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

  const fetchRecommendations = async () => {
    try {
      setLoadingRec(true);
      const recs = await getRecommendations({ limit: 10 });
      setRecommended(recs);
    } catch (err) {
      console.warn('Recommendations unavailable:', err);
      setRecommended([]);
    } finally {
      setLoadingRec(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRecommendations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
    fetchRecommendations();
  };

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index >= 0 && index < SKILLS.length && index !== activeIndex) {
      setActiveIndex(index);
      skillScrollRef.current?.scrollTo({ x: index * 100, animated: true });
    }
  };

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
    rating:   user.average_rating || null,
    category: user.category || null,
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
      {/* ── Hero Carousel ─────────────────────────────────── */}
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
            <TouchableOpacity key={i} onPress={() => onSkillPress(i)} activeOpacity={1}>
              <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Search Results ─────────────────────────────────── */}
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

      {/* ── Main content ───────────────────────────────────── */}
      {searchQuery.trim().length === 0 && (
        <>
          {/* ── Recommended for You ──────────────────────── */}
          {(loadingRec || recommended.length > 0) && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="star" size={16} color="#FF9D00" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Recommended for You</Text>
                </View>
              </View>
              {loadingRec ? (
                <View style={styles.recLoadingBox}>
                  <ActivityIndicator size="small" color="#FF9D00" />
                </View>
              ) : (
                <FlatList
                  data={recommended.map(toCard)}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardList}
                  renderItem={({ item }) => (
                    <View>
                      <ProfessionalCard item={item} />
                      {item.category && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{item.category}</Text>
                        </View>
                      )}
                    </View>
                  )}
                />
              )}
              <View style={styles.divider} />
            </>
          )}

          {/* ── Skill Chips ──────────────────────────────── */}
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
                  <Text style={[styles.skillChipText, isActive && styles.skillChipTextActive]}>
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
  screenContainer: { flex: 1, backgroundColor: '#fff' },
  heroContainer:   { width: '100%', height: 220, position: 'relative' },
  heroSlide:       { width, height: 220, position: 'relative' },
  heroImage:       { width: '100%', height: '100%', resizeMode: 'cover' },
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
  searchInput: { flex: 1, fontSize: 13, color: '#333' },
  heroDots: {
    position: 'absolute', bottom: 12,
    width: '100%', flexDirection: 'row',
    justifyContent: 'center', gap: 6,
  },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#FF9D00', width: 22, borderRadius: 4 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, marginTop: 16,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle:    { fontSize: 16, fontWeight: 'bold', color: '#111' },
  seeAll:          { fontSize: 13, color: '#FF9D00', fontWeight: '600' },
  skillsRow:       { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  skillChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#FF9D00', backgroundColor: 'white',
  },
  skillChipActive:     { backgroundColor: '#FF9D00' },
  skillChipText:       { fontSize: 13, fontWeight: '600', color: '#FF9D00' },
  skillChipTextActive: { color: 'white' },
  cardList:       { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  loadingBox:     { alignItems: 'center', paddingVertical: 40, gap: 12 },
  recLoadingBox:  { alignItems: 'center', paddingVertical: 20 },
  loadingText:    { color: '#999', fontSize: 14 },
  emptyText:      { color: '#999', fontSize: 13, paddingHorizontal: 16, paddingBottom: 16 },
  divider:        { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 16, marginTop: 8 },
  categoryBadge: {
    alignSelf: 'flex-start', marginLeft: 4, marginTop: 4,
    backgroundColor: '#FFF3E0', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  categoryBadgeText: { fontSize: 10, color: '#FF9D00', fontWeight: '600' },
});