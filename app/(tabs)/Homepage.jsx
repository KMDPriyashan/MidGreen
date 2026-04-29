import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2;

const HomePage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('home');
  const [cartCount, setCartCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load cart count on component mount
  useEffect(() => {
    loadCartCount();
  }, []);

  // Load cart count from AsyncStorage
  const loadCartCount = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        const cart = JSON.parse(storedCart);
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  // Show toast notification
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
    });
  };

  // Plant Data - Using local images with require
  const plantsData = [
    // Indoor Plants
    {
      id: '1',
      name: 'Monstera Deliciosa',
      category: 'Indoor Plants',
      description: 'Beautiful Swiss Cheese plant with large, glossy split leaves. Perfect for adding tropical vibes to any room.',
      price: 29.99,
      originalPrice: '$29.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
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
    },
    // Outdoor Plants
    {
      id: '5',
      name: 'Lavender',
      category: 'Outdoor Plants',
      description: 'Fragrant purple flowers that attract pollinators. Perfect for gardens and borders.',
      price: 12.99,
      originalPrice: '$12.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
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
    },
    // Succulents
    {
      id: '8',
      name: 'Aloe Vera',
      category: 'Succulents',
      description: 'Medicinal succulent with healing properties. Easy to grow and great for beginners.',
      price: 14.99,
      originalPrice: '$14.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
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
    },
    // Flowering Plants
    {
      id: '11',
      name: 'Orchid',
      category: 'Flowering Plants',
      description: 'Exotic flowers that bloom for months. Available in various stunning colors.',
      price: 39.99,
      originalPrice: '$39.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
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
    },
    // Herbs
    {
      id: '14',
      name: 'Basil',
      category: 'Herbs',
      description: 'Aromatic herb essential for Italian cooking. Easy to grow in pots or gardens.',
      price: 8.99,
      originalPrice: '$8.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
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
    },
  ];

  // Get unique categories
  const categories = ['All', ...new Set(plantsData.map(plant => plant.category))];

  // Filter plants based on search and category
  const filteredPlants = plantsData.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plant.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || plant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add to cart function with simple toast notification
  const addToCart = async (plant) => {
    if (!plant) return;
    
    if (!plant.inStock) {
      showToastMessage(`❌ ${plant.name} is out of stock`);
      return;
    }

    try {
      // Get existing cart
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];
      
      // Check if item already exists in cart
      const existingItemIndex = cart.findIndex(item => item.id === plant.id);
      
      if (existingItemIndex >= 0) {
        // Increase quantity if already in cart
        cart[existingItemIndex].quantity += 1;
        showToastMessage(`✓ ${plant.name} quantity increased to ${cart[existingItemIndex].quantity}`);
      } else {
        // Add new item to cart
        cart.push({
          id: plant.id,
          name: plant.name,
          price: plant.price,
          quantity: 1,
          image: plant.image,
          category: plant.category,
        });
        showToastMessage(`✓ ${plant.name} added to cart!`);
      }
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart count
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToastMessage('❌ Failed to add item to cart');
    }
  };

  // Navigation function to plant detail page
  const navigateToPlantDetail = (plantId) => {
    if (!plantId) return;
    router.push({
      pathname: '/(tabs)/plantDetail',
      params: { plantId: plantId }
    });
  };

  // Navigation functions
  const navigateToHome = () => {
    setActiveTab('Home');
    router.push('/(tabs)/Homepage');
  };

  const navigateToCart = () => {
    setActiveTab('Cart');
    router.push('/(tabs)/cart');
  };

  const navigateToOrders = () => {
    setActiveTab('Orders');
    router.push('/(tabs)/Orders');
  };

  const navigateToAdmin = () => {
    setActiveTab('Admin');
    router.push('/admin/adminLogin');
  };

  // Render each plant card - 2 cards per row design
  const renderPlantCard = ({ item, index }) => {
    if (!item) return null;
    return (
      <TouchableOpacity 
        onPress={() => navigateToPlantDetail(item.id)}
        activeOpacity={0.7}
        style={[
          styles.cardContainer,
          index % 2 === 0 ? styles.cardLeft : styles.cardRight
        ]}
      >
        <View style={styles.card}>
          <Image 
            source={item.image}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {!item.inStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockBadgeText}>Out of Stock</Text>
            </View>
          )}
          <View style={styles.cardContent}>
            <Text style={styles.plantName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.categoryName}>{item.category}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.addToCartButton, !item.inStock && styles.disabledButton]}
              onPress={() => addToCart(item)}
              disabled={!item.inStock}
            >
              <Text style={styles.addToCartText}>
                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.heading}>🌱 Green Paradise</Text>
            </View>
            <Text style={styles.subheading}>
              Discover your perfect green companion. Shop our collection of beautiful, 
              air-purifying plants for every space.
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Search plants by name or category..."
              placeholderTextColor="#95a5a6"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.activeCategoryButton
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.activeCategoryButtonText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Results Count */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              Showing {filteredPlants.length} plants
            </Text>
          </View>

          {/* Plants Grid - 2 columns */}
          <View style={styles.gridWrapper}>
            <FlatList
              data={filteredPlants}
              renderItem={renderPlantCard}
              keyExtractor={(item) => item?.id || Math.random().toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.gridContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No plants found</Text>
                  <Text style={styles.emptySubText}>Try adjusting your search</Text>
                </View>
              }
            />
          </View>
          
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Fixed Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]}
            onPress={navigateToHome}
          >
            <Text style={[styles.navIcon, activeTab === 'home' && styles.activeNavIcon]}>🏠</Text>
            <Text style={[styles.navLabel, activeTab === 'home' && styles.activeNavLabel]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'cart' && styles.activeNavItem]}
            onPress={navigateToCart}
          >
            <Text style={[styles.navIcon, activeTab === 'cart' && styles.activeNavIcon]}>🛒</Text>
            <Text style={[styles.navLabel, activeTab === 'cart' && styles.activeNavLabel]}>Cart</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'orders' && styles.activeNavItem]}
            onPress={navigateToOrders}
          >
            <Text style={[styles.navIcon, activeTab === 'orders' && styles.activeNavIcon]}>📦</Text>
            <Text style={[styles.navLabel, activeTab === 'orders' && styles.activeNavLabel]}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'admin' && styles.activeNavItem]}
            onPress={navigateToAdmin}
          >
            <Text style={[styles.navIcon, activeTab === 'admin' && styles.activeNavIcon]}>👨‍💼</Text>
            <Text style={[styles.navLabel, activeTab === 'admin' && styles.activeNavLabel]}>Admin</Text>
          </TouchableOpacity>
        </View>

        {/* Toast Notification */}
        {showToast && (
          <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
            <View style={styles.toastContent}>
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 75,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    alignItems: 'center',
      justifyContent: 'center',
  },
  subheading: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 20,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeCategoryButton: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: '#fff',
  },
  resultsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  gridWrapper: {
    paddingHorizontal: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridContainer: {
    paddingBottom: 10,
  },
  cardContainer: {
    flex: 1,
    marginBottom: 12,
  },
  cardLeft: {
    marginRight: 6,
  },
  cardRight: {
    marginLeft: 6,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  outOfStockBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardContent: {
    padding: 12,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: '#2ecc71',
    fontWeight: '500',
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 16,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  addToCartButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#95a5a6',
  },
  bottomPadding: {
    height: 80,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 10,
    position: 'relative',
  },
  activeNavItem: {
    backgroundColor: '#2ecc71',
    borderRadius: 10,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeNavIcon: {
    color: '#fff',
  },
  navLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#fff',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Toast Notification Styles
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastContent: {
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HomePage;