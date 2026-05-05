import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const AddPlant = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plantData, setPlantData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    inStock: true,
    image: null,
    imageUri: null, // Store URI for preview
    careInstructions: '',
    specialNotes: '',
    lightRequirement: '',
    waterRequirement: '',
    temperatureRequirement: '',
    difficulty: 'Easy',
  });

  const categories = [
    'Indoor Plants',
    'Outdoor Plants',
    'Succulents',
    'Flowering Plants',
    'Herbs',
  ];

  const difficultyLevels = ['Easy', 'Moderate', 'Hard', 'Expert'];
  
  const lightOptions = ['Direct Sunlight', 'Indirect Sunlight', 'Low Light', 'Bright Light'];
  const waterOptions = ['Daily', 'Every 2-3 Days', 'Weekly', 'Bi-Weekly', 'When Soil is Dry'];

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant camera roll permissions to add images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPlantData({ 
        ...plantData, 
        image: result.assets[0].uri,
        imageUri: result.assets[0].uri 
      });
    }
  };

  // Generate new ID
  const generateNewId = async () => {
    try {
      const existingPlants = await AsyncStorage.getItem('plants');
      const plants = existingPlants ? JSON.parse(existingPlants) : [];
      const maxId = plants.reduce((max, plant) => Math.max(max, parseInt(plant.id) || 0), 0);
      return String(maxId + 1);
    } catch (error) {
      return '16';
    }
  };

  // Save plant to storage
  const savePlant = async () => {
    // Validation
    if (!plantData.name.trim()) {
      Alert.alert('Error', 'Please enter plant name');
      return;
    }
    if (!plantData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!plantData.description.trim()) {
      Alert.alert('Error', 'Please enter plant description');
      return;
    }
    if (!plantData.price || parseFloat(plantData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);

    try {
      const newId = await generateNewId();
      const newPlant = {
        id: newId,
        name: plantData.name.trim(),
        category: plantData.category,
        description: plantData.description.trim(),
        price: parseFloat(plantData.price),
        originalPrice: `$${parseFloat(plantData.price).toFixed(2)}`,
        image: plantData.imageUri || null, // Store URI string
        inStock: true,
        createdAt: new Date().toISOString(),
        careInstructions: plantData.careInstructions.trim(),
        specialNotes: plantData.specialNotes.trim(),
        lightRequirement: plantData.lightRequirement,
        waterRequirement: plantData.waterRequirement,
        temperatureRequirement: plantData.temperatureRequirement,
        difficulty: plantData.difficulty,
      };

      // Save to AsyncStorage
      const existingPlants = await AsyncStorage.getItem('plants');
      const plants = existingPlants ? JSON.parse(existingPlants) : [];
      plants.push(newPlant);
      await AsyncStorage.setItem('plants', JSON.stringify(plants));

      Alert.alert(
        'Success!',
        `${plantData.name} has been added to your plant collection.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setLoading(false);
              router.replace('/(tabs)/Homepage');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving plant:', error);
      Alert.alert('Error', 'Failed to save plant. Please try again.');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Plant</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {plantData.image ? (
            <Image source={{ uri: plantData.image }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageIcon}>🌿</Text>
              <Text style={styles.imageText}>Tap to add plant image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Plant Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Plant Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Monstera Deliciosa"
            placeholderTextColor="#95a5a6"
            value={plantData.name}
            onChangeText={(text) => setPlantData({ ...plantData, name: text })}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  plantData.category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setPlantData({ ...plantData, category: cat })}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    plantData.category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the plant - features, benefits, appearance..."
            placeholderTextColor="#95a5a6"
            value={plantData.description}
            onChangeText={(text) => setPlantData({ ...plantData, description: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price *</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="0.00"
              placeholderTextColor="#95a5a6"
              value={plantData.price}
              onChangeText={(text) => setPlantData({ ...plantData, price: text })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Difficulty Level */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {difficultyLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyChip,
                  plantData.difficulty === level && styles.difficultyChipActive,
                ]}
                onPress={() => setPlantData({ ...plantData, difficulty: level })}
              >
                <Text
                  style={[
                    styles.difficultyChipText,
                    plantData.difficulty === level && styles.difficultyChipTextActive,
                  ]}
                >
                  {level === 'Easy' && '🟢 '}
                  {level === 'Moderate' && '🟡 '}
                  {level === 'Hard' && '🔴 '}
                  {level === 'Expert' && '⚫ '}
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Light Requirement */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Light Requirement</Text>
          <View style={styles.optionContainer}>
            {lightOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionChip,
                  plantData.lightRequirement === option && styles.optionChipActive,
                ]}
                onPress={() => setPlantData({ ...plantData, lightRequirement: option })}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    plantData.lightRequirement === option && styles.optionChipTextActive,
                  ]}
                >
                  {option === 'Direct Sunlight' && '☀️ '}
                  {option === 'Indirect Sunlight' && '🌤️ '}
                  {option === 'Low Light' && '🌑 '}
                  {option === 'Bright Light' && '✨ '}
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Water Requirement */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Water Requirement</Text>
          <View style={styles.optionContainer}>
            {waterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionChip,
                  plantData.waterRequirement === option && styles.optionChipActive,
                ]}
                onPress={() => setPlantData({ ...plantData, waterRequirement: option })}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    plantData.waterRequirement === option && styles.optionChipTextActive,
                  ]}
                >
                  💧 {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Temperature Requirement */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Temperature Requirement</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 65-75°F (18-24°C)"
            placeholderTextColor="#95a5a6"
            value={plantData.temperatureRequirement}
            onChangeText={(text) => setPlantData({ ...plantData, temperatureRequirement: text })}
          />
        </View>

        {/* Care Instructions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🌱 Care Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="• Water when top soil feels dry\n• Fertilize monthly during growing season\n• Prune dead leaves regularly"
            placeholderTextColor="#95a5a6"
            value={plantData.careInstructions}
            onChangeText={(text) => setPlantData({ ...plantData, careInstructions: text })}
            multiline
            numberOfLines={5}
          />
          <Text style={styles.hintText}>
            💡 Tip: Add bullet points for easy reading
          </Text>
        </View>

        {/* Special Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📝 Special Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="• Pet friendly?\n• Air purifying benefits\n• Seasonal care tips\n• Common issues to watch for"
            placeholderTextColor="#95a5a6"
            value={plantData.specialNotes}
            onChangeText={(text) => setPlantData({ ...plantData, specialNotes: text })}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.hintText}>
            💡 Include any special information like pet safety, seasonal care, etc.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.publishButton, loading && styles.disabledButton]}
            onPress={savePlant}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.publishButtonText}>Publish Plant</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 50,
  },
  formContainer: {
    padding: 20,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 25,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2ecc71',
    borderStyle: 'dashed',
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  imageIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  imageText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hintText: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 5,
    fontStyle: 'italic',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  difficultyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  difficultyChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  difficultyChipActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  difficultyChipText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  difficultyChipTextActive: {
    color: '#fff',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionChipActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  optionChipText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  optionChipTextActive: {
    color: '#fff',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginRight: 10,
  },
  priceInput: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 40,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPlant;