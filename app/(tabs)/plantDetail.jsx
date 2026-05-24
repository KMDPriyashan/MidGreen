import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const PlantDetail = () => {
  const router = useRouter();
  const { plantId } = useLocalSearchParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review/Comment states
  const [reviews, setReviews] = useState([]);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load plant data and reviews from AsyncStorage
  useEffect(() => {
    loadPlantData();
    loadReviews();
  }, [plantId]);

  const loadReviews = async () => {
    try {
      const storedReviews = await AsyncStorage.getItem(`reviews_${plantId}`);
      if (storedReviews) {
        const parsedReviews = JSON.parse(storedReviews);
        // Sort by date (newest first) and show only latest 3
        parsedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        setReviews(parsedReviews.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const saveReview = async (newReview) => {
    try {
      const storedReviews = await AsyncStorage.getItem(`reviews_${plantId}`);
      let allReviews = storedReviews ? JSON.parse(storedReviews) : [];
      allReviews.unshift(newReview); // Add new review at the beginning
      await AsyncStorage.setItem(`reviews_${plantId}`, JSON.stringify(allReviews));
      
      // Sort by date (newest first) and show only latest 3
      allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReviews(allReviews.slice(0, 3));
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

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
      setCommentImage(result.assets[0].uri);
    }
  };

  const submitComment = async () => {
    if (!reviewerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter your comment');
      return;
    }

    setSubmitting(true);

    // Get current user info
    let userName = reviewerName;
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData && !reviewerName) {
        const parsed = JSON.parse(userData);
        userName = parsed.full_name || parsed.name || reviewerName;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }

    const newReview = {
      id: Date.now().toString(),
      plantId: plantId,
      reviewerName: userName,
      comment: commentText,
      image: commentImage,
      date: new Date().toISOString(),
      rating: 5, // Default rating
    };

    await saveReview(newReview);
    
    // Reset form
    setReviewerName('');
    setCommentText('');
    setCommentImage(null);
    setCommentModalVisible(false);
    Alert.alert('Success', 'Your review has been posted!');
    setSubmitting(false);
  };

  const loadPlantData = async () => {
    try {
      // Default plants data
      const defaultPlants = [
        {
          id: '1',
          name: 'Monstera Deliciosa',
          category: 'Indoor Plants',
          description: 'Beautiful Swiss Cheese plant with large, glossy split leaves. Perfect for adding tropical vibes to any room.',
          price: 29.99,
          originalPrice: '$29.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Water when top 2 inches of soil are dry\n• Provide bright, indirect sunlight\n• Fertilize monthly during growing season\n• Wipe leaves with damp cloth',
          specialNotes: '• Pet friendly? No - toxic to cats and dogs\n• Air purifying: Yes\n• Humidity: Loves high humidity\n• Growth: Can grow up to 10 feet indoors',
          lightRequirement: 'Indirect Sunlight',
          waterRequirement: 'Weekly',
          difficulty: 'Moderate',
        },
        {
          id: '2',
          name: 'Snake Plant',
          category: 'Indoor Plant',
          description: 'Low-maintenance plant with tall, upright sword-like leaves. Excellent air purifier and thrives in any condition.',
          price: 24.99,
          originalPrice: '$24.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Water every 2-3 weeks\n• Tolerates low light\n• Wipe leaves occasionally\n• Use well-draining soil',
          specialNotes: '• Pet friendly? No - mildly toxic\n• Air purifying: Excellent\n• Perfect for beginners\n• Releases oxygen at night',
          lightRequirement: 'Low Light',
          waterRequirement: 'Bi-Weekly',
          difficulty: 'Easy',
        },
        {
          id: '3',
          name: 'Peace Lily',
          category: 'Indoor Plants',
          description: 'Elegant white flowers and dark green leaves. Known for its air-purifying abilities and easy care.',
          price: 19.99,
          originalPrice: '$19.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Keep soil consistently moist\n• Low to medium light\n• Mist leaves regularly\n• Use filtered water',
          specialNotes: '• Pet friendly? No - toxic to pets\n• Air purifying: Yes\n• Blooms in spring\n• Droops when thirsty',
          lightRequirement: 'Low Light',
          waterRequirement: 'Every 2-3 Days',
          difficulty: 'Easy',
        },
        {
          id: '4',
          name: 'Fiddle Leaf Fig',
          category: 'Indoor Plants',
          description: 'Stunning tall plant with large, violin-shaped leaves. A favorite for modern home decor.',
          price: 49.99,
          originalPrice: '$49.99',
          image: require('../../assets/images/home-back.png'),
          inStock: false,
          careInstructions: '• Water when top inch of soil is dry\n• Bright, indirect light\n• Rotate weekly\n• Dust leaves regularly',
          specialNotes: '• Pet friendly? No - toxic\n• Air purifying: Yes\n• Fickle - avoid moving\n• Needs consistent environment',
          lightRequirement: 'Bright Light',
          waterRequirement: 'Weekly',
          difficulty: 'Hard',
        },
        {
          id: '5',
          name: 'Lavender',
          category: 'Outdoor Plants',
          description: 'Fragrant purple flowers that attract pollinators. Perfect for gardens and borders.',
          price: 12.99,
          originalPrice: '$12.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Full sun required\n• Well-draining soil\n• Prune after flowering\n• Avoid overwatering',
          specialNotes: '• Pet friendly? Yes\n• Attracts bees and butterflies\n• Drought tolerant\n• Can be dried for sachets',
          lightRequirement: 'Direct Sunlight',
          waterRequirement: 'When Soil is Dry',
          difficulty: 'Easy',
        },
        {
          id: '6',
          name: 'Rose Bush',
          category: 'Outdoor Plants',
          description: 'Classic red roses with beautiful fragrance. Blooms repeatedly throughout the season.',
          price: 34.99,
          originalPrice: '$34.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Full sun (6+ hours)\n• Regular watering\n• Fertilize in spring\n• Prune in late winter',
          specialNotes: '• Pet friendly? No - thorns can injure\n• Fragrant flowers\n• Repeats blooming\n• Mulch to retain moisture',
          lightRequirement: 'Direct Sunlight',
          waterRequirement: 'Every 2-3 Days',
          difficulty: 'Moderate',
        },
        {
          id: '7',
          name: 'Hydrangea',
          category: 'Outdoor Plants',
          description: 'Large, colorful flower clusters that bloom all summer. Changes color based on soil pH.',
          price: 27.99,
          originalPrice: '$27.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Morning sun, afternoon shade\n• Keep soil moist\n• Prune after blooming\n• Add coffee grounds for blue blooms',
          specialNotes: '• Pet friendly? No - toxic\n• Soil pH affects flower color\n• Blue in acidic soil\n• Pink in alkaline soil',
          lightRequirement: 'Indirect Sunlight',
          waterRequirement: 'Daily',
          difficulty: 'Moderate',
        },
        {
          id: '8',
          name: 'Aloe Vera',
          category: 'Succulents',
          description: 'Medicinal succulent with healing properties. Easy to grow and great for beginners.',
          price: 14.99,
          originalPrice: '$14.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Bright, indirect light\n• Water deeply but infrequently\n• Use cactus soil\n• Avoid standing water',
          specialNotes: '• Pet friendly? No - toxic to pets\n• Medicinal gel for burns\n• Seasonal bloomer\n• Easy to propagate',
          lightRequirement: 'Bright Light',
          waterRequirement: 'Bi-Weekly',
          difficulty: 'Easy',
        },
        {
          id: '9',
          name: 'Jade Plant',
          category: 'Succulents',
          description: 'Lucky plant with thick, oval-shaped leaves. Brings prosperity and good fortune.',
          price: 18.99,
          originalPrice: '$18.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Bright light for 4+ hours\n• Allow soil to dry between watering\n• Prune to shape\n• Use well-draining soil',
          specialNotes: '• Pet friendly? No - toxic\n• Symbol of good luck\n• Can live for decades\n• Bonsai potential',
          lightRequirement: 'Direct Sunlight',
          waterRequirement: 'When Soil is Dry',
          difficulty: 'Easy',
        },
        {
          id: '10',
          name: 'String of Pearls',
          category: 'Succulents',
          description: 'Unique trailing succulent with bead-like leaves. Perfect for hanging baskets.',
          price: 22.99,
          originalPrice: '$22.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Bright indirect light\n• Water when pearls look deflated\n• Well-draining soil\n• Avoid wetting leaves',
          specialNotes: '• Pet friendly? No - toxic\n• Trailing up to 3 feet\n• Avoid wetting pearls\n• Great for hanging baskets',
          lightRequirement: 'Bright Light',
          waterRequirement: 'Weekly',
          difficulty: 'Moderate',
        },
        {
          id: '11',
          name: 'Orchid',
          category: 'Flowering Plants',
          description: 'Exotic flowers that bloom for months. Available in various stunning colors.',
          price: 39.99,
          originalPrice: '$39.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Bright, indirect light\n• Water weekly with orchid food\n• High humidity\n• Use orchid bark',
          specialNotes: '• Pet friendly? Yes\n• Blooms last 2-3 months\n• Needs orchid bark\n• Avoid water on leaves',
          lightRequirement: 'Indirect Sunlight',
          waterRequirement: 'Weekly',
          difficulty: 'Hard',
        },
        {
          id: '12',
          name: 'African Violet',
          category: 'Flowering Plants',
          description: 'Compact plant with fuzzy leaves and delicate purple flowers. Blooms year-round.',
          price: 15.99,
          originalPrice: '$15.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Bright, indirect light\n• Water from bottom\n• Avoid wetting leaves\n• Use room temperature water',
          specialNotes: '• Pet friendly? Yes\n• Blooms continuously\n• Use self-watering pots\n• Remove spent blooms',
          lightRequirement: 'Bright Light',
          waterRequirement: 'Bi-Weekly',
          difficulty: 'Moderate',
        },
        {
          id: '13',
          name: 'Bougainvillea',
          category: 'Flowering Plants',
          description: 'Vibrant colorful bracts that bloom profusely. Perfect for trellises and walls.',
          price: 32.99,
          originalPrice: '$32.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Full sun required\n• Water when top soil is dry\n• Prune after blooming\n• Fertilize in spring',
          specialNotes: '• Pet friendly? No - thorns\n• Blooms in cycles\n• Great for trellises\n• Drought tolerant once established',
          lightRequirement: 'Direct Sunlight',
          waterRequirement: 'Weekly',
          difficulty: 'Moderate',
        },
        {
          id: '14',
          name: 'Basil',
          category: 'Herbs',
          description: 'Aromatic herb essential for Italian cooking. Easy to grow in pots or gardens.',
          price: 8.99,
          originalPrice: '$8.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Full sun (6+ hours)\n• Keep soil moist\n• Pinch flowers for leaf growth\n• Harvest from top',
          specialNotes: '• Pet friendly? Yes\n• Great for pesto\n• Harvest regularly\n• Annual plant',
          lightRequirement: 'Direct Sunlight',
          waterRequirement: 'Daily',
          difficulty: 'Easy',
        },
        {
          id: '15',
          name: 'Mint',
          category: 'Herbs',
          description: 'Refreshing herb for teas and cocktails. Grows vigorously and spreads quickly.',
          price: 7.99,
          originalPrice: '$7.99',
          image: require('../../assets/images/home-back.png'),
          inStock: true,
          careInstructions: '• Partial shade to full sun\n• Keep soil consistently moist\n• Grows best in containers\n• Harvest frequently',
          specialNotes: '• Pet friendly? Yes\n• Invasive - keep in pots\n• Great for mojitos\n• Many varieties available',
          lightRequirement: 'Indirect Sunlight',
          waterRequirement: 'Daily',
          difficulty: 'Easy',
        },
      ];

      // Load custom plants from storage
      const storedPlants = await AsyncStorage.getItem('plants');
      let customPlants = storedPlants ? JSON.parse(storedPlants) : [];
      
      // Combine all plants
      const allPlants = [...defaultPlants, ...customPlants];
      
      // Find the specific plant
      const foundPlant = allPlants.find(p => p.id === plantId);
      
      if (foundPlant) {
        setPlant(foundPlant);
      } else {
        Alert.alert('Error', 'Plant not found', [
          { text: 'Go Back', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error loading plant:', error);
      Alert.alert('Error', 'Failed to load plant details');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!plant) return;
    Alert.alert(
      'Added to Cart!',
      `${plant.name} has been added to your cart.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Format price display
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return price;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render review item
  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerAvatar}>👤</Text>
          <View>
            <Text style={styles.reviewerName}>{item.reviewerName}</Text>
            <Text style={styles.reviewDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.ratingStars}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.ratingText}>{item.rating || 5}.0</Text>
        </View>
      </View>
      
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.reviewImage} />
      )}
      
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Plant not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle image source (both require and URI)
  const imageSource = typeof plant.image === 'string' 
    ? { uri: plant.image } 
    : plant.image;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Plant Image */}
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.plantImage} resizeMode="cover" />
        </View>

        {/* Plant Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.plantName}>{plant.name}</Text>
          <Text style={styles.category}>{plant.category}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(plant.price)}</Text>
            <View style={[styles.stockBadge, plant.inStock ? styles.inStock : styles.outOfStock]}>
              <Text style={styles.stockText}>
                {plant.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Difficulty Level */}
          {plant.difficulty && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>⭐ Care Difficulty</Text>
              <Text style={styles.infoCardValue}>{plant.difficulty}</Text>
            </View>
          )}

          {/* Light & Water Requirements */}
          <View style={styles.requirementsRow}>
            {plant.lightRequirement && (
              <View style={styles.requirementCard}>
                <Text style={styles.requirementIcon}>💡</Text>
                <Text style={styles.requirementLabel}>Light</Text>
                <Text style={styles.requirementValue}>{plant.lightRequirement}</Text>
              </View>
            )}
            {plant.waterRequirement && (
              <View style={styles.requirementCard}>
                <Text style={styles.requirementIcon}>💧</Text>
                <Text style={styles.requirementLabel}>Water</Text>
                <Text style={styles.requirementValue}>{plant.waterRequirement}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>📖 Description</Text>
          <Text style={styles.description}>{plant.description}</Text>

          {/* Care Instructions */}
          {(plant.careInstructions || (plant.careInstructions === undefined)) && (
            <>
              <Text style={styles.sectionTitle}>🌱 Care Instructions</Text>
              <Text style={styles.careText}>
                {plant.careInstructions || '• Water when top soil feels dry\n• Provide appropriate light\n• Fertilize during growing season\n• Prune dead leaves regularly'}
              </Text>
            </>
          )}

          {/* Special Notes */}
          {plant.specialNotes && (
            <>
              <Text style={styles.sectionTitle}>📝 Special Notes</Text>
              <Text style={styles.specialText}>{plant.specialNotes}</Text>
            </>
          )}

          {/* Temperature Requirement */}
          {plant.temperatureRequirement && (
            <>
              <Text style={styles.sectionTitle}>🌡️ Temperature</Text>
              <Text style={styles.careText}>{plant.temperatureRequirement}</Text>
            </>
          )}

          {/* Customer Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>⭐ Customer Reviews</Text>
              <TouchableOpacity 
                style={styles.writeReviewButton}
                onPress={() => setCommentModalVisible(true)}
              >
                <Text style={styles.writeReviewButtonText}>Write a Review</Text>
              </TouchableOpacity>
            </View>

            {reviews.length === 0 ? (
              <View style={styles.noReviewsContainer}>
                <Text style={styles.noReviewsIcon}>💬</Text>
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.noReviewsSubtext}>Be the first to review this plant!</Text>
              </View>
            ) : (
              <FlatList
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.reviewsList}
              />
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity 
            style={[styles.cartButton, !plant.inStock && styles.disabledButton]}
            onPress={addToCart}
            disabled={!plant.inStock}
          >
            <Text style={styles.cartButtonText}>
              {plant.inStock ? 'Add to Cart 🛒' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Write Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Your Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your name"
                placeholderTextColor="#95a5a6"
                value={reviewerName}
                onChangeText={setReviewerName}
              />

              <Text style={styles.modalLabel}>Your Review</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Share your experience with this plant..."
                placeholderTextColor="#95a5a6"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.modalLabel}>Add Photo (Optional)</Text>
              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <Text style={styles.imagePickerButtonText}>📷 Select Image</Text>
              </TouchableOpacity>

              {commentImage && (
                <View style={styles.previewImageContainer}>
                  <Image source={{ uri: commentImage }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setCommentImage(null)}
                  >
                    <Text style={styles.removeImageText}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={submitComment}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
  },
  backButton: {
    marginTop: 55,
    marginLeft: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#2ecc71',
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#f8f9fa',
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
  },
  plantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: '500',
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inStock: {
    backgroundColor: '#2ecc71',
  },
  outOfStock: {
    backgroundColor: '#e74c3c',
  },
  stockText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  infoCardTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  requirementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  requirementCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  requirementIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  requirementLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  requirementValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 15,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
    marginBottom: 20,
  },
  careText: {
    fontSize: 15,
    color: '#7f8c8d',
    lineHeight: 24,
    marginBottom: 15,
  },
  specialText: {
    fontSize: 15,
    color: '#7f8c8d',
    lineHeight: 24,
    marginBottom: 20,
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 12,
  },
  // Reviews Section Styles
  reviewsSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  writeReviewButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  writeReviewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  noReviewsIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  noReviewsSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  reviewsList: {
    paddingBottom: 10,
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    fontSize: 30,
    marginRight: 10,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  reviewDate: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: 'bold',
  },
  reviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewComment: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  cartButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalClose: {
    fontSize: 24,
    color: '#7f8c8d',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imagePickerButtonText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  previewImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  removeImageButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  removeImageText: {
    color: '#e74c3c',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlantDetail;