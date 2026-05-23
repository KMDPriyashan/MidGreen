import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailModalVisible, setOrderDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState(false);

  // Available plants for editing
  const availablePlants = [
    { id: '1', name: 'Monstera Deliciosa', price: 29.99, category: 'Indoor Plants' },
    { id: '2', name: 'Snake Plant', price: 24.99, category: 'Indoor Plants' },
    { id: '3', name: 'Peace Lily', price: 19.99, category: 'Indoor Plants' },
    { id: '4', name: 'Fiddle Leaf Fig', price: 49.99, category: 'Indoor Plants' },
    { id: '5', name: 'Lavender', price: 12.99, category: 'Outdoor Plants' },
    { id: '6', name: 'Rose Bush', price: 34.99, category: 'Outdoor Plants' },
    { id: '7', name: 'Hydrangea', price: 27.99, category: 'Outdoor Plants' },
    { id: '8', name: 'Aloe Vera', price: 14.99, category: 'Succulents' },
    { id: '9', name: 'Jade Plant', price: 18.99, category: 'Succulents' },
    { id: '10', name: 'String of Pearls', price: 22.99, category: 'Succulents' },
    { id: '11', name: 'Orchid', price: 39.99, category: 'Flowering Plants' },
    { id: '12', name: 'African Violet', price: 15.99, category: 'Flowering Plants' },
    { id: '13', name: 'Bougainvillea', price: 32.99, category: 'Flowering Plants' },
    { id: '14', name: 'Basil', price: 8.99, category: 'Herbs' },
    { id: '15', name: 'Mint', price: 7.99, category: 'Herbs' },
  ];

  // Coupon codes
  const coupons = {
    'SAVE10': 10,
    'SAVE20': 20,
    'GREEN50': 50,
    'PLANTLOVER': 15,
    'WELCOME': 25,
  };

  // Load orders from AsyncStorage
  useEffect(() => {
    loadOrders();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('orders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        parsedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save orders to AsyncStorage
  const saveOrders = async (updatedOrders) => {
    try {
      await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  };

  // Navigation functions
  const navigateToHome = () => {
    setActiveTab('home');
    router.push('/(tabs)/Homepage');
  };

  const navigateToCart = () => {
    setActiveTab('cart');
    router.push('/(tabs)/cart');
  };

  const navigateToOrders = () => {
    setActiveTab('orders');
  };

  const navigateToAdmin = () => {
    setActiveTab('admin');
    router.push('/admin/adminLogin');
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setCouponCode('');
    setDiscountPercent(0);
    setAppliedDiscount(false);
    setOrderDetailModalVisible(true);
  };

  // Edit order - open edit modal
  const editOrder = () => {
    setEditedOrder({ 
      ...selectedOrder,
      items: [...selectedOrder.items],
      couponApplied: selectedOrder.couponApplied || null,
      discountAmount: selectedOrder.discountAmount || 0
    });
    setCouponCode('');
    setDiscountPercent(0);
    setAppliedDiscount(false);
    setEditModalVisible(true);
    setOrderDetailModalVisible(false);
  };

  // Add item to order
  const addItemToOrder = () => {
    Alert.alert(
      'Add Plant',
      'Select a plant to add to your order',
      [
        ...availablePlants.map(plant => ({
          text: `${plant.name} - $${plant.price}`,
          onPress: () => {
            const existingItem = editedOrder.items.find(item => item.id === plant.id);
            if (existingItem) {
              existingItem.quantity += 1;
            } else {
              editedOrder.items.push({
                id: plant.id,
                name: plant.name,
                price: plant.price,
                quantity: 1,
                category: plant.category,
              });
            }
            recalculateOrderTotals();
            setEditedOrder({ ...editedOrder });
          }
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Remove item from order
  const removeItemFromOrder = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            editedOrder.items = editedOrder.items.filter(item => item.id !== itemId);
            recalculateOrderTotals();
            setEditedOrder({ ...editedOrder });
          }
        }
      ]
    );
  };

  // Update item quantity
  const updateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItemFromOrder(itemId);
      return;
    }
    const item = editedOrder.items.find(item => item.id === itemId);
    if (item) {
      item.quantity = newQuantity;
      recalculateOrderTotals();
      setEditedOrder({ ...editedOrder });
    }
  };

  // Apply coupon code
  const applyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    const discount = coupons[couponCode.toUpperCase()];
    if (discount) {
      setDiscountPercent(discount);
      setAppliedDiscount(true);
      recalculateOrderTotals();
      Alert.alert('Success', `Coupon applied! ${discount}% discount`);
    } else {
      Alert.alert('Invalid', 'Invalid coupon code');
    }
  };

  // Recalculate order totals
  const recalculateOrderTotals = () => {
    if (!editedOrder) return;

    const subtotal = editedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let total = subtotal;
    let tax = subtotal * 0.10;
    let shipping = subtotal > 50 ? 0 : 5.99;
    
    let discountAmount = 0;
    if (appliedDiscount && discountPercent > 0) {
      discountAmount = subtotal * (discountPercent / 100);
      total = subtotal - discountAmount;
    }
    
    total = total + tax + shipping;
    
    editedOrder.subtotal = subtotal;
    editedOrder.tax = tax;
    editedOrder.shipping = shipping;
    editedOrder.total = total;
    editedOrder.discountAmount = discountAmount;
    editedOrder.couponApplied = appliedDiscount ? couponCode.toUpperCase() : null;
  };

  // Save edited order
  const saveEditedOrder = async () => {
    if (!editedOrder.items.length) {
      Alert.alert('Error', 'Order must have at least one item');
      return;
    }

    recalculateOrderTotals();
    
    const updatedOrders = orders.map(order =>
      order.orderId === editedOrder.orderId ? editedOrder : order
    );
    await saveOrders(updatedOrders);
    setSelectedOrder(editedOrder);
    setEditModalVisible(false);
    Alert.alert('Success', 'Order updated successfully!');
  };

  // Delete order
  const deleteOrder = (orderId) => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedOrders = orders.filter(order => order.orderId !== orderId);
            await saveOrders(updatedOrders);
            Alert.alert('Success', 'Order deleted successfully');
          },
        },
      ]
    );
  };

  // Get status color - FIXED with null check
  const getStatusColor = (status) => {
    if (!status) return '#7f8c8d';
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f39c12';
      case 'processing':
        return '#3498db';
      case 'shipped':
        return '#2ecc71';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  // Get status icon - FIXED with null check
  const getStatusIcon = (status) => {
    if (!status) return '📦';
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  // Get status text - FIXED with null check
  const getStatusText = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Cancel order
  const cancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            const updatedOrders = orders.map(order =>
              order.orderId === orderId
                ? { ...order, status: 'cancelled' }
                : order
            );
            await saveOrders(updatedOrders);
            Alert.alert('Success', 'Order has been cancelled');
          },
        },
      ]
    );
  };

  // Reorder items
  const reorderItems = async (order) => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];
      
      order.items.forEach(orderItem => {
        const existingItemIndex = cart.findIndex(item => item.id === orderItem.id);
        if (existingItemIndex >= 0) {
          cart[existingItemIndex].quantity += orderItem.quantity;
        } else {
          cart.push({ ...orderItem });
        }
      });
      
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert(
        'Success',
        'Items added to cart!',
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add items to cart');
    }
  };

  // Proceed to checkout from order
  const proceedToCheckout = async () => {
    if (!selectedOrder) return;
    
    try {
      const checkoutData = {
        items: selectedOrder.items,
        subtotal: selectedOrder.subtotal,
        tax: selectedOrder.tax,
        shipping: selectedOrder.shipping,
        total: selectedOrder.total,
        discountAmount: selectedOrder.discountAmount || 0,
        couponApplied: selectedOrder.couponApplied || null,
      };
      
      await AsyncStorage.setItem('selectedOrderForCheckout', JSON.stringify(checkoutData));
      setOrderDetailModalVisible(false);
      router.push('/(tabs)/checkout');
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
      Alert.alert('Error', 'Failed to proceed to checkout');
    }
  };

  // Right swipe action for delete
  const renderRightActions = (orderId) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => deleteOrder(orderId)}
      >
        <Text style={styles.deleteActionText}>🗑️ Delete</Text>
      </TouchableOpacity>
    );
  };

  // Render order card with swipeable
  const renderOrderCard = (order) => {
    if (!order) return null;
    const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(order.orderId)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() => viewOrderDetails(order)}
          activeOpacity={0.9}
        >
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text style={styles.orderIcon}>📋</Text>
              <View>
                <Text style={styles.orderId}>#{order.orderId?.slice(-8) || 'N/A'}</Text>
                <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusIcon}>{getStatusIcon(order.status)}</Text>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>

          <View style={styles.orderItems}>
            <Text style={styles.itemsLabel}>
              📦 {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
            <Text style={styles.orderTotal}>${(order.total || 0).toFixed(2)}</Text>
          </View>

          {order.discountAmount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>🎉 Saved ${order.discountAmount.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.orderFooter}>
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelOrder(order.orderId)}
              >
                <Text style={styles.cancelButtonText}>Cancel Order !</Text>
              </TouchableOpacity>
            )}

            {order.status === 'delivered' && (
              <TouchableOpacity
                style={styles.reorderButton}
                onPress={() => reorderItems(order)}
              >
                <Text style={styles.reorderButtonText}>🔄 Buy Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Hero Section */}
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
            <Text style={styles.heroHeading}>🌿 Your Plant Journey</Text>
            <Text style={styles.heroSlogan}>Growing Greener, One Order at a Time</Text>
            <Text style={styles.heroParagraph}>
              Track your plant babies from our nursery to your doorstep. 
              Every order helps us plant a tree and create a greener tomorrow.
            </Text>
          </Animated.View>

          {orders.length === 0 ? (
            <ScrollView contentContainerStyle={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>🌱</Text>
              </View>
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptyMessage}>
                Your plant journey starts here! Place your first order and watch your green collection grow.
              </Text>
              <TouchableOpacity style={styles.shopButton} onPress={navigateToHome}>
                <Text style={styles.shopButtonText}>🛍️ Start Shopping</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ordersContainer}
            >
              {orders.map((order) => (
                <View key={order.orderId}>
                  {renderOrderCard(order)}
                </View>
              ))}
              
              {/* Thank You Message */}
              <View style={styles.thankYouContainer}>
                <Text style={styles.thankYouText}>💚 Thank you for choosing MidGreen!</Text>
                <Text style={styles.thankYouSubtext}>
                  Every purchase supports sustainable farming and plants a tree in your name.
                </Text>
              </View>
              
              <View style={styles.bottomPadding} />
            </ScrollView>
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

          {/* Rest of the modals - keep the same as before */}
          {/* Order Detail Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={orderDetailModalVisible}
            onRequestClose={() => setOrderDetailModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <TouchableOpacity
                    onPress={() => setOrderDetailModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selectedOrder && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Order Info */}
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Order Number</Text>
                        <Text style={styles.detailValue}>#{selectedOrder.orderId}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Order Date</Text>
                        <Text style={styles.detailValue}>{formatDate(selectedOrder.date)}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                          <Text style={styles.modalStatusText}>{getStatusText(selectedOrder.status)}</Text>
                        </View>
                      </View>
                      
                      {selectedOrder.couponApplied && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Coupon Applied</Text>
                          <Text style={styles.detailValue}>{selectedOrder.couponApplied}</Text>
                        </View>
                      )}
                    </View>

                    {/* Items */}
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Order Items</Text>
                      {selectedOrder.items?.map((item, index) => (
                        <View key={index} style={styles.modalOrderItem}>
                          <View style={styles.modalItemInfo}>
                            <Text style={styles.modalItemName}>{item.name}</Text>
                            <Text style={styles.modalItemQuantity}>Qty: {item.quantity}</Text>
                          </View>
                          <Text style={styles.modalItemPrice}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Payment Summary */}
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Payment Summary</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${(selectedOrder.subtotal || 0).toFixed(2)}</Text>
                      </View>
                      {selectedOrder.discountAmount > 0 && (
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Discount</Text>
                          <Text style={[styles.summaryValue, styles.discountText]}>-${selectedOrder.discountAmount.toFixed(2)}</Text>
                        </View>
                      )}
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax (10%)</Text>
                        <Text style={styles.summaryValue}>${(selectedOrder.tax || 0).toFixed(2)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>
                          {selectedOrder.shipping === 0 ? 'Free' : `$${(selectedOrder.shipping || 0).toFixed(2)}`}
                        </Text>
                      </View>
                      <View style={[styles.summaryRow, styles.totalSummaryRow]}>
                        <Text style={styles.totalSummaryLabel}>Total</Text>
                        <Text style={styles.totalSummaryValue}>${(selectedOrder.total || 0).toFixed(2)}</Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={editOrder}
                      >
                        <Text style={styles.editButtonText}>✏️ Edit Order</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.checkoutModalButton}
                        onPress={proceedToCheckout}
                      >
                        <Text style={styles.checkoutModalButtonText}>🛒 Proceed to Checkout</Text>
                      </TouchableOpacity>

                      {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                        <TouchableOpacity
                          style={styles.modalCancelButton}
                          onPress={() => {
                            cancelOrder(selectedOrder.orderId);
                            setOrderDetailModalVisible(false);
                          }}
                        >
                          <Text style={styles.modalCancelButtonText}>Cancel Order</Text>
                        </TouchableOpacity>
                      )}

                      {selectedOrder.status === 'delivered' && (
                        <TouchableOpacity
                          style={styles.modalReorderButton}
                          onPress={() => {
                            reorderItems(selectedOrder);
                            setOrderDetailModalVisible(false);
                          }}
                        >
                          <Text style={styles.modalReorderButtonText}>🔄 Buy Again</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </ScrollView>
                )}
              </View>
            </View>
          </Modal>

          {/* Edit Order Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={editModalVisible}
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, styles.editModalContent]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Order</Text>
                  <TouchableOpacity
                    onPress={() => setEditModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {editedOrder && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Order Status */}
                    <View style={styles.editSection}>
                      <Text style={styles.editLabel}>Order Status</Text>
                      <View style={styles.statusOptions}>
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                          <TouchableOpacity
                            key={status}
                            style={[
                              styles.statusOption,
                              editedOrder.status === status && styles.activeStatusOption,
                              { backgroundColor: editedOrder.status === status ? getStatusColor(status) : '#f8f9fa' }
                            ]}
                            onPress={() => setEditedOrder({ ...editedOrder, status })}
                          >
                            <Text style={[
                              styles.statusOptionText,
                              editedOrder.status === status && styles.activeStatusOptionText
                            ]}>
                              {getStatusIcon(status)} {getStatusText(status)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Order Items */}
                    <View style={styles.editSection}>
                      <Text style={styles.editLabel}>Order Items</Text>
                      {editedOrder.items?.map((item, index) => (
                        <View key={index} style={styles.editItemCard}>
                          <View style={styles.editItemInfo}>
                            <Text style={styles.editItemName}>{item.name}</Text>
                            <Text style={styles.editItemPrice}>${item.price.toFixed(2)}</Text>
                          </View>
                          <View style={styles.editItemControls}>
                            <TouchableOpacity
                              style={styles.quantityBtn}
                              onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                            >
                              <Text style={styles.quantityBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.editItemQuantity}>{item.quantity}</Text>
                            <TouchableOpacity
                              style={styles.quantityBtn}
                              onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Text style={styles.quantityBtnText}>+</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.removeItemBtn}
                              onPress={() => removeItemFromOrder(item.id)}
                            >
                              <Text style={styles.removeItemBtnText}>🗑️</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                      
                      <TouchableOpacity
                        style={styles.addItemButton}
                        onPress={addItemToOrder}
                      >
                        <Text style={styles.addItemButtonText}>+ Add Plant</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Coupon Code Section */}
                    <View style={styles.editSection}>
                      <Text style={styles.editLabel}>Coupon Code</Text>
                      <View style={styles.couponContainer}>
                        <TextInput
                          style={styles.couponInput}
                          placeholder="Enter coupon code"
                          placeholderTextColor="#95a5a6"
                          value={couponCode}
                          onChangeText={setCouponCode}
                          editable={!appliedDiscount}
                        />
                        <TouchableOpacity
                          style={[styles.applyButton, appliedDiscount && styles.disabledButton]}
                          onPress={applyCoupon}
                          disabled={appliedDiscount}
                        >
                          <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                      </View>
                      {appliedDiscount && (
                        <View style={styles.appliedCouponBadge}>
                          <Text style={styles.appliedCouponText}>
                            ✓ Coupon applied! {discountPercent}% off
                          </Text>
                        </View>
                      )}
                      <View style={styles.availableCoupons}>
                        <Text style={styles.availableCouponsTitle}>Available Coupons:</Text>
                        <View style={styles.couponList}>
                          {Object.keys(coupons).map((code) => (
                            <TouchableOpacity
                              key={code}
                              style={styles.couponChip}
                              onPress={() => setCouponCode(code)}
                            >
                              <Text style={styles.couponChipText}>{code}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>

                    {/* Order Summary Preview */}
                    <View style={styles.editSection}>
                      <Text style={styles.editLabel}>Order Summary</Text>
                      <View style={styles.previewSummary}>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Subtotal</Text>
                          <Text style={styles.previewValue}>${editedOrder.subtotal?.toFixed(2) || '0.00'}</Text>
                        </View>
                        {appliedDiscount && discountPercent > 0 && (
                          <View style={styles.previewRow}>
                            <Text style={styles.previewLabel}>Discount ({discountPercent}%)</Text>
                            <Text style={[styles.previewValue, styles.discountPreviewValue]}>
                              -${((editedOrder.subtotal || 0) * discountPercent / 100).toFixed(2)}
                            </Text>
                          </View>
                        )}
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Tax (10%)</Text>
                          <Text style={styles.previewValue}>${editedOrder.tax?.toFixed(2) || '0.00'}</Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Shipping</Text>
                          <Text style={styles.previewValue}>
                            {editedOrder.shipping === 0 ? 'Free' : `$${editedOrder.shipping?.toFixed(2) || '0.00'}`}
                          </Text>
                        </View>
                        <View style={[styles.previewRow, styles.previewTotalRow]}>
                          <Text style={styles.previewTotalLabel}>Total</Text>
                          <Text style={styles.previewTotalValue}>${editedOrder.total?.toFixed(2) || '0.00'}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={styles.saveEditButton}
                        onPress={saveEditedOrder}
                      >
                        <Text style={styles.saveEditButtonText}>💾 Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
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
  // ... (keep all your existing styles from before)
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 25,
    paddingVertical: 25,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSlogan: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  heroParagraph: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.95,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 10,
    marginRight: 4,
    color: '#fff',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  orderItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemsLabel: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  discountBadge: {
    backgroundColor: '#d5f4e6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  discountBadgeText: {
    color: '#2ecc71',
    fontSize: 11,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 5,
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontSize: 13,
    fontWeight: '500',
  },
  reorderButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 5,
  },
  reorderButtonText: {
    color: '#2ecc71',
    fontSize: 13,
    fontWeight: '500',
  },
  deleteAction: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 15,
    marginBottom: 15,
    marginLeft: 10,
  },
  deleteActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  thankYouContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d5f5e3',
  },
  thankYouText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
  },
  thankYouSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 18,
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
  editModalContent: {
    width: '95%',
    maxHeight: '85%',
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
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#7f8c8d',
  },
  detailSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  discountText: {
    color: '#e74c3c',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  modalOrderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  modalItemQuantity: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  totalSummaryRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    marginTop: 5,
  },
  totalSummaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalSummaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutModalButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalCancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalReorderButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalReorderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  statusOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeStatusOption: {
    borderColor: 'transparent',
  },
  statusOptionText: {
    fontSize: 13,
    color: '#2c3e50',
  },
  activeStatusOptionText: {
    color: '#fff',
  },
  editItemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  editItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  editItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  editItemPrice: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  editItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  editItemQuantity: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 15,
    color: '#2c3e50',
  },
  removeItemBtn: {
    marginLeft: 10,
    padding: 5,
  },
  removeItemBtnText: {
    fontSize: 18,
  },
  addItemButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addItemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  couponContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  appliedCouponBadge: {
    backgroundColor: '#d5f4e6',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  appliedCouponText: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  availableCoupons: {
    marginTop: 10,
  },
  availableCouponsTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  couponList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  couponChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  couponChipText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  previewSummary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  previewValue: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '500',
  },
  discountPreviewValue: {
    color: '#e74c3c',
  },
  previewTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 5,
  },
  previewTotalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  previewTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  editActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 15,
  },
  saveEditButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveEditButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default OrdersPage;