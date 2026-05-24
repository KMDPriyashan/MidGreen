import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Linking,
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
  const [showThankYou, setShowThankYou] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [thankYouAnim] = useState(new Animated.Value(0));
  
  // Delivery details states
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [hasSavedDelivery, setHasSavedDelivery] = useState(false);

  // Payment form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    loadOrderDetails();
    loadSavedDeliveryDetails();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSavedDeliveryDetails = async () => {
    try {
      const savedDelivery = await AsyncStorage.getItem('deliveryDetails');
      if (savedDelivery) {
        const parsed = JSON.parse(savedDelivery);
        setDeliveryDetails(parsed);
        setHasSavedDelivery(true);
      }
    } catch (error) {
      console.error('Error loading delivery details:', error);
    }
  };

  const saveDeliveryDetails = async () => {
    // Validate delivery details before saving
    if (!deliveryDetails.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!deliveryDetails.phoneNumber.trim() || deliveryDetails.phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter valid phone number');
      return;
    }
    if (!deliveryDetails.address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return;
    }
    if (!deliveryDetails.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return;
    }

    try {
      await AsyncStorage.setItem('deliveryDetails', JSON.stringify(deliveryDetails));
      setHasSavedDelivery(true);
      setIsEditingDelivery(false);
      Alert.alert('Success', 'Delivery details saved successfully!');
    } catch (error) {
      console.error('Error saving delivery details:', error);
      Alert.alert('Error', 'Failed to save delivery details');
    }
  };

  const updateDeliveryDetail = (field, value) => {
    setDeliveryDetails(prev => ({ ...prev, [field]: value }));
  };

  const loadOrderDetails = async () => {
    try {
      let orderData = null;
      
      if (params.orderData) {
        orderData = JSON.parse(params.orderData);
      }
      else {
        const storedOrder = await AsyncStorage.getItem('currentOrder');
        if (storedOrder) {
          orderData = JSON.parse(storedOrder);
        }
      }
      
      const selectedOrder = await AsyncStorage.getItem('selectedOrderForCheckout');
      if (selectedOrder && !orderData) {
        orderData = JSON.parse(selectedOrder);
        await AsyncStorage.removeItem('selectedOrderForCheckout');
      }
      
      if (orderData && orderData.items && orderData.items.length > 0) {
        setOrderDetails(orderData);
      } else {
        Alert.alert(
          'No Order Found',
          'Please add items to your cart first.',
          [
            {
              text: 'Go to Home',
              onPress: () => router.replace('/(tabs)/Homepage')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Send WhatsApp message automatically using API
  const sendWhatsAppMessage = async (order) => {
    try {
      // Format order items for WhatsApp
      let itemsList = '';
      order.items.forEach((item, index) => {
        itemsList += `${index + 1}. *${item.name}* - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
      });

      // Format delivery address
      const fullAddress = `${deliveryDetails.address}, ${deliveryDetails.city}${deliveryDetails.postalCode ? ` - ${deliveryDetails.postalCode}` : ''}`;

      // Format the complete message
      const message = `🌿 *MIDGREEN - NEW ORDER* 🌿
━━━━━━━━━━━━━━━━━━━━━

👤 *CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━━
*Name:* ${deliveryDetails.fullName || 'Not provided'}
*Phone:* ${deliveryDetails.phoneNumber || 'Not provided'}

━━━━━━━━━━━━━━━━━━━━━
📍 *DELIVERY ADDRESS*
━━━━━━━━━━━━━━━━━━━━━
${fullAddress}

━━━━━━━━━━━━━━━━━━━━━
📋 *ORDER SUMMARY*
━━━━━━━━━━━━━━━━━━━━━
*Order ID:* ${order.orderId}
*Order Date:* ${new Date(order.orderDate).toLocaleString()}
*Payment Method:* ${order.paymentMethod?.toUpperCase() || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━
🛒 *ORDER ITEMS*
━━━━━━━━━━━━━━━━━━━━━
${itemsList}

━━━━━━━━━━━━━━━━━━━━━
💰 *PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━━━━━
*Subtotal:* $${order.subtotal?.toFixed(2) || '0.00'}
*Tax (10%):* $${order.tax?.toFixed(2) || '0.00'}
*Shipping:* ${order.shipping === 0 ? 'Free' : `$${order.shipping?.toFixed(2)}`}
${order.discountAmount > 0 ? `*Discount:* -$${order.discountAmount?.toFixed(2)}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━
*TOTAL AMOUNT:* *$${order.total?.toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━━

🚚 *Estimated Delivery:* ${new Date(order.estimatedDelivery).toLocaleDateString()}

💚 *Thank you for shopping with MidGreen!*`;

      // Encode the message for API
      const encodedMessage = encodeURIComponent(message);
      
      // WhatsApp number (without + symbol)
      const whatsappNumber = '94724719902';
      
      // Use WhatsApp URL to send message
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Check if WhatsApp is installed
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        console.log('WhatsApp opened with order details');
      } else {
        console.log('WhatsApp not installed');
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      // Don't block the order flow if WhatsApp fails
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
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return false;
    }

    // Validate delivery details if not saved
    if (!hasSavedDelivery && !isEditingDelivery) {
      if (!deliveryDetails.fullName.trim()) {
        Alert.alert('Error', 'Please enter your full name');
        return false;
      }
      if (!deliveryDetails.phoneNumber.trim() || deliveryDetails.phoneNumber.length < 10) {
        Alert.alert('Error', 'Please enter valid phone number');
        return false;
      }
      if (!deliveryDetails.address.trim()) {
        Alert.alert('Error', 'Please enter your address');
        return false;
      }
      if (!deliveryDetails.city.trim()) {
        Alert.alert('Error', 'Please enter your city');
        return false;
      }
    }

    if (selectedPaymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
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
    }
    return true;
  };

  // Show thank you message and navigate to Homepage
  const showThankYouAndNavigate = () => {
    setShowThankYou(true);
    Animated.sequence([
      Animated.timing(thankYouAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(thankYouAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowThankYou(false);
      router.replace('/(tabs)/Homepage');
    });
  };

  // Process payment and place order
  const processPayment = async () => {
    if (!validatePaymentForm()) {
      return;
    }

    setPaymentLoading(true);

    setTimeout(async () => {
      // Create order with all details including customer name
      const order = {
        orderId: 'ORD' + Date.now(),
        ...orderDetails,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'completed',
        orderDate: new Date().toISOString(),  // This is the key field for orders page
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        deliveryDetails: deliveryDetails,
        customerName: deliveryDetails.fullName || orderDetails.customerName || 'Guest User',
      };

      try {
        const existingOrders = await AsyncStorage.getItem('orders');
        const orders = existingOrders ? JSON.parse(existingOrders) : [];
        orders.push(order);
        await AsyncStorage.setItem('orders', JSON.stringify(orders));
        
        await AsyncStorage.removeItem('cart');
        await AsyncStorage.removeItem('currentOrder');
        await AsyncStorage.removeItem('selectedOrderForCheckout');
        
        setOrderPlaced(true);
        setPaymentModalVisible(false);
        
        // Send WhatsApp message with order details
        await sendWhatsAppMessage(order);
        
        showThankYouAndNavigate();
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

  // Render delivery details section
  const renderDeliverySection = () => (
    <View style={styles.deliverySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>📍</Text>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        {hasSavedDelivery && !isEditingDelivery && (
          <TouchableOpacity onPress={() => setIsEditingDelivery(true)}>
            <Text style={styles.editButton}>✏️ Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {(isEditingDelivery || !hasSavedDelivery) ? (
        <View style={styles.deliveryForm}>
          <TextInput
            style={styles.deliveryInput}
            placeholder="Full Name *"
            placeholderTextColor="#95a5a6"
            value={deliveryDetails.fullName}
            onChangeText={(text) => updateDeliveryDetail('fullName', text)}
          />
          <TextInput
            style={styles.deliveryInput}
            placeholder="Phone Number *"
            placeholderTextColor="#95a5a6"
            value={deliveryDetails.phoneNumber}
            onChangeText={(text) => updateDeliveryDetail('phoneNumber', text)}
            keyboardType="phone-pad"
            maxLength={15}
          />
          <TextInput
            style={styles.deliveryInput}
            placeholder="Address *"
            placeholderTextColor="#95a5a6"
            value={deliveryDetails.address}
            onChangeText={(text) => updateDeliveryDetail('address', text)}
            multiline
          />
          <TextInput
            style={styles.deliveryInput}
            placeholder="City *"
            placeholderTextColor="#95a5a6"
            value={deliveryDetails.city}
            onChangeText={(text) => updateDeliveryDetail('city', text)}
          />
          <TextInput
            style={styles.deliveryInput}
            placeholder="Postal Code"
            placeholderTextColor="#95a5a6"
            value={deliveryDetails.postalCode}
            onChangeText={(text) => updateDeliveryDetail('postalCode', text)}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.saveDeliveryButton} onPress={saveDeliveryDetails}>
            <Text style={styles.saveDeliveryButtonText}>Save Delivery Details</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.savedDeliveryInfo}>
          <View style={styles.deliveryInfoRow}>
            <Text style={styles.deliveryLabel}>👤 Name:</Text>
            <Text style={styles.deliveryValue}>{deliveryDetails.fullName}</Text>
          </View>
          <View style={styles.deliveryInfoRow}>
            <Text style={styles.deliveryLabel}>📞 Phone:</Text>
            <Text style={styles.deliveryValue}>{deliveryDetails.phoneNumber}</Text>
          </View>
          <View style={styles.deliveryInfoRow}>
            <Text style={styles.deliveryLabel}>📍 Address:</Text>
            <Text style={styles.deliveryValue}>{deliveryDetails.address}, {deliveryDetails.city}</Text>
          </View>
          {deliveryDetails.postalCode && (
            <View style={styles.deliveryInfoRow}>
              <Text style={styles.deliveryLabel}>📮 Postal Code:</Text>
              <Text style={styles.deliveryValue}>{deliveryDetails.postalCode}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

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
                <Text style={styles.codInfoText}>💡 Cash on Delivery available</Text>
                <Text style={styles.codInfoText}>You will pay when you receive the order</Text>
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

  if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>No Order Found</Text>
          <Text style={styles.emptyMessage}>
            Please add items to your cart or select an order to checkout.
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.replace('/(tabs)/Homepage')}
          >
            <Text style={styles.emptyButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
            <Text style={styles.heroHeading}>🌱 Complete Your Order</Text>
            <Text style={styles.heroSlogan}>One Step Closer to Greener Living</Text>
            <Text style={styles.heroParagraph}>
              Review your order and choose your preferred payment method. 
              Every purchase helps us plant a tree and create a sustainable future.
            </Text>
          </Animated.View>

          {/* Delivery Section */}
          {renderDeliverySection()}

          {/* Order Summary */}
          {orderDetails && (
            <View style={styles.orderSummary}>
              <Text style={styles.sectionTitle}>📋 Order Summary</Text>
              
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
                {orderDetails.discountAmount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Discount</Text>
                    <Text style={[styles.priceValue, styles.discountText]}>
                      -${orderDetails.discountAmount?.toFixed(2)}
                    </Text>
                  </View>
                )}
                <View style={[styles.priceRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${orderDetails.total?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Payment Methods */}
          <View style={styles.paymentSection}>
            
            
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

          {/* Delivery Information Note */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>🚚 Delivery Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>📦 Estimated Delivery: 5-7 business days</Text>
              <Text style={styles.infoText}>📍 Free shipping on orders over $50</Text>
              <Text style={styles.infoText}>🔄 Easy returns within 30 days</Text>
            </View>
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
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {renderPaymentModal()}

        <Modal
          animationType="fade"
          transparent={true}
          visible={showThankYou}
          onRequestClose={() => {}}
        >
          <View style={styles.thankYouModalContainer}>
            <Animated.View style={[styles.thankYouModalContent, { opacity: thankYouAnim, transform: [{ scale: thankYouAnim }] }]}>
              <View style={styles.thankYouIconContainer}>
                <Text style={styles.thankYouIcon}>🎉</Text>
              </View>
              <Text style={styles.thankYouTitle}>Order Placed Successfully!</Text>
              <Text style={styles.thankYouMessage}>
                Thank you for shopping with MidGreen. Your order has been confirmed and will be delivered soon.
              </Text>
              <Text style={styles.thankYouRedirect}>Redirecting to home...</Text>
            </Animated.View>
          </View>
        </Modal>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
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
  emptyButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  deliverySection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  editButton: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryForm: {
    marginTop: 10,
  },
  deliveryInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
  },
  saveDeliveryButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  saveDeliveryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedDeliveryInfo: {
    marginTop: 10,
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  deliveryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    width: 80,
  },
  deliveryValue: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  orderSummary: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    marginVertical: 12,
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
  discountText: {
    color: '#e74c3c',
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
  paymentSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    padding: 18,
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
    paddingHorizontal: 12,
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
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#2c3e50',
    marginBottom: 8,
  },
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
  codInfoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginVertical: 20,
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
    marginHorizontal: 20,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  thankYouModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  thankYouModalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    width: '85%',
    alignItems: 'center',
  },
  thankYouIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  thankYouIcon: {
    fontSize: 40,
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  thankYouMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  thankYouRedirect: {
    fontSize: 12,
    color: '#2ecc71',
    fontStyle: 'italic',
  },
});

export default CheckoutPage;