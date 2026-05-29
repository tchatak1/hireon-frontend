import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getOrCreateConversation } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.55;

interface Professional {
  id: string;
  name: string;
  image: any;
  location: string;
  rating?: number;
  description?: string;
  phone?: string;
}

interface Props {
  item: Professional;
}

export const ProfessionalCard = ({ item }: Props) => {
  const router = useRouter();
  const { t } = useLanguage();

  const handleHire = () => {
    router.push({
      pathname: '/hireForm',
      params: { provider_id: item.id, provider_name: item.name },
    });
  };

  const handleViewProfile = () => {
    router.push({
      pathname: '/userProfile',
      params: {
        user_id:              item.id,
        provider_name:        item.name,
        provider_location:    item.location,
        provider_rating:      item.rating?.toString(),
        provider_description: item.description || '',
        provider_phone:       item.phone || '',
      },
    });
  };

  const handleMessage = async () => {
    try {
      const conv = await getOrCreateConversation(item.id);
      router.push({
        pathname: '/chatScreen',
        params: {
          conversation_id: conv.conversation_id,
          other_user_id:   item.id,
          other_name:      item.name,
          other_image:     item.image?.uri || '',
        },
      });
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.cardLocationRow}>
          <Ionicons name="location-sharp" size={12} color="#FF9D00" />
          <Text style={styles.cardLocation}>{item.location}</Text>
          {item.rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#FF9D00" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardButtons}>
          <TouchableOpacity style={styles.viewBtn} onPress={handleViewProfile}>
            <Text style={styles.viewBtnText}>{t('viewProfile')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.msgBtn} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={12} color="#FF9D00" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.hireBtn} onPress={handleHire}>
            <Text style={styles.hireBtnText}>{t('hire')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,

    elevation: 6,
  },

  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 10,
  },

  cardName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },

  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },

  cardLocation: {
    color: '#ddd',
    fontSize: 11,
    flex: 1,
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  ratingText: {
    color: '#FF9D00',
    fontSize: 11,
    fontWeight: '600',
  },

  cardButtons: { flexDirection: 'row', gap: 6, marginTop: 8 },
  viewBtn: {
    flex: 1, paddingVertical: 6, borderRadius: 6,
    borderWidth: 1, borderColor: 'white', alignItems: 'center',
  },
  viewBtnText:  { color: 'white', fontSize: 11, fontWeight: '600' },
  msgBtn: {
    width: 30, paddingVertical: 6, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
  },
  hireBtn: {
    flex: 1, paddingVertical: 6, borderRadius: 6,
    backgroundColor: '#FF9D00', alignItems: 'center',
  },
  hireBtnText:  { color: 'white', fontSize: 11, fontWeight: '600' },
});