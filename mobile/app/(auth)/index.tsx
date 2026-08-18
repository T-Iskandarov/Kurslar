import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>📖</Text>
          </View>
          <Text style={styles.title}>Tursunpo'lat{'\n'}Iskandarov</Text>
          <Text style={styles.subtitle}>kurslari</Text>
        </View>

        <View style={styles.centerImageContainer}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png' }} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.heading}>Yangi bilimlar sari birinchi qadam</Text>
          <Text style={styles.description}>
            Sifatli video darslar, testlar va sertifikatlar sizni kutmoqda.
          </Text>

          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>Boshlash</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SIZES.paddingLg,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconBox: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
  },
  centerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
