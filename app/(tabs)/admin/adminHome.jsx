import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const AdminHome = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sample admin stats
  const stats = [
    { id: '1', title: 'Total Plants', value: '156', icon: '🌱', color: '#2ecc71' },
    { id: '2', title: 'Total Orders', value: '1,234', icon: '📦', color: '#2ecc71' },
    { id: '3', title: 'Total Users', value: '5,678', icon: '👥', color: '#2ecc71' },
    { id: '4', title: 'Revenue', value: '$45,678', icon: '💰', color: '#2ecc71' },
  ];

  const recentOrders = [
    { id: '1', customer: 'John Doe', plant: 'Monstera', amount: '$29.99', status: 'Delivered' },
    { id: '2', customer: 'Jane Smith', plant: 'Snake Plant', amount: '$24.99', status: 'Processing' },
    { id: '3', customer: 'Mike Johnson', plant: 'Peace Lily', amount: '$19.99', status: 'Shipped' },
  ];

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

  const renderStatCard = ({ item }) => (
    <View style={[styles.statCard, { borderTopColor: item.color }]}>
      <Text style={styles.statIcon}>{item.icon}</Text>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2ecc71" />
      
      {/* Header with Green Theme */}
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

      {/* Navigation Tabs - Green Theme */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabIcon, activeTab === 'dashboard' && styles.activeTabIcon]}>📊</Text>
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'plants' && styles.activeTab]}
          onPress={() => setActiveTab('plants')}
        >
          <Text style={[styles.tabIcon, activeTab === 'plants' && styles.activeTabIcon]}>🌿</Text>
          <Text style={[styles.tabText, activeTab === 'plants' && styles.activeTabText]}>
            Plants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabIcon, activeTab === 'orders' && styles.activeTabIcon]}>📋</Text>
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'dashboard' && (
          <View style={styles.content}>
            {/* Stats Grid */}
            <FlatList
              data={stats}
              renderItem={renderStatCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.statsGrid}
            />

            {/* Recent Orders */}
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

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>⚡</Text>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={styles.actionIconCircle}>
                    <Text style={styles.actionIcon}>➕</Text>
                  </View>
                  <Text style={styles.actionText}>Add Plant</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={styles.actionIconCircle}>
                    <Text style={styles.actionIcon}>✏️</Text>
                  </View>
                  <Text style={styles.actionText}>Edit Plant</Text>
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
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderIcon}>🌿</Text>
              <Text style={styles.placeholderText}>Plant Management Module</Text>
              <Text style={styles.placeholderSubtext}>Coming Soon with full CRUD operations</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add New Plant</Text>
            </TouchableOpacity>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
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
  addButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AdminHome;