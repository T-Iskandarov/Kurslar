import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Lock, Eye, EyeOff, UserSquare } from 'lucide-react-native';
import { COLORS, SIZES } from '../../src/constants/theme';
import apiClient from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    if (phone.length < 13 || password.length < 4) {
      setErrorMsg("Iltimos telefon raqam va parolni to'g'ri kiriting");
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/\s+/g, '');
      const res = await apiClient.post('/auth/login/', {
        phone: cleanPhone,
        password
      });

      if (res.data.access) {
        apiClient.defaults.headers.Authorization = 'Bearer ' + res.data.access;
        const profileRes = await apiClient.get('/auth/profile/');
        await login({ access: res.data.access, refresh: res.data.refresh }, profileRes.data);
      }
    } catch (error: any) {
      setErrorMsg("Telefon raqam yoki parol noto'g'ri");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (text: string) => {
    let cleaned = text.replace(/[^\d]/g, '');
    if (cleaned.startsWith('998')) {
      cleaned = cleaned.substring(3);
    }
    
    let formatted = '+998';
    if (cleaned.length > 0) formatted += ' ' + cleaned.substring(0, 2);
    if (cleaned.length > 2) formatted += ' ' + cleaned.substring(2, 5);
    if (cleaned.length > 5) formatted += ' ' + cleaned.substring(5, 7);
    if (cleaned.length > 7) formatted += ' ' + cleaned.substring(7, 9);
    
    setPhone(formatted);
  };

  const renderContent = () => (
    <ScrollView 
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <UserSquare color={COLORS.primary} size={32} />
        </View>
        <Text style={styles.title}>Tizimga kirish</Text>
        <Text style={styles.subtitle}>O'quv platformamizga{'\n'}xush kelibsiz</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Telefon raqam</Text>
        <View style={styles.inputContainer}>
          <Phone color={COLORS.textLight} size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={formatPhone}
            keyboardType="phone-pad"
            placeholder="+998 90 123 45 67"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <Text style={styles.label}>Parol</Text>
        <View style={styles.inputContainer}>
          <Lock color={COLORS.textLight} size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="********"
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            {showPassword ? (
              <EyeOff color={COLORS.textLight} size={20} />
            ) : (
              <Eye color={COLORS.textLight} size={20} />
            )}
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Kirish</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hisobingiz yo'qmi? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.footerLink}>Ro'yxatdan o'tish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {renderContent()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flexGrow: 1,
    padding: SIZES.paddingLg,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: COLORS.background,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 20,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 56,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  }
});
