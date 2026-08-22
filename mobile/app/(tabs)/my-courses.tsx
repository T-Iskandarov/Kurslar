import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle2, BookOpen } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import apiClient, { MEDIA_URL } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function MyCoursesScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await apiClient.get('/auth/my-courses/');
      // Filter out courses where they haven't passed any lesson, to match user request: 
      // "hali birorta ham bosqichan o'tmagan kurs bo'lsa chiqmasin"
      const startedCourses = (res.data || []).filter(
        (c: any) => c.passed_lessons > 0 || c.is_completed
      );
      setCourses(startedCourses);
    } catch (error) {
      console.log('Error fetching my courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const renderCourseCard = ({ item }: any) => {
    const imageUrl = item.thumbnail 
      ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${MEDIA_URL}${item.thumbnail}`)
      : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const isCompleted = item.is_completed;
    const progress = item.progress_percent || 0;
    const primaryColor = isCompleted ? COLORS.success : COLORS.primary;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/course/${item.id}` as any)}
      >
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressTextDetail}>
              {item.passed_lessons} / {item.total_lessons} dars
            </Text>
            {isCompleted ? (
              <CheckCircle2 color={COLORS.success} size={20} />
            ) : (
              <Text style={styles.progressPercent}>{progress}%</Text>
            )}
          </View>

          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progress}%`, backgroundColor: primaryColor }
              ]} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mening kurslarim</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          key={2}
          data={courses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCourseCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <BookOpen color={COLORS.primary} size={48} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>Kurslar mavjud emas</Text>
              <Text style={styles.emptyDesc}>Sizda hozircha o'qilayotgan kurslar yo'q. Yangi bilimlarni kashf etish uchun kurslarga yoziling.</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/(tabs)/')}
              >
                <Text style={styles.emptyButtonText}>Kurslarni ko'rish</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listContainer: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  cardImage: {
    width: '100%',
    height: 110,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTextDetail: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  }
});

