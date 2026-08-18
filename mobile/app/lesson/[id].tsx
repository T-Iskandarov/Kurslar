import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, HelpCircle } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import apiClient from '../../src/api/client';

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonDetails();
  }, [id]);

  const fetchLessonDetails = async () => {
    try {
      const res = await apiClient.get(`/lessons/${id}/`);
      setLesson(res.data);
    } catch (error) {
      console.log('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Dars topilmadi.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Dars {lesson.order}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Video Placeholder (Since Expo Video is complex to set up quickly, we use a placeholder) */}
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoText}>▶ Youtube Video: {lesson.youtube_video_id}</Text>
          <Text style={styles.videoSubText}>(Video pleyer shu yerda bo'ladi)</Text>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          
          <Text style={styles.descriptionLabel}>Dars matni va tavsif:</Text>
          <Text style={styles.descriptionText}>
            {lesson.content || "Bu dars uchun qo'shimcha ma'lumot kiritilmagan."}
          </Text>
        </View>

      </ScrollView>

      {/* Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.quizButton}
          onPress={() => router.push(`/quiz/${lesson.id}` as any)}
        >
          <HelpCircle color={COLORS.white} size={20} style={{ marginRight: 8 }} />
          <Text style={styles.quizButtonText}>Testni ishlash</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  videoPlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoSubText: {
    color: '#aaa',
    fontSize: 12,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  quizButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
