import { useRouter } from 'expo-router';
import { useState } from 'react';
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
} from 'react-native';
import { supabase } from '../../lib/supabase';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation functions (from working login page)
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    if (!email.trim()) {
      return { isValid: false, message: 'Please enter your email address' };
    }

    if (!validateEmail(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    if (!password) {
      return { isValid: false, message: 'Please enter your password' };
    }

    return { isValid: true, message: '' };
  };

  // Enhanced Error Handling for Login (from working login page)
  const handleAuthError = (error) => {
    const errorMessage = error.message;

    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    } else if (errorMessage.includes('Email not confirmed')) {
      return 'Please confirm your email address before logging in. Check your inbox for the confirmation link.';
    } else if (errorMessage.includes('Email rate limit exceeded')) {
      return 'Too many attempts. Please try again in a few minutes.';
    } else if (errorMessage.includes('User not found')) {
      return 'No account found with this email address. Please sign up first.';
    } else {
      return errorMessage || 'An unexpected error occurred. Please try again.';
    }
  };

  // Resend verification email (from working login page)
  const resendVerificationEmail = async (userEmail) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) {
        Alert.alert('Error', 'Failed to resend verification email. Please try again.');
      } else {
        Alert.alert('Success', 'Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Resend email error:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setEmail('');
    setPassword('');
  };

  // Login Function (from working login page)
  const handleLogin = async () => {
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        const userFriendlyError = handleAuthError(error);
        Alert.alert('Login Error', userFriendlyError);
        return;
      }

      if (data.user && data.session) {
        console.log('Login successful!');
        
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          Alert.alert(
            'Email Not Verified',
            'Please verify your email address before logging in. Check your inbox for the verification link.',
            [
              {
                text: 'Resend Verification',
                onPress: () => resendVerificationEmail(data.user.email)
              },
              {
                text: 'OK',
                style: 'cancel'
              }
            ]
          );
          return;
        }

        // Successfully logged in with verified email
        Alert.alert(
          'Success!',
          'You have successfully logged in.',
          [
            {
              text: 'Continue',
              onPress: () => {
                resetForm();
                // Navigate to Home Page
                router.replace('/(tabs)/Homepage');
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('Unexpected login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password (from working login page)
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'myapp://auth/reset-password',
      });

      if (error) {
        Alert.alert('Error', 'Failed to send password reset email. Please try again.');
      } else {
        Alert.alert('Success', 'Password reset email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    router.push('/(auth)/signup');
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
        <Text style={styles.welcomeText}>Welcome Back! 👋</Text>
        <Text style={styles.subText}>Sign in to continue your green journey</Text>
        
        <View style={styles.formContainer}>
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
                placeholder="Enter your password"
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
          
          <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton, (!email || !password) && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading || !email || !password}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUpRedirect}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
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
  forgotPassword: {
    textAlign: 'right',
    color: '#2ecc71',
    fontSize: 14,
    marginBottom: 30,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 25,
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
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
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
  dividerText: {
    marginHorizontal: 10,
    color: '#95a5a6',
    fontSize: 12,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  signupLink: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
});

export default Login;