import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import apiClient, { MEDIA_URL } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function MyCoursesScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Barchasi');

  const tabs = ['Barchasi', 'Davom etilayotgan', 'Tugallangan'];

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      // In a real app, this would be a specific endpoint for user's courses
      const res = await apiClient.get('/courses/');
      const data = res.data?.results || res.data;
      // In a real app, there would be an endpoint like /users/my-courses/
      // or we filter by user progress. Here we'll just map and mock it.
      const coursesWithProgress = (Array.isArray(data) ? data : []).map((c: any) => ({
        ...c,
        progress: c.user_progress_percent || Math.floor(Math.random() * 100), // Fallback for UI testing
        totalLessons: c.lessons_count || 10,
        completedLessons: Math.floor((c.user_progress_percent || 0) / 10)
      }));
      setCourses(coursesWithProgress);
    } catch (error) {
      console.log('Error fetching my courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCourses = () => {
    if (activeTab === 'Davom etilayotgan') {
      return courses.filter(c => c.progress > 0 && c.progress < 100);
    } else if (activeTab === 'Tugallangan') {
      return courses.filter(c => c.progress === 100);
    }
    return courses; // 'Barchasi'
  };

  const renderCourseCard = ({ item }: any) => {
    const imageUrl = item.thumbnail 
      ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${MEDIA_URL}${item.thumbnail}`)
      : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const isCompleted = item.progress === 100;

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
              {item.completedLessons} / {item.totalLessons} dars
            </Text>
            {isCompleted ? (
              <CheckCircle2 color={COLORS.success} size={20} />
            ) : (
              <Text style={styles.progressPercent}>{item.progress}%</Text>
            )}
          </View>

          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${item.progress}%`, backgroundColor: isCompleted ? COLORS.success : COLORS.primary }
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

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getFilteredCourses()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCourseCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Hozircha kurslar yo'q</Text>
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTab: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTextDetail: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
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
  emptyText: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 40,
    fontSize: 16,
  }
});
