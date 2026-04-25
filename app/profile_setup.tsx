import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const REGIONS = [
  'Adamaoua', 'Centre', 'East', 'Far North', 'Littoral', 'North',
  'North West', 'South', 'South West',
];

const SKILLS = [
  'Electrician', 'Plumber', 'Mechanic', 'Carpenter', 'Tiler',
  'Painter', 'Computer repair technician', 'Photographer',
];

export default function ProfileSetupScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [region, setRegion] = useState(null);
  const [skill, setSkill] = useState(null);
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission denied to access media library!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const onSelect = (item) => {
    if (modalType === 'region') setRegion(item);
    else if (modalType === 'skill') setSkill(item);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => {
    const selected = (modalType === 'region' ? region : skill) === item;
    return (
      <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
        <View style={[styles.radioCircle, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.modalItemText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF9D00" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF9D00' }}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Set up your profile</Text>

                <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                  ) : (
                    <Text style={styles.addImageText}>Add an image</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.dropdown} onPress={() => openModal('region')}>
                  <Text style={region ? styles.dropdownText : styles.placeholderText}>
                    {region || 'Region'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor="#999"
                  value={city}
                  onChangeText={setCity}
                />

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Age"
                  placeholderTextColor="#999"
                  value={age}
                  onChangeText={setAge}
                />

                <TouchableOpacity style={styles.dropdown} onPress={() => openModal('skill')}>
                  <Text style={skill ? styles.dropdownText : styles.placeholderText}>
                    {skill || 'Skills'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  placeholder="Phone number"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                />

                <TouchableOpacity style={styles.continueButton}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </SafeAreaView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'region' ? 'Choose a region' : 'Choose a skill'}
            </Text>
            <FlatList
              data={modalType === 'region' ? REGIONS : SKILLS}
              keyExtractor={(item) => item}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FF9D00',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 25,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  addImageText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
    backgroundColor: 'white',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownArrow: {
    fontSize: 18,
    color: '#999',
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
    backgroundColor: 'white',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  continueButton: {
    backgroundColor: '#FF9D00',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: '70%',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalItemText: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF9D00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#FF9D00',
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#FF9D00',
  },
  modalCloseButton: {
    marginTop: 15,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF9D00',
  },
  modalCloseButtonText: {
    color: '#FF9D00',
    fontWeight: 'bold',
  },
});