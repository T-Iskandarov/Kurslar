import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  FlatList 
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    isFirst: true,
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png',
  },
  {
    id: '2',
    isFirst: false,
    image: 'https://cdn-icons-png.flaticon.com/512/2436/2436874.png',
    title: 'Sifatli ta\'lim\nva qulaylik',
    description: 'Istalgan joyda, istalgan vaqtda videodarslarni ko\'ring va o\'rganing.',
  },
  {
    id: '3',
    isFirst: false,
    image: 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png',
    title: 'Yangi bilimlar sari\nbirinchi qadam',
    description: 'Sifatli video darslar, testlar va sertifikatlar sizni kutmoqda.',
  }
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/login');
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    if (item.isFirst) {
      return (
        <View style={styles.slide}>
          <View style={styles.firstSlideTop}>
            <View style={styles.logoContainer}>
              <View style={styles.iconBox}>
                <BookOpen color={COLORS.white} size={32} />
              </View>
              <Text style={styles.titleFirst}>Tursunpo'lat{'\n'}Iskandarov</Text>
              <Text style={styles.subtitleFirst}>kurslari</Text>
            </View>
            <Text style={styles.descriptionFirst}>Bilimga birinchi qadam</Text>
          </View>
          
          <View style={styles.firstSlideImageContainer}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.imageFirst}
              resizeMode="contain"
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.carouselContainer}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <View 
              key={index.toString()} 
              style={[styles.dot, currentIndex === index && styles.dotActive]} 
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={scrollToNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Boshlash' : 'Keyingi'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  carouselContainer: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    padding: SIZES.paddingLg,
  },
  /* First Slide Styles */
  firstSlideTop: {
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconBox: {
    width: 68,
    height: 68,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleFirst: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitleFirst: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  descriptionFirst: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 40,
  },
  firstSlideImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFirst: {
    width: width * 0.6,
    height: width * 0.6,
  },

  /* Other Slides Styles */
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },

  /* Bottom Section (Dots & Button) */
  bottomSection: {
    paddingHorizontal: SIZES.paddingLg,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 16,
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
