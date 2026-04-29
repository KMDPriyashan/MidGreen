import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
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
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const CartPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cart');
  const [fadeAnim] = useState(new Animated.Value(0));

  // Plant Data (for reference)
  const plantsData = {
    '1': {
      id: '1',
      name: 'Monstera Deliciosa',
      price: 29.99,
      image: require('../../assets/images/home-back.png'),
    },
    '2': {
      id: '2',
      name: 'Snake Plant',
      price: 24.99,
      image: require('../../assets/images/home-back.png'),
    },
    '3': {
      id: '3',
      name: 'Peace Lily',
      price: 19.99,
      image: require('../../assets/images/home-back.png'),
    },
    '4': {
      id: '4',
      name: 'Fiddle Leaf Fig',
      price: 49.99,
      image: require('../../assets/images/home-back.png'),
    },
    '5': {
      id: '5',
      name: 'Lavender',
      price: 12.99,
      image: require('../../assets/images/home-back.png'),
    },
    '6': {
      id: '6',
      name: 'Rose Bush',
      price: 34.99,
      image: require('../../assets/images/home-back.png'),
    },
    '7': {
      id: '7',
      name: 'Hydrangea',
      price: 27.99,
      image: require('../../assets/images/home-back.png'),
    },
    '8': {
      id: '8',
      name: 'Aloe Vera',
      price: 14.99,
      image: require('../../assets/images/home-back.png'),
    },
    '9': {
      id: '9',
      name: 'Jade Plant',
      price: 18.99,
      image: require('../../assets/images/home-back.png'),
    },
    '10': {
      id: '10',
      name: 'String of Pearls',
      price: 22.99,
      image: require('../../assets/images/home-back.png'),
    },
    '11': {
      id: '11',
      name: 'Orchid',
      price: 39.99,
      image: require('../../assets/images/home-back.png'),
    },
    '12': {
      id: '12',
      name: 'African Violet',
      price: 15.99,
      image: require('../../assets/images/home-back.png'),
    },
    '13': {
      id: '13',
      name: 'Bougainvillea',
      price: 32.99,
      image: require('../../assets/images/home-back.png'),
    },
    '14': {
      id: '14',
      name: 'Basil',
      price: 8.99,
      image: require('../../assets/images/home-back.png'),
    },
    '15': {
      id: '15',
      name: 'Mint',
      price: 7.99,
      image: require('../../assets/images/home-back.png'),
    },
  };

  // Load cart items from AsyncStorage
  useEffect(() => {
    loadCartItems();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadCartItems = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save cart items to AsyncStorage
  const saveCartItems = async (items) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    saveCartItems(updatedCart);
  };

  // Remove item from cart with animation
  const removeFromCart = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedCart = cartItems.filter(item => item.id !== itemId);
            setCartItems(updatedCart);
            saveCartItems(updatedCart);
            Alert.alert('Success', 'Item removed from cart');
          },
        },
      ]
    );
  };

  // Open quantity modal
  const openQuantityModal = (item) => {
    setSelectedItem(item);
    setTempQuantity(item.quantity);
    setQuantityModalVisible(true);
  };

  // Save quantity from modal
  const saveQuantity = () => {
    if (selectedItem && tempQuantity > 0) {
      updateQuantity(selectedItem.id, tempQuantity);
    }
    setQuantityModalVisible(false);
    setSelectedItem(null);
  };

  // Calculate subtotal
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Calculate tax (10% for example)
  const getTax = () => {
    return getSubtotal() * 0.10;
  };

  // Calculate shipping (free over $50)
  const getShipping = () => {
    return getSubtotal() > 50 ? 0 : 5.99;
  };

  // Calculate total
  const getTotal = () => {
    return getSubtotal() + getTax() + getShipping();
  };

  // Clear all cart items
  const clearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setCartItems([]);
            saveCartItems([]);
            Alert.alert('Success', 'Cart has been cleared');
          },
        },
      ]
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before checking out.');
      return;
    }
    setCheckoutModalVisible(true);
  };

  // Process order
  const processOrder = async () => {
    setCheckoutLoading(true);
    
    setTimeout(async () => {
      const orderDetails = {
        orderId: 'ORD' + Date.now(),
        items: cartItems,
        subtotal: getSubtotal(),
        tax: getTax(),
        shipping: getShipping(),
        total: getTotal(),
        date: new Date().toISOString(),
        status: 'pending',
      };

      try {
        const existingOrders = await AsyncStorage.getItem('orders');
        const orders = existingOrders ? JSON.parse(existingOrders) : [];
        orders.push(orderDetails);
        await AsyncStorage.setItem('orders', JSON.stringify(orders));
        
        await AsyncStorage.removeItem('cart');
        setCartItems([]);
        
        Alert.alert(
          'Order Placed Successfully! 🎉',
          `Your order #${orderDetails.orderId} has been placed. Total: $${getTotal().toFixed(2)}`,
          [
            {
              text: 'View Orders',
              onPress: () => {
                setCheckoutModalVisible(false);
                router.push('/(tabs)/orders');
              },
            },
            {
              text: 'Continue Shopping',
              onPress: () => {
                setCheckoutModalVisible(false);
                router.push('/(tabs)/home');
              },
            },
          ]
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to process order. Please try again.');
      } finally {
        setCheckoutLoading(false);
      }
    }, 2000);
  };

  // Navigation functions
  const navigateToHome = () => {
    setActiveTab('home');
    router.push('/(tabs)/home');
  };

  const navigateToCart = () => {
    setActiveTab('cart');
  };

  const navigateToOrders = () => {
    setActiveTab('orders');
    router.push('/(tabs)/orders');
  };

  const navigateToAdmin = () => {
    setActiveTab('admin');
    router.push('/admin/adminLogin');
  };

  // Right swipe action for delete
  const renderRightActions = (itemId) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => removeFromCart(itemId)}
      >
        <Text style={styles.deleteActionText}>🗑️ Delete</Text>
      </TouchableOpacity>
    );
  };

  // Render cart item with swipeable
  const renderCartItem = ({ item }) => {
    const plant = plantsData[item.id];
    if (!plant) return null;

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item.id)}
        overshootRight={false}
      >
        <View style={styles.cartItem}>
          <Image source={plant.image} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{plant.name}</Text>
            <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openQuantityModal(item)}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromCart(item.id)}
          >
            <Text style={styles.removeButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>My Cart</Text>
              <Text style={styles.headerSubtitle}>
                {cartItems.length > 0 ? `${cartItems.reduce((sum, item) => sum + item.quantity, 0)} items` : 'Your shopping cart'}
              </Text>
            </View>
            {cartItems.length > 0 && (
              <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {cartItems.length === 0 ? (
            // Empty Cart Design with App Name & Slogan
            <ScrollView 
              contentContainerStyle={styles.emptyCartContainer}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={[styles.emptyCartContent, { opacity: fadeAnim }]}>
                {/* App Name - MidGreen */}
                <Text style={styles.appName}>MidGreen</Text>
                
                {/* Brand Slogan */}
                <Text style={styles.slogan}>Grow Green, Live Clean</Text>
                
                {/* Empty Cart Icon */}
                <View style={styles.emptyIconContainer}>
                  <Text style={styles.emptyIcon}>🛒</Text>
                </View>
                
                {/* Empty Cart Message */}
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptyMessage}>
                  Looks like you haven't added any plants to your cart yet.
                </Text>
                
                {/* Company Mission & Quality Description */}
                <View style={styles.companyInfo}>
                  <Text style={styles.companyDescription}>
                    🌱 At MidGreen, we bring nature to your doorstep with premium quality plants 
                    that purify air, reduce stress, and bring life to your space.
                  </Text>
                  
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>✓</Text>
                      <Text style={styles.featureText}>100% Fresh & Healthy Plants</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>✓</Text>
                      <Text style={styles.featureText}>Eco-Friendly Packaging</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>✓</Text>
                      <Text style={styles.featureText}>Free Shipping on Orders $50+</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>✓</Text>
                      <Text style={styles.featureText}>24/7 Customer Support</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>✓</Text>
                      <Text style={styles.featureText}>30-Day Easy Returns</Text>
                    </View>
                  </View>
                </View>
                
                {/* Shop Now Button */}
                <TouchableOpacity
                  style={styles.shopNowButton}
                  onPress={navigateToHome}
                >
                  <Text style={styles.shopNowButtonText}>🌱 Start Shopping</Text>
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
          ) : (
            <GestureHandlerRootView style={{ flex: 1 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Cart Items */}
                <View style={styles.cartItemsContainer}>
                  {cartItems.map((item, index) => (
                    <View key={item.id}>
                      {renderCartItem({ item })}
                    </View>
                  ))}
                </View>

                {/* Order Summary */}
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryTitle}>Order Summary</Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>${getSubtotal().toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax (10%)</Text>
                    <Text style={styles.summaryValue}>${getTax().toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping</Text>
                    <Text style={styles.summaryValue}>
                      {getShipping() === 0 ? 'Free' : `$${getShipping().toFixed(2)}`}
                    </Text>
                  </View>
                  
                  {getSubtotal() > 50 && (
                    <View style={styles.freeShippingBadge}>
                      <Text style={styles.freeShippingText}>🎉 You've earned free shipping!</Text>
                    </View>
                  )}
                  
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>${getTotal().toFixed(2)}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handleCheckout}
                  >
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />
              </ScrollView>
            </GestureHandlerRootView>
          )}

          {/* Bottom Navigation Bar */}
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
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</Text>
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

          {/* Quantity Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={quantityModalVisible}
            onRequestClose={() => setQuantityModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Update Quantity</Text>
                <TextInput
                  style={styles.modalInput}
                  value={String(tempQuantity)}
                  onChangeText={(text) => setTempQuantity(parseInt(text) || 1)}
                  keyboardType="numeric"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    onPress={() => setQuantityModalVisible(false)}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveModalButton]}
                    onPress={saveQuantity}
                  >
                    <Text style={styles.saveModalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Checkout Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={checkoutModalVisible}
            onRequestClose={() => setCheckoutModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, styles.checkoutModal]}>
                {checkoutLoading ? (
                  <>
                    <ActivityIndicator size="large" color="#2ecc71" />
                    <Text style={styles.loadingText}>Processing your order...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalTitle}>Confirm Order</Text>
                    <Text style={styles.checkoutText}>
                      Total Amount: <Text style={styles.checkoutTotal}>${getTotal().toFixed(2)}</Text>
                    </Text>
                    <Text style={styles.checkoutItems}>
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)} item(s) in your cart
                    </Text>
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelModalButton]}
                        onPress={() => setCheckoutModalVisible(false)}
                      >
                        <Text style={styles.cancelModalButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.saveModalButton]}
                        onPress={processOrder}
                      >
                        <Text style={styles.saveModalButtonText}>Confirm Order</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: '#2c3e50',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  // Empty Cart Styles with App Name & Slogan
  emptyCartContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  emptyCartContent: {
    alignItems: 'center',
    width: '100%',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  companyInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    width: '100%',
  },
  companyDescription: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15,
  },
  featuresList: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: 'bold',
    marginRight: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  shopNowButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  shopNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Cart Items Styles
  cartItemsContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 15,
    color: '#2c3e50',
  },
  removeButton: {
    padding: 5,
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 22,
  },
  deleteAction: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 15,
    marginBottom: 12,
  },
  deleteActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  freeShippingBadge: {
    backgroundColor: '#d5f5e3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  freeShippingText: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  checkoutButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelModalButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveModalButton: {
    backgroundColor: '#2ecc71',
  },
  cancelModalButtonText: {
    color: '#7f8c8d',
    textAlign: 'center',
    fontWeight: '600',
  },
  saveModalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  checkoutModal: {
    width: '90%',
  },
  checkoutText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
  },
  checkoutTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  checkoutItems: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
});

export default CartPage;