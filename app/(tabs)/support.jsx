import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

const SupportPage = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('faq');
  const scrollViewRef = useRef(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // State for FAQ accordion
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // WhatsApp contact function
  const contactWhatsApp = async () => {
    const phoneNumber = '94724719902'; // WhatsApp number without '+' symbol
    const message = encodeURIComponent('Hello! I need help with my MidGreen order. Can you please assist me?');
    const url = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // If WhatsApp is not installed, open web version
        const webUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert(
        'WhatsApp Not Available',
        'Please install WhatsApp to contact support, or email us at support@midgreen.com',
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Send Email', 
            onPress: () => Linking.openURL('mailto:support@midgreen.com')
          }
        ]
      );
    }
  };

  // FAQ Data
  const faqs = [
    {
      id: 1,
      question: 'How do I care for my new plants?',
      answer: 'Each plant comes with specific care instructions. Generally, most indoor plants need bright indirect light, water when the top soil feels dry, and regular fertilizing during growing season. Check our plant detail page for specific care guides.',
    },
    {
      id: 2,
      question: 'Are your plants pet-friendly?',
      answer: 'Some plants are pet-friendly (like Orchids, African Violets, Lavender) while others can be toxic to pets. Each plant page includes "Pet friendly?" information in the special notes section. Please check before purchasing if you have pets.',
    },
    {
      id: 3,
      question: 'How often should I water my plants?',
      answer: 'Watering frequency depends on the plant type, size, pot, and environment. Succulents need water every 2-3 weeks, while tropical plants may need water weekly. Always check if the top 1-2 inches of soil are dry before watering.',
    },
    {
      id: 4,
      question: 'Do you offer plant delivery?',
      answer: 'Yes! We deliver plants across the country with careful packaging to ensure your plants arrive healthy. Delivery typically takes 5-7 business days.',
    },
    {
      id: 5,
      question: 'What if my plant arrives damaged?',
      answer: 'We take great care in packaging, but if your plant arrives damaged, please contact us within 48 hours with photos. We will arrange a replacement or refund.',
    },
    {
      id: 6,
      question: 'Can I return a plant?',
      answer: 'Plants are living products. We accept returns within 7 days of delivery if the plant is in its original condition. Some restrictions apply - please see our Returns Policy for details.',
    },
  ];

  // Toggle FAQ accordion
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Navigation sections
  const sections = [
    { id: 'faq', title: 'FAQ', icon: '❓', fullTitle: 'Frequently Asked Questions' },
    { id: 'shipping', title: 'Shipping', icon: '📦', fullTitle: 'Shipping Information' },
    { id: 'returns', title: 'Returns', icon: '🔄', fullTitle: 'Returns Policy' },
    { id: 'terms', title: 'Terms', icon: '📜', fullTitle: 'Terms & Conditions' },
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
  };

  // Render FAQ Section
  const renderFaqSection = () => (
    <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>❓</Text>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      </View>
      <Text style={styles.sectionDescription}>
        Find answers to common questions about plant care, delivery, and more.
      </Text>
      
      {faqs.map((faq) => (
        <View key={faq.id} style={styles.faqItem}>
          <TouchableOpacity 
            style={styles.faqQuestion}
            onPress={() => toggleFaq(faq.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.faqQuestionText}>{faq.question}</Text>
            <Text style={styles.faqIcon}>{expandedFaq === faq.id ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expandedFaq === faq.id && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>{faq.answer}</Text>
            </View>
          )}
        </View>
      ))}
    </Animated.View>
  );

  // Render Shipping Info Section
  const renderShippingSection = () => (
    <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>🚚</Text>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📦 Delivery Options</Text>
        <Text style={styles.infoText}>
          • Standard Delivery: 5-7 business days - $5.99
        </Text>
        <Text style={styles.infoText}>
          • Express Delivery: 2-3 business days - $12.99
        </Text>
        <Text style={styles.infoText}>
          • Free Standard Delivery on orders over $50
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>🌱 Plant Packaging</Text>
        <Text style={styles.infoText}>
          All plants are carefully packaged with eco-friendly materials to ensure 
          they arrive healthy and undamaged. We use biodegradable pots and recyclable 
          packaging materials.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📍 Delivery Areas</Text>
        <Text style={styles.infoText}>
          We deliver nationwide to all major cities and towns. Remote areas may 
          require additional delivery time. Contact our support team for specific 
          location inquiries.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📋 Order Tracking</Text>
        <Text style={styles.infoText}>
          Once your order is shipped, you will receive a tracking number via email 
          and SMS. You can track your order status in the "Orders" section of your 
          account.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>⚠️ Important Notes</Text>
        <Text style={styles.infoText}>
          • Plants may show signs of stress after shipping - this is normal
        </Text>
        <Text style={styles.infoText}>
          • Allow 1-2 weeks for plants to acclimate to their new environment
        </Text>
        <Text style={styles.infoText}>
          • During extreme weather, we may delay shipping to protect plant health
        </Text>
        <Text style={styles.infoText}>
          • Signature may be required for delivery of high-value orders
        </Text>
      </View>
    </Animated.View>
  );

  // Render Returns Policy Section
  const renderReturnsSection = () => (
    <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>🔄</Text>
        <Text style={styles.sectionTitle}>Returns Policy</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>✅ 30-Day Satisfaction Guarantee</Text>
        <Text style={styles.infoText}>
          We want you to be completely satisfied with your purchase. If you're not 
          happy with your plant within 30 days of delivery, we'll help you return it 
          for a full refund or exchange.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>🌿 Return Conditions</Text>
        <Text style={styles.infoText}>
          • Plants must be returned within 30 days of delivery
        </Text>
        <Text style={styles.infoText}>
          • Plants must be in their original condition (not overwatered or damaged)
        </Text>
        <Text style={styles.infoText}>
          • Original packaging is preferred but not required
        </Text>
        <Text style={styles.infoText}>
          • Customer is responsible for return shipping costs unless the item was 
            damaged during delivery
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>💔 Damaged or Dead on Arrival</Text>
        <Text style={styles.infoText}>
          If your plant arrives damaged or dead, please contact us within 48 hours 
          with photos of the plant and packaging. We will:
        </Text>
        <Text style={styles.infoText}>• Send a replacement immediately</Text>
        <Text style={styles.infoText}>• Issue a full refund</Text>
        <Text style={styles.infoText}>• Provide store credit + 10% bonus</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>🔄 Exchange Process</Text>
        <Text style={styles.infoText}>
          1. Contact our support team with your order number
        </Text>
        <Text style={styles.infoText}>
          2. Return the original plant (if requested)
        </Text>
        <Text style={styles.infoText}>
          3. Choose your replacement plant
        </Text>
        <Text style={styles.infoText}>
          4. We'll ship your new plant within 2-3 business days
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>⏰ Refund Processing Time</Text>
        <Text style={styles.infoText}>
          Once we receive your return, refunds are processed within 5-7 business days. 
          The refund will be credited to your original payment method.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>🚫 Non-Returnable Items</Text>
        <Text style={styles.infoText}>
          • Clearance or sale items (marked "Final Sale")
        </Text>
        <Text style={styles.infoText}>
          • Gift cards
        </Text>
        <Text style={styles.infoText}>
          • Plants damaged due to customer neglect
        </Text>
      </View>
    </Animated.View>
  );

  // Render Terms & Conditions Section
  const renderTermsSection = () => (
    <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>📜</Text>
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📝 Account Registration</Text>
        <Text style={styles.infoText}>
          To place an order, you must register an account with accurate and complete 
          information. You are responsible for maintaining the confidentiality of 
          your account credentials.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>🛒 Order Acceptance</Text>
        <Text style={styles.infoText}>
          We reserve the right to refuse or cancel any order for reasons including 
          but not limited to: product availability, errors in pricing, or suspected 
          fraudulent activity.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>💰 Pricing</Text>
        <Text style={styles.infoText}>
          All prices are in US Dollars ($) and are subject to change without notice. 
          We strive to ensure all prices are accurate, but errors may occur. In the 
          event of a pricing error, we will notify you and give you the option to 
          proceed or cancel.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>🌱 Plant Health Guarantee</Text>
        <Text style={styles.infoText}>
          We guarantee that all plants are healthy at the time of shipping. However, 
          plant health can be affected by many factors after delivery, including 
          environment, care, and handling. Please follow our care instructions for 
          best results.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📸 Product Images</Text>
        <Text style={styles.infoText}>
          We make every effort to display accurate product images. However, actual 
          plants may vary in size, color, and shape due to natural variations. The 
          plant you receive may look slightly different from the images online.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>🔒 Privacy Policy</Text>
        <Text style={styles.infoText}>
          We respect your privacy and are committed to protecting your personal 
          information. We will never share your data with third parties without 
          your consent. See our full Privacy Policy for details.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>⚖️ Limitation of Liability</Text>
        <Text style={styles.infoText}>
          MidGreen shall not be liable for any indirect, incidental, or consequential 
          damages arising from the use of our products or services. Our total liability 
          shall not exceed the amount paid for the product.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📧 Contact Us</Text>
        <Text style={styles.infoText}>
          For any questions regarding these terms, please contact us at:
        </Text>
        <Text style={styles.infoText}>Email: support@midgreen.com</Text>
        <Text style={styles.infoText}>Phone: +1 (234) 567-890</Text>
      </View>

      <View style={styles.lastUpdated}>
        <Text style={styles.lastUpdatedText}>
          Last Updated: January 1, 2024
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support Center</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>🌿</Text>
          <Text style={styles.heroTitle}>How Can We Help You?</Text>
          <Text style={styles.heroSubtitle}>
            Find answers to your questions and learn more about our policies
          </Text>
        </View>

        {/* Tab Navigation Buttons */}
        <View style={styles.tabWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContent}
          >
            {sections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.tab,
                  activeSection === section.id && styles.activeTab
                ]}
                onPress={() => scrollToSection(section.id)}
              >
                <Text style={styles.tabIcon}>{section.icon}</Text>
                <Text style={[
                  styles.tabText,
                  activeSection === section.id && styles.activeTabText
                ]}>
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content Sections */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {activeSection === 'faq' && renderFaqSection()}
          {activeSection === 'shipping' && renderShippingSection()}
          {activeSection === 'returns' && renderReturnsSection()}
          {activeSection === 'terms' && renderTermsSection()}
          
          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Contact Support Button - Opens WhatsApp */}
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={contactWhatsApp}
        >
          <Text style={styles.contactButtonText}>💬 Still need help? Chat with us on WhatsApp</Text>
        </TouchableOpacity>
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
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.95,
  },
  tabWrapper: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabScrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeTab: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    lineHeight: 20,
  },
  faqItem: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  faqIcon: {
    fontSize: 12,
    color: '#2ecc71',
    marginLeft: 10,
  },
  faqAnswer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 22,
    marginBottom: 6,
  },
  lastUpdated: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  contactButton: {
    backgroundColor: '#25D366', // WhatsApp green color
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});

export default SupportPage;