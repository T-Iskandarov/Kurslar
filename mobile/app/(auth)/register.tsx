import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Lock, Eye, EyeOff, User, Calendar, ChevronDown } from 'lucide-react-native';
import { COLORS, SIZES } from '../../src/constants/theme';
import apiClient from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('ayol'); // Default
  
  const [showPassword, setShowPassword] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date(2000, 0, 1));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    setErrorMsg('');
    if (fullName.length < 3 || phone.length < 13 || password.length < 4) {
      setErrorMsg("Iltimos barcha maydonlarni to'g'ri to'ldiring");
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/[^\d]/g, '');
      
      await apiClient.post('/auth/register/', {
        phone: cleanPhone,
        password,
        full_name: fullName,
        gender: gender,
        birth_date: birthDate || null
      });

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
      setErrorMsg(error.response?.data?.phone?.[0] || "Xatolik yuz berdi. Balki bu raqam ro'yxatdan o'tgandir?");
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
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <User color={COLORS.success} size={32} />
        </View>
        <Text style={styles.title}>Ro'yxatdan o'tish</Text>
        <Text style={styles.subtitle}>Yangi profil yarating va{'\n'}o'qishni boshlang</Text>
      </View>

      <View style={styles.form}>
        {/* F.I.Sh */}
        <Text style={styles.label}>F.I.Sh</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { paddingLeft: 0 }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ism va familiyangizni kiriting"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        {/* Telefon */}
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

        {/* Tug'ilgan sana */}
        <Text style={styles.label}>Tug'ilgan sana (YYYY-MM-DD)</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
          <Text style={[styles.input, { paddingTop: 16 }, !birthDate && { color: COLORS.textLight }]}>
            {birthDate || '2000-12-31'}
          </Text>
          <Calendar color={COLORS.textLight} size={20} />
        </TouchableOpacity>

        {showDatePicker && (
          <View style={{ backgroundColor: COLORS.white, borderRadius: SIZES.radius, overflow: 'hidden', marginBottom: 20 }}>
            <DateTimePicker
              value={dateObj}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              themeVariant="light"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (Platform.OS !== 'ios') {
                  setShowDatePicker(false);
                }
                if (selectedDate) {
                  setDateObj(selectedDate);
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const day = String(selectedDate.getDate()).padStart(2, '0');
                  setBirthDate(`${year}-${month}-${day}`);
                }
              }}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity 
                style={{ backgroundColor: COLORS.primary, padding: 12, alignItems: 'center' }}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Tanlash</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Jinsingiz */}
        <Text style={styles.label}>Jinsingiz</Text>
        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => setShowGenderPicker(!showGenderPicker)}
        >
          <Text style={[styles.input, { paddingTop: 16 }]}>
            {gender === 'ayol' ? 'Ayol' : 'Erkak'}
          </Text>
          <ChevronDown color={COLORS.textLight} size={20} />
        </TouchableOpacity>

        {showGenderPicker && (
          <View style={styles.pickerDropdown}>
            <TouchableOpacity style={styles.pickerItem} onPress={() => { setGender('ayol'); setShowGenderPicker(false); }}>
              <Text style={styles.pickerItemText}>Ayol</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickerItem} onPress={() => { setGender('erkak'); setShowGenderPicker(false); }}>
              <Text style={styles.pickerItemText}>Erkak</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Parol */}
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
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Ro'yxatdan o'tish</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Profil mavjudmi? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.footerLink}>Tizimga kiring</Text>
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
  scrollContent: {
    padding: SIZES.paddingLg,
    paddingBottom: 40,
    flexGrow: 1,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.successLight,
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
    backgroundColor: COLORS.success,
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
  },
  pickerDropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    marginTop: -10,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemText: {
    fontSize: 16,
    color: COLORS.text,
  }
});


