import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearError } from '../../store/slices/authSlice';
import { RootState } from '../../store/types';
import { theme } from '../../constants/theme';

interface LoginScreenProps {
  navigation: any;
}

type FormData = {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  national_id: string;
  user_type: 'farmer' | 'transporter' | 'buyer' | 'government';
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    national_id: '',
    user_type: 'farmer',
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (isLogin) {
      // Login validation
      if (!formData.username || !formData.password) {
        Alert.alert('Error', 'Please enter username and password');
        return;
      }

      try {
        await dispatch(loginUser({
          identifier: formData.username,
          password: formData.password,
        })).unwrap();
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } catch (error) {
        Alert.alert('Login Error', error instanceof Error ? error.message : 'Login failed');
      }
    } else {
      // Registration validation
      if (!formData.username || !formData.email || !formData.password || !formData.full_name) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }

      try {
        await dispatch(registerUser(formData)).unwrap();
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } catch (error) {
        Alert.alert('Registration Error', error instanceof Error ? error.message : 'Registration failed');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    dispatch(clearError());
  };

  const renderLoginForm = () => (
    <View style={styles.form}>
      <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
      <Text style={styles.subtitle}>
        {isLogin 
          ? 'Sign in to access your farm dashboard' 
          : 'Join EATMS to manage your farm digitally'
        }
      </Text>

      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.full_name}
            onChangeText={(value) => handleInputChange('full_name', value)}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone (Optional)"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="National ID (Optional)"
            value={formData.national_id}
            onChangeText={(value) => handleInputChange('national_id', value)}
          />
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Account Type</Text>
            <View style={styles.buttonGroup}>
              {(['farmer', 'transporter', 'buyer'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.user_type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, user_type: type }))}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.user_type === type && styles.typeButtonTextActive,
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder={isLogin ? "Username or Email" : "Username"}
        value={formData.username}
        onChangeText={(value) => handleInputChange('username', value)}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
        <Text style={styles.toggleText}>
          {isLogin 
            ? "Don't have an account? Sign Up" 
            : 'Already have an account? Sign In'
          }
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🌾</Text>
          <Text style={styles.appName}>EATMS</Text>
          <Text style={styles.tagline}>
            Ethiopian Agri-Chain Transparency System
          </Text>
        </View>

        {renderLoginForm()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.large,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    fontSize: 60,
    marginBottom: theme.spacing.small,
  },
  appName: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  tagline: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    fontSize: theme.typography.body.fontSize,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.medium,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: theme.spacing.medium,
  },
  passwordInput: {
    marginBottom: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: theme.spacing.medium,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  eyeIconText: {
    fontSize: 20,
  },
  pickerContainer: {
    marginBottom: theme.spacing.medium,
  },
  pickerLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    padding: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.medium,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
  },
  buttonText: {
    color: 'white',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: theme.spacing.large,
  },
  toggleText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default LoginScreen;
