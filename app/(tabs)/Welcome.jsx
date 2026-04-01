import { useRouter } from 'expo-router';
import {
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const Welcome = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Logo Image */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/Logo-name.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      
      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Welcome Text */}
        <Text style={styles.welcomeText}>
          Welcome Back! 👋
        </Text>
        
        {/* Simple Paragraph */}
        <Text style={styles.paragraph}>
          Join our green community and start your journey towards a sustainable lifestyle. 
          Track your eco-friendly activities, reduce carbon footprint, and make a positive 
          impact on our planet Earth.
        </Text>
        
        {/* Selection Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]} 
            activeOpacity={0.8}
            onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.signupButton]} 
            activeOpacity={0.8}
            onPress={handleSignUp}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: -50,
  },
  logoImage: {
    width: 400,
    height: 400,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: -150,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#2ecc71',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2ecc71',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  signupButtonText: {
    color: '#2ecc71',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default Welcome;