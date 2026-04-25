import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, FlatList, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SKILLS, HERO_IMAGES, TOP_PICKS, NEW_PROFESSIONALS } from '../components/data';
import { ProfessionalCard } from '../components/ProfessionalCard';

export default function HomeScreen() {
  const [activeSkill, setActiveSkill] = useState('Painters');

  const topPicks = TOP_PICKS[activeSkill] ?? [];
  const newProfs  = NEW_PROFESSIONALS[activeSkill] ?? [];

  return (
    <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>

      {/* Hero Banner */}
      <View style={styles.heroContainer}>
        <Image source={HERO_IMAGES[activeSkill]} style={styles.heroImage} />
        <View style={styles.heroSearchWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search for Name, Category or location"
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
        </View>
        <View style={styles.heroDots}>
          {SKILLS.slice(0, 4).map((_, i) => (
            <View key={i} style={[styles.dot, i === SKILLS.indexOf(activeSkill) % 4 && styles.dotActive]} />
          ))}
        </View>
      </View>

      {/* Skill Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skillsRow}>
        {SKILLS.map((skill) => (
          <TouchableOpacity
            key={skill}
            style={[styles.skillChip, activeSkill === skill && styles.skillChipActive]}
            onPress={() => setActiveSkill(skill)}
          >
            <Text style={[styles.skillChipText, activeSkill === skill && styles.skillChipTextActive]}>
              {skill}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Top Picks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Our Top picks</Text>
        <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
      </View>
      <FlatList
        data={topPicks}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
        renderItem={({ item }) => <ProfessionalCard item={item} />}
      />

      {/* New Professionals */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>New professionals</Text>
        <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
      </View>
      <FlatList
        data={newProfs}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
        renderItem={({ item }) => <ProfessionalCard item={item} />}
      />

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContainer:   { flex: 1, backgroundColor: '#fff' },
  heroContainer:     { width: '100%', height: 220, position: 'relative' },
  heroImage:         { width: '100%', height: '100%', resizeMode: 'cover' },
  heroSearchWrapper: { position: 'absolute', top: 12, left: 16, right: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 25,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#333' },
  heroDots:    { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive:   { backgroundColor: '#FF9D00', width: 22, borderRadius: 4 },
  skillsRow:   { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  skillChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#FF9D00', backgroundColor: 'white',
  },
  skillChipActive:     { backgroundColor: '#FF9D00' },
  skillChipText:       { fontSize: 13, fontWeight: '600', color: '#FF9D00' },
  skillChipTextActive: { color: 'white' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  seeAll:       { fontSize: 13, color: '#FF9D00', fontWeight: '600' },
  cardList:     { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
});