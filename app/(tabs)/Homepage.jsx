import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const HomePage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Plant Data - Using local images with require
  const plantsData = [
    // Indoor Plants
    {
      id: '1',
      name: 'Monstera Deliciosa',
      category: 'Indoor Plants',
      description: 'Beautiful Swiss Cheese plant with large, glossy split leaves. Perfect for adding tropical vibes to any room.',
      price: '$29.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    {
      id: '2',
      name: 'Snake Plant',
      category: 'Indoor Plant',
      description: 'Low-maintenance plant with tall, upright sword-like leaves. Excellent air purifier and thrives in any condition.',
      price: '$24.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    {
      id: '3',
      name: 'Peace Lily',
      category: 'Indoor Plants',
      description: 'Elegant white flowers and dark green leaves. Known for its air-purifying abilities and easy care.',
      price: '$19.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    {
      id: '4',
      name: 'Fiddle Leaf Fig',
      category: 'Indoor Plants',
      description: 'Stunning tall plant with large, violin-shaped leaves. A favorite for modern home decor.',
      price: '$49.99',
      image: require('../../assets/images/home-back.png'),
      inStock: false,
    },
    // Outdoor Plants
    {
      id: '5',
      name: 'Lavender',
      category: 'Outdoor Plants',
      description: 'Fragrant purple flowers that attract pollinators. Perfect for gardens and borders.',
      price: '$12.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    {
      id: '6',
      name: 'Rose Bush',
      category: 'Outdoor Plants',
      description: 'Classic red roses with beautiful fragrance. Blooms repeatedly throughout the season.',
      price: '$34.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    {
      id: '7',
      name: 'Hydrangea',
      category: 'Outdoor Plants',
      description: 'Large, colorful flower clusters that bloom all summer. Changes color based on soil pH.',
      price: '$27.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    // Succulents
    {
      id: '8',
      name: 'Aloe Vera',
      category: 'Succulents',
      description: 'Medicinal succulent with healing properties. Easy to grow and great for beginners.',
      price: '$14.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    {
      id: '9',
      name: 'Jade Plant',
      category: 'Succulents',
      description: 'Lucky plant with thick, oval-shaped leaves. Brings prosperity and good fortune.',
      price: '$18.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    {
      id: '10',
      name: 'String of Pearls',
      category: 'Succulents',
      description: 'Unique trailing succulent with bead-like leaves. Perfect for hanging baskets.',
      price: '$22.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    // Flowering Plants
    {
      id: '11',
      name: 'Orchid',
      category: 'Flowering Plants',
      description: 'Exotic flowers that bloom for months. Available in various stunning colors.',
      price: '$39.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    {
      id: '12',
      name: 'African Violet',
      category: 'Flowering Plants',
      description: 'Compact plant with fuzzy leaves and delicate purple flowers. Blooms year-round.',
      price: '$15.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    {
      id: '13',
      name: 'Bougainvillea',
      category: 'Flowering Plants',
      description: 'Vibrant colorful bracts that bloom profusely. Perfect for trellises and walls.',
      price: '$32.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    // Herbs
    {
      id: '14',
      name: 'Basil',
      category: 'Herbs',
      description: 'Aromatic herb essential for Italian cooking. Easy to grow in pots or gardens.',
      price: '$8.99',
      image: require('../../assets/images/home-back.png'),
      inStock: true,
    },
    {
      id: '15',
      name: 'Mint',
      category: 'Herbs',
      description: 'Refreshing herb for teas and cocktails. Grows vigorously and spreads quickly.',
      price: '$7.99',
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

  // Add to cart function
  const addToCart = (plant) => {
    Alert.alert(
      'Added to Cart!',
      `${plant.name} has been added to your cart.`,
      [{ text: 'OK', style: 'default' }]
    );
    console.log('Added to cart:', plant.name);
  };

  // Navigate to Admin Login
  const navigateToAdmin = () => {
    router.push('/admin/adminLogin');
  };

  // Render each plant card
  const renderPlantCard = ({ item }) => (
    <View style={styles.card}>
      <Image 
        source={item.image}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.categoryName}>{item.category}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price}</Text>
          {!item.inStock && <Text style={styles.outOfStock}>Out of Stock</Text>}
        </View>
        <TouchableOpacity 
          style={[styles.addToCartButton, !item.inStock && styles.disabledButton]}
          onPress={() => addToCart(item)}
          disabled={!item.inStock}
        >
          <Text style={styles.addToCartText}>
            {item.inStock ? 'Add to Cart 🛒' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section with Admin Button */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.heading}>🌱 Green Paradise</Text>
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={navigateToAdmin}
            >
              <Text style={styles.adminButtonText}>🔖 Admin</Text>
            </TouchableOpacity>
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
        <FlatList
          data={filteredPlants}
          renderItem={renderPlantCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No plants found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search</Text>
            </View>
          }
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
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
  },
  adminButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  adminButtonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
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
  },
  resultsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 5,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
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
  outOfStock: {
    fontSize: 11,
    color: '#e74c3c',
    fontWeight: '500',
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
});

export default HomePage;