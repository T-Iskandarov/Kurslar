import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Phone, User, Calendar, Save } from 'lucide-react-native';
import { COLORS, SIZES } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import apiClient from '../../src/api/client';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'erkak' | 'ayol' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setBirthDate(user.birth_date || '');
      setGender((user.gender as any) || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Xatolik", "Ism va familiya bo'sh bo'lishi mumkin emas.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.patch('/auth/profile/', {
        full_name: fullName,
        birth_date: birthDate || null,
        gender: gender,
      });
      
      updateUser(response.data);
      Alert.alert("Muvaffaqiyatli", "Ma'lumotlaringiz yangilandi.", [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.log('Update profile error:', error);
      Alert.alert("Xatolik", "Ma'lumotlarni yangilashda xatolik yuz berdi. Iltimos, sanani YYYY-MM-DD shaklida kiritganingizga ishonch hosil qiling.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sozlamalar</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Sozlamalar</Text>
              <Text style={styles.subtitle}>Shaxsiy ma'lumotlaringizni tahrirlang</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon raqam</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Phone color="#9CA3AF" size={20} />
                <TextInput 
                  style={[styles.input, { color: '#9CA3AF' }]}
                  value={user?.phone}
                  editable={false}
                />
              </View>
              <Text style={styles.hintText}>Telefon raqamni o'zgartirib bo'lmaydi</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ism va familiya</Text>
              <View style={styles.inputContainer}>
                <User color="#9CA3AF" size={20} />
                <TextInput 
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Ism va familiya"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tug'ilgan sana</Text>
              <View style={styles.inputContainer}>
                <Calendar color="#9CA3AF" size={20} />
                <TextInput 
                  style={styles.input}
                  value={birthDate}
                  onChangeText={setBirthDate}
                  placeholder="YYYY-MM-DD (Masalan: 2000-01-01)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Jinsingiz</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity 
                  style={[
                    styles.genderButton,
                    gender === 'erkak' && styles.genderButtonActiveErkak
                  ]}
                  onPress={() => setGender('erkak')}
                >
                  <Text style={[
                    styles.genderText,
                    gender === 'erkak' && styles.genderTextActiveErkak
                  ]}>Erkak</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.genderButton,
                    gender === 'ayol' && styles.genderButtonActiveAyol
                  ]}
                  onPress={() => setGender('ayol')}
                >
                  <Text style={[
                    styles.genderText,
                    gender === 'ayol' && styles.genderTextActiveAyol
                  ]}>Ayol</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Save color={COLORS.white} size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.saveButtonText}>Saqlash</Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: COLORS.white,
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  hintText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  genderButtonActiveErkak: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  genderButtonActiveAyol: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
  },
  genderText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  genderTextActiveErkak: {
    color: COLORS.primary,
  },
  genderTextActiveAyol: {
    color: '#EC4899',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
