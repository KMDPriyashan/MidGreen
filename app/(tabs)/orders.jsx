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
    router.push('/(tabs)/home');
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
    setOrderDetailModalVisible(true);
  };

  // Edit order
  const editOrder = () => {
    setEditedOrder({ ...selectedOrder });
    setEditModalVisible(true);
    setOrderDetailModalVisible(false);
  };

  // Save edited order
  const saveEditedOrder = async () => {
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
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

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
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

  // Get status text
  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
  const proceedToCheckout = () => {
    setOrderDetailModalVisible(false);
    router.push('/(tabs)/cart');
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
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
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
                <Text style={styles.orderId}>#{order.orderId.slice(-8)}</Text>
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
            <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
          </View>

          <View style={styles.orderFooter}>
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelOrder(order.orderId)}
              >
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
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
            // Empty Orders View
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
                    </View>

                    {/* Items */}
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Order Items</Text>
                      {selectedOrder.items.map((item, index) => (
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
                        <Text style={styles.summaryValue}>${selectedOrder.subtotal.toFixed(2)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax (10%)</Text>
                        <Text style={styles.summaryValue}>${selectedOrder.tax.toFixed(2)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>
                          {selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping.toFixed(2)}`}
                        </Text>
                      </View>
                      <View style={[styles.summaryRow, styles.totalSummaryRow]}>
                        <Text style={styles.totalSummaryLabel}>Total</Text>
                        <Text style={styles.totalSummaryValue}>${selectedOrder.total.toFixed(2)}</Text>
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
  // Hero Section
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
    overflow: 'hidden',
  },
  editModalContent: {
    width: '90%',
    maxHeight: '60%',
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
  // Edit Modal Styles
  editSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statusOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
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
  editActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  saveEditButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveEditButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrdersPage;