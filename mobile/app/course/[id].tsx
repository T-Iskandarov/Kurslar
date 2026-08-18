import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlayCircle, Clock, CheckCircle2, ChevronLeft, Lock } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import apiClient, { MEDIA_URL } from '../../src/api/client';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const res = await apiClient.get(`/courses/${id}/`);
      setCourse(res.data);
    } catch (error) {
      console.log('Error fetching course details:', error);
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

  if (!course) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Kurs topilmadi.</Text>
      </View>
    );
  }

  const imageUrl = course.thumbnail 
    ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${MEDIA_URL}${course.thumbnail}`)
    : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.headerImage} />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color={COLORS.text} size={24} />
          </TouchableOpacity>
        </View>

        {/* Course Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.description}>{course.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <PlayCircle color={COLORS.textLight} size={18} />
              <Text style={styles.statText}>{course.lessons?.length || 0} ta dars</Text>
            </View>
            <View style={styles.statItem}>
              <Clock color={COLORS.textLight} size={18} />
              <Text style={styles.statText}>Umumiy vaqt: 4 soat</Text>
            </View>
          </View>
        </View>

        {/* Lessons List */}
        <View style={styles.lessonsContainer}>
          <Text style={styles.sectionTitle}>Kurs tarkibi</Text>
          
          {course.lessons?.map((lesson: any, index: number) => {
            const isUnlocked = lesson.is_unlocked;
            const isPassed = lesson.is_passed;

            return (
              <TouchableOpacity 
                key={lesson.id}
                style={[styles.lessonCard, !isUnlocked && styles.lessonCardLocked]}
                disabled={!isUnlocked}
                onPress={() => router.push(`/lesson/${lesson.id}` as any)}
              >
                <View style={styles.lessonNumber}>
                  <Text style={[styles.numberText, !isUnlocked && { color: COLORS.textLight }]}>
                    {index + 1}
                  </Text>
                </View>
                
                <View style={styles.lessonContent}>
                  <Text style={[styles.lessonTitle, !isUnlocked && { color: COLORS.textLight }]}>
                    {lesson.title}
                  </Text>
                  <Text style={styles.lessonDuration}>Davomiyligi: 15 daqiqa</Text>
                </View>

                <View style={styles.lessonStatus}>
                  {isPassed ? (
                    <CheckCircle2 color={COLORS.success} size={24} />
                  ) : !isUnlocked ? (
                    <Lock color={COLORS.textLight} size={20} />
                  ) : (
                    <PlayCircle color={COLORS.primary} size={24} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Kursni boshlash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: SIZES.padding,
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  infoContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: SIZES.radiusLg,
    borderBottomRightRadius: SIZES.radiusLg,
    ...SHADOWS.light,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  lessonsContainer: {
    padding: SIZES.padding,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lessonCardLocked: {
    backgroundColor: '#f8fafc',
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  lessonDuration: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  lessonStatus: {
    marginLeft: 12,
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
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
