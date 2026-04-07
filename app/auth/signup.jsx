import { useRouter } from 'expo-router';
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from '../../lib/supabase';

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Add ref to track submission timeout
  const submissionTimeout = useRef(null);

  const handleSignup = async () => {
    // Prevent multiple submissions
    if (loading) return;

    // Basic validation
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          }
        }
      });

      if (error) {
        // Handle different error types
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          Alert.alert(
            'Rate Limit Notice',
            'Due to high traffic, please wait a moment before trying again.\n\n💡 Tip: You can try signing up with a different email address or wait 5-10 minutes.',
            [
              { text: 'Try Different Email', onPress: () => handleUseDifferentEmail() },
              { text: 'OK', style: 'cancel' }
            ]
          );
        } else if (error.message.includes('User already registered')) {
          Alert.alert(
            'Account Exists',
            'This email is already registered. Would you like to login instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Go to Login', onPress: () => router.replace('/(auth)/login') }
            ]
          );
        } else if (error.message.includes('weak password')) {
          Alert.alert('Weak Password', 'Please use a stronger password with at least 6 characters including letters and numbers.');
        } else {
          Alert.alert('Signup Error', error.message);
        }
        return;
      }

      if (data.user) {
        // Check if user already exists but not confirmed
        if (data.user.identities && data.user.identities.length === 0) {
          Alert.alert(
            'Account Already Exists',
            'An account with this email already exists but is not verified. Please check your email for verification link.',
            [
              { text: 'Resend Email', onPress: () => resendConfirmationEmail() },
              { text: 'Go to Login', onPress: () => router.replace('/(auth)/login') }
            ]
          );
        } else {
          // Successful signup
          Alert.alert(
            'Success! 🎉', 
            'Account created successfully! Please check your email for verification before logging in.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Clear form fields for next user
                  setFullName('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  // Navigate to login page
                  router.replace('/auth/login');
                }
              }
            ]
          );
        }
      }

    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please check your internet connection and try again.');
      console.error('Signup error:', error);
    } finally {
      // Clear any existing timeout
      if (submissionTimeout.current) {
        clearTimeout(submissionTimeout.current);
      }
      
      // Set timeout to prevent immediate re-submission
      submissionTimeout.current = setTimeout(() => {
        setLoading(false);
        submissionTimeout.current = null;
      }, 3000);
    }
  };

  const resendConfirmationEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      
      if (error) throw error;
      
      Alert.alert('Email Sent', 'Verification email has been resent. Please check your inbox.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/(auth)/login');
  };

  const handleUseDifferentEmail = () => {
    setEmail('');
    setFullName('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/Logo-name.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>Create Account 🌱</Text>
        <Text style={styles.subText}>Join our green community today!</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#95a5a6"
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#95a5a6"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Create a password (min. 6 characters)"
                placeholderTextColor="#95a5a6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm your password"
                placeholderTextColor="#95a5a6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.signupButton, loading && styles.disabledButton]} 
            onPress={handleSignup}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Alternative options when rate limited */}
          <View style={styles.alternativeOptions}>
            <TouchableOpacity onPress={handleUseDifferentEmail}>
              <Text style={styles.alternativeText}>Use Different Email</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLoginRedirect}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Help text for multiple signups */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              🌟 Multiple users can sign up with different emails
            </Text>
            <Text style={styles.helpSubText}>
              Each user needs a unique email address to create an account.
            </Text>
            <View style={styles.dividerSmall} />
            <Text style={styles.helpText}>
              💡 Tips for smooth signup:
            </Text>
            <Text style={styles.helpListItem}>• Use a valid email address (e.g., name@example.com)</Text>
            <Text style={styles.helpListItem}>• Password must be at least 6 characters</Text>
            <Text style={styles.helpListItem}>• Check your spam folder for verification email</Text>
            <Text style={styles.helpListItem}>• If rate limited, wait 5-10 minutes</Text>
            <Text style={styles.helpListItem}>• Each email can only be used once</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  eyeText: {
    fontSize: 20,
  },
  signupButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  alternativeOptions: {
    alignItems: 'center',
    marginBottom: 20,
  },
  alternativeText: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 18,
  },
  termsLink: {
    color: '#2ecc71',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerSmall: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#95a5a6',
    fontSize: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  loginLink: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  helpContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  helpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  helpSubText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
    lineHeight: 18,
  },
  helpListItem: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 10,
    marginBottom: 6,
    lineHeight: 18,
  },
});

export default Signup;