import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PlantDetail = () => {
  const router = useRouter();
  const { plantId } = useLocalSearchParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Plant Data (same as HomePage)
  const plantsData = {
    '1': {
      id: '1',
      name: 'Monstera Deliciosa',
      category: 'Indoor Plants',
      description: 'Beautiful Swiss Cheese plant with large, glossy split leaves. Perfect for adding tropical vibes to any room.',
      price: '$29.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '2': {
      id: '2',
      name: 'Snake Plant',
      category: 'Indoor Plant',
      description: 'Low-maintenance plant with tall, upright sword-like leaves. Excellent air purifier and thrives in any condition.',
      price: '$24.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '3': {
      id: '3',
      name: 'Peace Lily',
      category: 'Indoor Plants',
      description: 'Elegant white flowers and dark green leaves. Known for its air-purifying abilities and easy care.',
      price: '$19.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '4': {
      id: '4',
      name: 'Fiddle Leaf Fig',
      category: 'Indoor Plants',
      description: 'Stunning tall plant with large, violin-shaped leaves. A favorite for modern home decor.',
      price: '$49.99',
      image: require('../../assets/images/home-back.png'),
      inStock: false,
    },
    '5': {
      id: '5',
      name: 'Lavender',
      category: 'Outdoor Plants',
      description: 'Fragrant purple flowers that attract pollinators. Perfect for gardens and borders.',
      price: '$12.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '6': {
      id: '6',
      name: 'Rose Bush',
      category: 'Outdoor Plants',
      description: 'Classic red roses with beautiful fragrance. Blooms repeatedly throughout the season.',
      price: '$34.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '7': {
      id: '7',
      name: 'Hydrangea',
      category: 'Outdoor Plants',
      description: 'Large, colorful flower clusters that bloom all summer. Changes color based on soil pH.',
      price: '$27.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '8': {
      id: '8',
      name: 'Aloe Vera',
      category: 'Succulents',
      description: 'Medicinal succulent with healing properties. Easy to grow and great for beginners.',
      price: '$14.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '9': {
      id: '9',
      name: 'Jade Plant',
      category: 'Succulents',
      description: 'Lucky plant with thick, oval-shaped leaves. Brings prosperity and good fortune.',
      price: '$18.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '10': {
      id: '10',
      name: 'String of Pearls',
      category: 'Succulents',
      description: 'Unique trailing succulent with bead-like leaves. Perfect for hanging baskets.',
      price: '$22.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '11': {
      id: '11',
      name: 'Orchid',
      category: 'Flowering Plants',
      description: 'Exotic flowers that bloom for months. Available in various stunning colors.',
      price: '$39.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '12': {
      id: '12',
      name: 'African Violet',
      category: 'Flowering Plants',
      description: 'Compact plant with fuzzy leaves and delicate purple flowers. Blooms year-round.',
      price: '$15.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '13': {
      id: '13',
      name: 'Bougainvillea',
      category: 'Flowering Plants',
      description: 'Vibrant colorful bracts that bloom profusely. Perfect for trellises and walls.',
      price: '$32.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '14': {
      id: '14',
      name: 'Basil',
      category: 'Herbs',
      description: 'Aromatic herb essential for Italian cooking. Easy to grow in pots or gardens.',
      price: '$8.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    '15': {
      id: '15',
      name: 'Mint',
      category: 'Herbs',
      description: 'Refreshing herb for teas and cocktails. Grows vigorously and spreads quickly.',
      price: '$7.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
  };

  useEffect(() => {
    if (plantId && plantsData[plantId]) {
      setPlant(plantsData[plantId]);
    } else {
      // Handle invalid plant ID
      Alert.alert('Error', 'Plant not found', [
        { text: 'Go Back', onPress: () => router.back() }
      ]);
    }
    setLoading(false);
  }, [plantId]);

  const addToCart = () => {
    if (!plant) return;
    Alert.alert(
      'Added to Cart!',
      `${plant.name} has been added to your cart.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

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
          <Image source={plant.image} style={styles.plantImage} resizeMode="cover" />
        </View>

        {/* Plant Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.plantName}>{plant.name}</Text>
          <Text style={styles.category}>{plant.category}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>{plant.price}</Text>
            <View style={[styles.stockBadge, plant.inStock ? styles.inStock : styles.outOfStock]}>
              <Text style={styles.stockText}>
                {plant.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{plant.description}</Text>

          <Text style={styles.sectionTitle}>Care Instructions</Text>
          <Text style={styles.careText}>
            • Light: Bright, indirect sunlight{'\n'}
            • Water: Water when top soil feels dry{'\n'}
            • Humidity: Moderate to high humidity{'\n'}
            • Temperature: 65-85°F (18-29°C)
          </Text>

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
    marginBottom: 25,
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
    marginBottom: 30,
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
});

export default PlantDetail;