import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const AdminHome = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [editedPlant, setEditedPlant] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Sample admin stats with unique IDs
  const [stats, setStats] = useState([
    { id: 'stat_1', title: 'Total Plants', value: '0', icon: '🌱', color: '#2ecc71' },
    { id: 'stat_2', title: 'Total Orders', value: '1,234', icon: '📦', color: '#2ecc71' },
    { id: 'stat_3', title: 'Total Users', value: '5,678', icon: '👥', color: '#2ecc71' },
    { id: 'stat_4', title: 'Revenue', value: '$45,678', icon: '💰', color: '#2ecc71' },
  ]);

  const recentOrders = [
    { id: 'order_1', customer: 'John Doe', plant: 'Monstera', amount: '$29.99', status: 'Delivered' },
    { id: 'order_2', customer: 'Jane Smith', plant: 'Snake Plant', amount: '$24.99', status: 'Processing' },
    { id: 'order_3', customer: 'Mike Johnson', plant: 'Peace Lily', amount: '$19.99', status: 'Shipped' },
  ];

  // Default placeholder image URL
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/80x80?text=🌿';

  // Handle image loading error
  const handleImageError = (plantId) => {
    setImageErrors(prev => ({ ...prev, [plantId]: true }));
  };

  // Default plant images as URLs
  const plantImages = {
    monstera: 'https://images.unsplash.com/photo-1614594972323-fc7b4b2d8b1a?w=400',
    snake: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
    peace: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
    fiddle: 'https://images.unsplash.com/photo-1614594972323-fc7b4b2d8b1a?w=400',
    lavender: 'https://images.unsplash.com/photo-1614594972323-fc7b4b2d8b1a?w=400',
    rose: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
    hydrangea: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
    aloe: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
    jade: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
    pearls: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
    orchid: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
    african: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
    bougainvillea: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
    basil: 'https://images.unsplash.com/photo-1614594972323-fc7b4b2d8b1a?w=400',
    mint: 'https://images.unsplash.com/photo-1593482891906-9c1d6b8f7c1a?w=400',
  };

  // Load plants from storage
  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      setLoading(true);
      // Complete 15 default plants data (matching homepage)
      const defaultPlants = [
        // Indoor Plants (4 plants)
        {
          id: 'plant_1',
          name: 'Monstera Deliciosa',
          category: 'Indoor Plants',
          description: 'Beautiful Swiss Cheese plant with large, glossy split leaves.',
          price: 29.99,
          originalPrice: 39.99,
          image: plantImages.monstera,
          inStock: true,
          discount: 25,
          careInstructions: '• Water when top 2 inches of soil are dry\n• Provide bright, indirect sunlight',
          specialNotes: '• Pet friendly? No - toxic to cats and dogs\n• Air purifying: Yes',
          lightRequirement: 'Indirect Sunlight',
          waterRequirement: 'Weekly',
          difficulty: 'Moderate',
        },
        {
          id: 'plant_2',
          name: 'Snake Plant',
          category: 'Indoor Plants',
          description: 'Low-maintenance plant with tall, upright sword-like leaves.',
          price: 24.99,
          originalPrice: 34.99,
          image: plantImages.snake,
          inStock: true,
          discount: 28,
          careInstructions: '• Water every 2-3 weeks\n• Tolerates low light',
          specialNotes: '• Pet friendly? No - mildly toxic\n• Air purifying: Excellent',
          lightRequirement: 'Low Light',
          waterRequirement: 'Bi-Weekly',
          difficulty: 'Easy',
        },
        {
          id: 'plant_3',
          name: 'Peace Lily',
          category: 'Indoor Plants',
          description: 'Elegant white flowers and dark green leaves.',
          price: 19.99,
          originalPrice: 29.99,
          image: plantImages.peace,
          inStock: true,
          discount: 33,
          careInstructions: '• Keep soil consistently moist\n• Low to medium light',
          specialNotes: '• Pet friendly? No - toxic to pets\n• Air purifying: Yes',
          lightRequirement: 'Low Light',
          waterRequirement: 'Every 2-3 Days',
          difficulty: 'Easy',
        },
        {
          id: 'plant_4',
          name: 'Fiddle Leaf Fig',
          category: 'Indoor Plants',
          description: 'Stunning tall plant with large, violin-shaped leaves.',
          price: 49.99,
          originalPrice: 69.99,
          image: plantImages.fiddle,
          inStock: false,
          discount: 0,
          careInstructions: '• Water when top inch of soil is dry\n• Bright, indirect light',
          specialNotes: '• Pet friendly? No - toxic\n• Air purifying: Yes',
          lightRequirement: 'Bright Light',
          waterRequirement: 'Weekly',
          difficulty: 'Hard',
        },
        // Outdoor Plants (3 plants)
        {
          id: 'plant_5',
          name: 'Lavender',
          category: 'Outdoor Plants',
          description: 'Fragrant purple flowers that attract pollinators.',
          price: 12.99,
          originalPrice: 18.99,
          image: plantImages.lavender,
          inStock: true,
          discount: 31,
          careInstructions: '• Full sun required\n• Well-draining soil',
          specialNotes: '• Pet friendly? Yes\n• Attracts bees and butterflies',
          lightRequirement: 'Direct Sunlight',
          waterRequirement: 'When Soil is Dry',
          difficulty: 'Easy',
        },
        {
          id: 'plant_6',
          name: 'Rose Bush',
          category: 'Outdoor Plants',
          description: 'Classic red roses with beautiful fragrance.',
          price: 34.99,
          originalPrice: 44.99,
          image: plantImages.rose,
          inStock: true,
          discount: 22,
          careInstructions: '• Full sun (6+ hours)\n• Regular watering',
          specialNotes: '• Pet friendly? No - thorns can injure\n• Fragrant flowers',
          lightRequirement: 'Direct Sunlight',
          waterRequirement: 'Every 2-3 Days',
          difficulty: 'Moderate',
        },
        {
          id: 'plant_7',
          name: 'Hydrangea',
          category: 'Outdoor Plants',
          description: 'Large, colorful flower clusters that bloom all summer.',
          price: 27.99,
          originalPrice: 37.99,
          image: plantImages.hydrangea,
          inStock: true,
          discount: 26,
          careInstructions: '• Morning sun, afternoon shade\n• Keep soil moist',
          specialNotes: '• Pet friendly? No - toxic\n• Soil pH affects flower color',
          lightRequirement: 'Indirect Sunlight',
          waterRequirement: 'Daily',
          difficulty: 'Moderate',
        },
        // Succulents (3 plants)
        {
          id: 'plant_8',
          name: 'Aloe Vera',
          category: 'Succulents',
          description: 'Medicinal succulent with healing properties.',
          price: 14.99,
          originalPrice: 19.99,
          image: plantImages.aloe,
          inStock: true,
          discount: 25,
          careInstructions: '• Bright, indirect light\n• Water deeply but infrequently',
          specialNotes: '• Pet friendly? No - toxic to pets\n• Medicinal gel for burns',
          lightRequirement: 'Bright Light',
          waterRequirement: 'Bi-Weekly',
          difficulty: 'Easy',
        },
        {
          id: 'plant_9',
          name: 'Jade Plant',
          category: 'Succulents',
          description: 'Lucky plant with thick, oval-shaped leaves.',
          price: 18.99,
          originalPrice: 24.99,
          image: plantImages.jade,
          inStock: true,
          discount: 24,
          careInstructions: '• Bright light for 4+ hours\n• Allow soil to dry',
          specialNotes: '• Pet friendly? No - toxic\n• Symbol of good luck',
          lightRequirement: 'Direct Sunlight',
          waterRequirement: 'When Soil is Dry',
          difficulty: 'Easy',
        },
        {
          id: 'plant_10',
          name: 'String of Pearls',
          category: 'Succulents',
          description: 'Unique trailing succulent with bead-like leaves.',
          price: 22.99,
          originalPrice: 29.99,
          image: plantImages.pearls,
          inStock: true,
          discount: 23,
          careInstructions: '• Bright indirect light\n• Water when pearls look deflated',
          specialNotes: '• Pet friendly? No - toxic\n• Trailing up to 3 feet',
          lightRequirement: 'Bright Light',
          waterRequirement: 'Weekly',
          difficulty: 'Moderate',
        },
        // Flowering Plants (3 plants)
        {
          id: 'plant_11',
          name: 'Orchid',
          category: 'Flowering Plants',
          description: 'Exotic flowers that bloom for months.',
          price: 39.99,
          originalPrice: 54.99,
          image: plantImages.orchid,
          inStock: true,
          discount: 27,
          careInstructions: '• Bright, indirect light\n• Water weekly with orchid food',
          specialNotes: '• Pet friendly? Yes\n• Blooms last 2-3 months',
          lightRequirement: 'Indirect Sunlight',
          waterRequirement: 'Weekly',
          difficulty: 'Hard',
        },
        {
          id: 'plant_12',
          name: 'African Violet',
          category: 'Flowering Plants',
          description: 'Compact plant with fuzzy leaves and delicate purple flowers.',
          price: 15.99,
          originalPrice: 21.99,
          image: plantImages.african,
          inStock: true,
          discount: 27,
          careInstructions: '• Bright, indirect light\n• Water from bottom',
          specialNotes: '• Pet friendly? Yes\n• Blooms continuously',
          lightRequirement: 'Bright Light',
          waterRequirement: 'Bi-Weekly',
          difficulty: 'Moderate',
        },
        {
          id: 'plant_13',
          name: 'Bougainvillea',
          category: 'Flowering Plants',
          description: 'Vibrant colorful bracts that bloom profusely.',
          price: 32.99,
          originalPrice: 42.99,
          image: plantImages.bougainvillea,
          inStock: true,
          discount: 23,
          careInstructions: '• Full sun required\n• Water when top soil is dry',
          specialNotes: '• Pet friendly? No - thorns\n• Blooms in cycles',
          lightRequirement: 'Direct Sunlight',
          waterRequirement: 'Weekly',
          difficulty: 'Moderate',
        },
        // Herbs (2 plants)
        {
          id: 'plant_14',
          name: 'Basil',
          category: 'Herbs',
          description: 'Aromatic herb essential for Italian cooking.',
          price: 8.99,
          originalPrice: 12.99,
          image: plantImages.basil,
          inStock: true,
          discount: 30,
          careInstructions: '• Full sun (6+ hours)\n• Keep soil moist',
          specialNotes: '• Pet friendly? Yes\n• Great for pesto',
          lightRequirement: 'Direct Sunlight',
          waterRequirement: 'Daily',
          difficulty: 'Easy',
        },
        {
          id: 'plant_15',
          name: 'Mint',
          category: 'Herbs',
          description: 'Refreshing herb for teas and cocktails.',
          price: 7.99,
          originalPrice: 11.99,
          image: plantImages.mint,
          inStock: true,
          discount: 33,
          careInstructions: '• Partial shade to full sun\n• Keep soil consistently moist',
          specialNotes: '• Pet friendly? Yes\n• Invasive - keep in pots',
          lightRequirement: 'Indirect Sunlight',
          waterRequirement: 'Daily',
          difficulty: 'Easy',
        },
      ];

      // Load custom plants from storage
      const storedPlants = await AsyncStorage.getItem('plants');
      let customPlants = storedPlants ? JSON.parse(storedPlants) : [];
      
      // Ensure custom plants have unique IDs and don't duplicate default IDs
      customPlants = customPlants
        .filter(plant => !defaultPlants.some(defaultPlant => defaultPlant.id === plant.id))
        .map((plant, index) => ({
          ...plant,
          id: plant.id || `custom_${Date.now()}_${index}`
        }));
      
      // Merge default and custom plants (default plants first, then custom)
      const allPlants = [...defaultPlants, ...customPlants];
      setPlants(allPlants);
      
      // Update stats with actual plant count
      setStats(prevStats => 
        prevStats.map(stat => 
          stat.id === 'stat_1' ? { ...stat, value: String(allPlants.length) } : stat
        )
      );
    } catch (error) {
      console.error('Error loading plants:', error);
      Alert.alert('Error', 'Failed to load plants');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            router.replace('/admin/adminLogin');
          },
        },
      ]
    );
  };

  const handleBackToHome = () => {
    router.back();
  };

  const handleEditPlant = (plant) => {
    setSelectedPlant(plant);
    setEditedPlant({ ...plant });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedPlants = plants.map(p => 
        p.id === editedPlant.id ? editedPlant : p
      );
      
      const defaultPlantIds = ['plant_1', 'plant_2', 'plant_3', 'plant_4', 'plant_5', 'plant_6', 'plant_7', 'plant_8', 'plant_9', 'plant_10', 'plant_11', 'plant_12', 'plant_13', 'plant_14', 'plant_15'];
      const customPlants = updatedPlants.filter(p => !defaultPlantIds.includes(p.id));
      
      await AsyncStorage.setItem('plants', JSON.stringify(customPlants));
      setPlants(updatedPlants);
      setEditModalVisible(false);
      Alert.alert('Success', 'Plant updated successfully!');
    } catch (error) {
      console.error('Error saving plant:', error);
      Alert.alert('Error', 'Failed to update plant');
    }
  };

  const handleDeletePlant = (plant) => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete "${plant.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const defaultPlantIds = ['plant_1', 'plant_2', 'plant_3', 'plant_4', 'plant_5', 'plant_6', 'plant_7', 'plant_8', 'plant_9', 'plant_10', 'plant_11', 'plant_12', 'plant_13', 'plant_14', 'plant_15'];
              
              if (defaultPlantIds.includes(plant.id)) {
                Alert.alert('Cannot Delete', 'Default plants cannot be deleted. You can only edit them or mark as out of stock.');
                return;
              }
              
              const updatedPlants = plants.filter(p => p.id !== plant.id);
              const customPlants = updatedPlants.filter(p => !defaultPlantIds.includes(p.id));
              await AsyncStorage.setItem('plants', JSON.stringify(customPlants));
              setPlants(updatedPlants);
              
              setStats(prevStats => 
                prevStats.map(stat => 
                  stat.id === 'stat_1' ? { ...stat, value: String(updatedPlants.length) } : stat
                )
              );
              
              Alert.alert('Success', 'Plant deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plant');
            }
          },
        },
      ]
    );
  };

  const handleToggleStock = async (plant) => {
    try {
      const updatedPlant = { ...plant, inStock: !plant.inStock };
      const updatedPlants = plants.map(p => p.id === plant.id ? updatedPlant : p);
      
      const defaultPlantIds = ['plant_1', 'plant_2', 'plant_3', 'plant_4', 'plant_5', 'plant_6', 'plant_7', 'plant_8', 'plant_9', 'plant_10', 'plant_11', 'plant_12', 'plant_13', 'plant_14', 'plant_15'];
      const customPlants = updatedPlants.filter(p => !defaultPlantIds.includes(p.id));
      
      await AsyncStorage.setItem('plants', JSON.stringify(customPlants));
      setPlants(updatedPlants);
      Alert.alert('Success', `Plant marked as ${!plant.inStock ? 'In Stock' : 'Out of Stock'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update stock status');
    }
  };

  // Ensure unique keys for all render functions
  const renderStatCard = ({ item }) => (
    <View key={item.id} style={[styles.statCard, { borderTopColor: item.color }]}>
      <Text style={styles.statIcon}>{item.icon}</Text>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <View key={item.id} style={styles.orderItem}>
      <View style={styles.orderInfo}>
        <Text style={styles.customerName}>{item.customer}</Text>
        <Text style={styles.plantName}>{item.plant}</Text>
        <Text style={styles.orderAmount}>{item.amount}</Text>
      </View>
      <View style={[styles.statusBadge, 
        item.status === 'Delivered' && styles.deliveredBadge,
        item.status === 'Processing' && styles.processingBadge,
        item.status === 'Shipped' && styles.shippedBadge,
      ]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  const renderPlantCard = ({ item }) => (
    <View key={item.id} style={styles.plantCard}>
      <Image 
        source={{ uri: imageErrors[item.id] ? PLACEHOLDER_IMAGE : (item.image || PLACEHOLDER_IMAGE) }} 
        style={styles.plantCardImage}
        onError={() => handleImageError(item.id)}
      />
      
      <View style={styles.plantCardInfo}>
        <View style={styles.plantCardHeader}>
          <Text style={styles.plantCardName}>{item.name}</Text>
          <View style={[styles.stockBadge, item.inStock ? styles.inStockBadge : styles.outOfStockBadge]}>
            <Text style={styles.stockBadgeText}>{item.inStock ? 'In Stock' : 'Out of Stock'}</Text>
          </View>
        </View>
        
        <Text style={styles.plantCardCategory}>{item.category}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.plantCardPrice}>${item.price.toFixed(2)}</Text>
          {item.originalPrice && item.discount > 0 && (
            <>
              <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </View>
            </>
          )}
        </View>
        
        <View style={styles.plantCardActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => handleEditPlant(item)}
          >
            <Text style={styles.actionBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.stockBtn]}
            onPress={() => handleToggleStock(item)}
          >
            <Text style={styles.actionBtnText}>{item.inStock ? '📦 Out Stock' : '✅ In Stock'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeletePlant(item)}
          >
            <Text style={styles.actionBtnText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Plant</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalLabel}>Plant Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editedPlant?.name}
              onChangeText={(text) => setEditedPlant({ ...editedPlant, name: text })}
            />

            <Text style={styles.modalLabel}>Category</Text>
            <TextInput
              style={styles.modalInput}
              value={editedPlant?.category}
              onChangeText={(text) => setEditedPlant({ ...editedPlant, category: text })}
            />

            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editedPlant?.description}
              onChangeText={(text) => setEditedPlant({ ...editedPlant, description: text })}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.modalLabel}>Price ($)</Text>
            <TextInput
              style={styles.modalInput}
              value={editedPlant?.price?.toString()}
              onChangeText={(text) => setEditedPlant({ ...editedPlant, price: parseFloat(text) || 0 })}
              keyboardType="decimal-pad"
            />

            <Text style={styles.modalLabel}>Original Price ($)</Text>
            <TextInput
              style={styles.modalInput}
              value={editedPlant?.originalPrice?.toString()}
              onChangeText={(text) => {
                const origPrice = parseFloat(text) || 0;
                const newPrice = editedPlant?.price || 0;
                const discount = origPrice > 0 ? Math.round(((origPrice - newPrice) / origPrice) * 100) : 0;
                setEditedPlant({ ...editedPlant, originalPrice: origPrice, discount });
              }}
              keyboardType="decimal-pad"
            />

            {editedPlant?.discount > 0 && (
              <View style={styles.discountPreview}>
                <Text style={styles.discountPreviewText}>💰 Discount: {editedPlant.discount}% OFF</Text>
              </View>
            )}

            <Text style={styles.modalLabel}>Image URL</Text>
            <TextInput
              style={styles.modalInput}
              value={editedPlant?.image}
              onChangeText={(text) => setEditedPlant({ ...editedPlant, image: text })}
              placeholder="Enter image URL"
            />

            <Text style={styles.modalLabel}>Light Requirement</Text>
            <TextInput
              style={styles.modalInput}
              value={editedPlant?.lightRequirement}
              onChangeText={(text) => setEditedPlant({ ...editedPlant, lightRequirement: text })}
            />

            <Text style={styles.modalLabel}>Water Requirement</Text>
            <TextInput
              style={styles.modalInput}
              value={editedPlant?.waterRequirement}
              onChangeText={(text) => setEditedPlant({ ...editedPlant, waterRequirement: text })}
            />

            <Text style={styles.modalLabel}>Difficulty</Text>
            <TextInput
              style={styles.modalInput}
              value={editedPlant?.difficulty}
              onChangeText={(text) => setEditedPlant({ ...editedPlant, difficulty: text })}
            />

            <Text style={styles.modalLabel}>Care Instructions</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editedPlant?.careInstructions}
              onChangeText={(text) => setEditedPlant({ ...editedPlant, careInstructions: text })}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.modalLabel}>Special Notes</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editedPlant?.specialNotes}
              onChangeText={(text) => setEditedPlant({ ...editedPlant, specialNotes: text })}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2ecc71" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🌱</Text>
            <Text style={styles.headerTitle}>Admin Portal</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Welcome back, Administrator!</Text>
        <Text style={styles.welcomeSubtext}>Manage your plant store from here</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabIcon, activeTab === 'dashboard' && styles.activeTabIcon]}>📊</Text>
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'plants' && styles.activeTab]}
          onPress={() => setActiveTab('plants')}
        >
          <Text style={[styles.tabIcon, activeTab === 'plants' && styles.activeTabIcon]}>🌿</Text>
          <Text style={[styles.tabText, activeTab === 'plants' && styles.activeTabText]}>Plants</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabIcon, activeTab === 'orders' && styles.activeTabIcon]}>📋</Text>
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Orders</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'dashboard' && (
          <View style={styles.content}>
            <FlatList
              data={stats}
              renderItem={renderStatCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.statsGrid}
            />

            <View style={styles.recentOrders}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🕒</Text>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
              </View>
              <FlatList
                data={recentOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All Orders →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActions}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>⚡</Text>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/admin/addPlant')}
                >
                  <View style={styles.actionIconCircle}>
                    <Text style={styles.actionIcon}>➕</Text>
                  </View>
                  <Text style={styles.actionText}>Add Plant</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setActiveTab('plants')}
                >
                  <View style={styles.actionIconCircle}>
                    <Text style={styles.actionIcon}>✏️</Text>
                  </View>
                  <Text style={styles.actionText}>Manage Plants</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={styles.actionIconCircle}>
                    <Text style={styles.actionIcon}>📊</Text>
                  </View>
                  <Text style={styles.actionText}>Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={styles.actionIconCircle}>
                    <Text style={styles.actionIcon}>👥</Text>
                  </View>
                  <Text style={styles.actionText}>Users</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'plants' && (
          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator size="large" color="#2ecc71" style={styles.loader} />
            ) : (
              <>
                <View style={styles.plantsHeader}>
                  <View style={styles.plantsHeaderLeft}>
                    <Text style={styles.plantsIcon}>🌿</Text>
                    <Text style={styles.plantsTitle}>All Plants</Text>
                  </View>
                  <Text style={styles.plantsCount}>{plants.length} Total</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.addPlantBtn}
                  onPress={() => router.push('/admin/addPlant')}
                >
                  <Text style={styles.addPlantBtnText}>+ Add New Plant</Text>
                </TouchableOpacity>
                
                {plants.length === 0 ? (
                  <View style={styles.emptyPlantsContainer}>
                    <Text style={styles.emptyPlantsIcon}>🌱</Text>
                    <Text style={styles.emptyPlantsText}>No plants found</Text>
                    <Text style={styles.emptyPlantsSubtext}>Click "Add New Plant" to get started</Text>
                  </View>
                ) : (
                  <FlatList
                    data={plants}
                    renderItem={renderPlantCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.plantsGrid}
                  />
                )}
              </>
            )}
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.content}>
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderIcon}>📋</Text>
              <Text style={styles.placeholderText}>Order Management Module</Text>
              <Text style={styles.placeholderSubtext}>Coming Soon with tracking features</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // ... (keep all your existing styles)
  header: {
    backgroundColor: '#2ecc71',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#2ecc71',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
    color: '#7f8c8d',
  },
  activeTabIcon: {
    color: '#fff',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: 15,
  },
  statsGrid: {
    paddingBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  recentOrders: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  plantName: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2ecc71',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  deliveredBadge: {
    backgroundColor: '#d5f4e6',
  },
  processingBadge: {
    backgroundColor: '#fff3e0',
  },
  shippedBadge: {
    backgroundColor: '#e3f2fd',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  viewAllButton: {
    marginTop: 15,
    alignItems: 'center',
    paddingVertical: 10,
  },
  viewAllText: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    marginTop: 15,
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 24,
    color: '#fff',
  },
  actionText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  placeholderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  plantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  plantsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantsIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  plantsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  plantsCount: {
    fontSize: 14,
    color: '#7f8c8d',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  addPlantBtn: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addPlantBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyPlantsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyPlantsIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyPlantsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyPlantsSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  plantsGrid: {
    paddingBottom: 20,
  },
  plantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  plantCardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  plantCardInfo: {
    flex: 1,
  },
  plantCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  plantCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inStockBadge: {
    backgroundColor: '#d5f4e6',
  },
  outOfStockBadge: {
    backgroundColor: '#fce4e4',
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2c3e50',
  },
  plantCardCategory: {
    fontSize: 12,
    color: '#2ecc71',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  plantCardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  originalPrice: {
    fontSize: 12,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  plantCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#3498db',
  },
  stockBtn: {
    backgroundColor: '#f39c12',
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  loader: {
    marginTop: 50,
  },
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
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    marginTop: 15,
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    marginHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  discountPreview: {
    backgroundColor: '#d5f4e6',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  discountPreviewText: {
    color: '#2ecc71',
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminHome;