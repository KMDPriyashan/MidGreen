import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const App = () => {
  const router = useRouter();

  const handleLetGo = () => {
    router.push('/Welcome');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Home PNG Image at the top */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/home-back.png')}
          style={styles.topImage}
          resizeMode="contain"
        />
      </View>
      
      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Application Name */}
        <Image
          source={require('../assets/images/Logo-name.png')}
          style={styles.secondImage}
          resizeMode="contain"
        />
        
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Welcome to MidGreen! 🌱
          </Text>
          <Text style={styles.welcomeSubtext}>
            🌳 Your journey to a sustainable lifestyle starts here — join us in making eco-friendly choices, reducing your carbon footprint, and creating a healthier world for future generations.
          </Text>
        </View>
        
        {/* Let's Go Button */}
        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.8}
          onPress={handleLetGo}>
          <Text style={styles.buttonText}>Let's Go →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: -10,
  },
  topImage: {
    width: 300,
    height: 500,
  },
  secondImage: {
    width: 300,
    height: 300,
    marginTop: -180,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default App;