import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const { width } = Dimensions.get('window');

const CheckoutPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Payment form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadOrderDetails();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadOrderDetails = async () => {
    try {
      // Get order details from AsyncStorage or params
      const storedOrder = await AsyncStorage.getItem('currentOrder');
      if (storedOrder) {
        setOrderDetails(JSON.parse(storedOrder));
      } else if (params.orderData) {
        setOrderDetails(JSON.parse(params.orderData));
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Payment Methods
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Pay securely with your card',
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: '📱',
      description: 'Google Pay, PhonePe, Paytm',
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay when you receive',
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: '🏦',
      description: 'All major banks',
    },
  ];

  // Validate form based on payment method
  const validatePaymentForm = () => {
    if (selectedPaymentMethod === 'card') {
      if (!cardNumber || cardNumber.length < 16) {
        Alert.alert('Error', 'Please enter valid card number');
        return false;
      }
      if (!cardName) {
        Alert.alert('Error', 'Please enter card holder name');
        return false;
      }
      if (!expiryDate || expiryDate.length < 5) {
        Alert.alert('Error', 'Please enter valid expiry date (MM/YY)');
        return false;
      }
      if (!cvv || cvv.length < 3) {
        Alert.alert('Error', 'Please enter valid CVV');
        return false;
      }
    } else if (selectedPaymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        Alert.alert('Error', 'Please enter valid UPI ID');
        return false;
      }
    } else if (selectedPaymentMethod === 'cod') {
      if (!phoneNumber || phoneNumber.length < 10) {
        Alert.alert('Error', 'Please enter valid phone number');
        return false;
      }
    }
    return true;
  };

  // Process payment
  const processPayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!validatePaymentForm()) {
      return;
    }

    setPaymentLoading(true);

    // Simulate payment processing
    setTimeout(async () => {
      const order = {
        orderId: 'ORD' + Date.now(),
        ...orderDetails,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'completed',
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      try {
        // Save to orders history
        const existingOrders = await AsyncStorage.getItem('orders');
        const orders = existingOrders ? JSON.parse(existingOrders) : [];
        orders.push(order);
        await AsyncStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        await AsyncStorage.removeItem('cart');
        await AsyncStorage.removeItem('currentOrder');
        
        setOrderPlaced(true);
        setPaymentModalVisible(false);
        
        // Animate success
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.delay(2000),
        ]).start();
      } catch (error) {
        Alert.alert('Error', 'Payment failed. Please try again.');
      } finally {
        setPaymentLoading(false);
      }
    }, 2000);
  };

  // Format card number with spaces
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    const formatted = groups ? groups.join(' ') : cleaned;
    setCardNumber(formatted.slice(0, 19));
  };

  // Format expiry date
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiryDate(cleaned);
    }
  };

  // Render payment modal
  const renderPaymentModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={paymentModalVisible}
      onRequestClose={() => setPaymentModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Payment Details'}
            </Text>
            <TouchableOpacity
              onPress={() => setPaymentModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedPaymentMethod === 'card' && (
              <View style={styles.paymentForm}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.paymentInput}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#95a5a6"
                  value={cardNumber}
                  onChangeText={formatCardNumber}
                  keyboardType="numeric"
                  maxLength={19}
                />

                <Text style={styles.inputLabel}>Card Holder Name</Text>
                <TextInput
                  style={styles.paymentInput}
                  placeholder="John Doe"
                  placeholderTextColor="#95a5a6"
                  value={cardName}
                  onChangeText={setCardName}
                />

                <View style={styles.rowInputs}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TextInput
                      style={styles.paymentInput}
                      placeholder="MM/YY"
                      placeholderTextColor="#95a5a6"
                      value={expiryDate}
                      onChangeText={formatExpiryDate}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.paymentInput}
                      placeholder="123"
                      placeholderTextColor="#95a5a6"
                      value={cvv}
                      onChangeText={setCvv}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            )}

            {selectedPaymentMethod === 'upi' && (
              <View style={styles.paymentForm}>
                <Text style={styles.inputLabel}>UPI ID</Text>
                <TextInput
                  style={styles.paymentInput}
                  placeholder="username@okhdfcbank"
                  placeholderTextColor="#95a5a6"
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                />
                <View style={styles.upiApps}>
                  <Text style={styles.upiHint}>Supported: Google Pay, PhonePe, Paytm, BHIM</Text>
                </View>
              </View>
            )}

            {selectedPaymentMethod === 'cod' && (
              <View style={styles.paymentForm}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.paymentInput}
                  placeholder="9876543210"
                  placeholderTextColor="#95a5a6"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                <View style={styles.codInfo}>
                  <Text style={styles.codInfoText}>💡 Cash on Delivery available for orders under ₹50,000</Text>
                </View>
              </View>
            )}

            {selectedPaymentMethod === 'netbanking' && (
              <View style={styles.paymentForm}>
                <Text style={styles.inputLabel}>Select Bank</Text>
                <TouchableOpacity style={styles.bankOption}>
                  <Text style={styles.bankOptionText}>🏦 HDFC Bank</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bankOption}>
                  <Text style={styles.bankOptionText}>🏦 ICICI Bank</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bankOption}>
                  <Text style={styles.bankOptionText}>🏦 SBI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bankOption}>
                  <Text style={styles.bankOptionText}>🏦 Axis Bank</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.payButton}
              onPress={processPayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payButtonText}>
                  Pay ${orderDetails?.total?.toFixed(2) || '0.00'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </SafeAreaView>
    );
  }

  if (orderPlaced) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          
          <ScrollView contentContainerStyle={styles.successContainer}>
            <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
              <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>🎉</Text>
              </View>
              
              <Text style={styles.successTitle}>Order Placed Successfully!</Text>
              <Text style={styles.successMessage}>
                Thank you for shopping with MidGreen. Your order has been confirmed and will be delivered within 5-7 business days.
              </Text>
              
              <View style={styles.orderSummaryCard}>
                <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                <View style={styles.orderSummaryRow}>
                  <Text style={styles.orderSummaryLabel}>Order ID</Text>
                  <Text style={styles.orderSummaryValue}>#{orderDetails?.orderId?.slice(-12) || 'ORD' + Date.now()}</Text>
                </View>
                <View style={styles.orderSummaryRow}>
                  <Text style={styles.orderSummaryLabel}>Total Amount</Text>
                  <Text style={styles.orderSummaryValue}>${orderDetails?.total?.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={styles.orderSummaryRow}>
                  <Text style={styles.orderSummaryLabel}>Payment Method</Text>
                  <Text style={styles.orderSummaryValue}>
                    {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Not specified'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.trackOrderButton}
                onPress={() => router.push('/(tabs)/orders')}
              >
                <Text style={styles.trackOrderButtonText}>📦 Track Your Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.continueShoppingButton}
                onPress={() => router.push('/(tabs)/home')}
              >
                <Text style={styles.continueShoppingButtonText}>🌱 Continue Shopping</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
            <Text style={styles.heroHeading}>🌱 Complete Your Order</Text>
            <Text style={styles.heroSlogan}>One Step Closer to Greener Living</Text>
            <Text style={styles.heroParagraph}>
              Review your order and choose your preferred payment method. 
              Every purchase helps us plant a tree and create a sustainable future.
            </Text>
          </Animated.View>

          {/* Order Summary */}
          {orderDetails && (
            <View style={styles.orderSummary}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              
              <View style={styles.itemsList}>
                {orderDetails.items?.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.orderItemName}>{item.name}</Text>
                      <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.orderItemPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.divider} />

              <View style={styles.priceDetails}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Subtotal</Text>
                  <Text style={styles.priceValue}>${orderDetails.subtotal?.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Tax (10%)</Text>
                  <Text style={styles.priceValue}>${orderDetails.tax?.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Shipping</Text>
                  <Text style={styles.priceValue}>
                    {orderDetails.shipping === 0 ? 'Free' : `$${orderDetails.shipping?.toFixed(2)}`}
                  </Text>
                </View>
                <View style={[styles.priceRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${orderDetails.total?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Payment Methods */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodLeft}>
                  <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                  <View>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                    <Text style={styles.paymentMethodDesc}>{method.description}</Text>
                  </View>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPaymentMethod === method.id && styles.radioButtonSelected,
                ]}>
                  {selectedPaymentMethod === method.id && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Thank You Note */}
          <View style={styles.thankYouNote}>
            <Text style={styles.thankYouNoteTitle}>💚 Thank You for Choosing MidGreen!</Text>
            <Text style={styles.thankYouNoteText}>
              By shopping with us, you're supporting sustainable farming practices and helping us plant trees across the globe.
            </Text>
          </View>

          {/* Place Order Button */}
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={() => setPaymentModalVisible(true)}
          >
            <Text style={styles.placeOrderButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Payment Modal */}
        {renderPaymentModal()}
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
  // Order Summary
  orderSummary: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  itemsList: {
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  priceDetails: {
    marginTop: 5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  priceValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  // Payment Methods
  paymentSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedPaymentMethod: {
    borderColor: '#2ecc71',
    backgroundColor: '#f0fdf4',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#2ecc71',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ecc71',
  },
  // Thank You Note
  thankYouNote: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#d5f5e3',
  },
  thankYouNoteTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
    textAlign: 'center',
  },
  thankYouNoteText: {
    fontSize: 13,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Place Order Button
  placeOrderButton: {
    backgroundColor: '#2ecc71',
    marginHorizontal: 15,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
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
    fontSize: 18,
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
  paymentForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  paymentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  upiApps: {
    marginTop: 10,
  },
  upiHint: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  codInfo: {
    marginTop: 10,
  },
  codInfoText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  bankOption: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  bankOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  payButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Success Screen Styles
  successContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  successContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  successIcon: {
    fontSize: 50,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  orderSummaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    width: '100%',
    marginBottom: 20,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderSummaryLabel: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  orderSummaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
  },
  trackOrderButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueShoppingButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  continueShoppingButtonText: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutPage;