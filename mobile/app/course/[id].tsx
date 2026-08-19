import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, Users, PlayCircle, Lock, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../../src/constants/theme';
import apiClient, { MEDIA_URL } from '../../src/api/client';

const ModuleItem = ({ module, index, router }: any) => {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <View style={styles.moduleContainer}>
      <TouchableOpacity style={styles.moduleHeader} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.moduleTitle}>{module.title}</Text>
        {expanded ? <ChevronUp size={20} color="#6B7280" /> : <ChevronDown size={20} color="#6B7280" />}
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.moduleContent}>
          {module.lessons.map((lesson: any, i: number) => {
            const isUnlocked = lesson.is_unlocked;
            const isPassed = lesson.is_passed;
            const score = lesson.score || 0;
            const hasStartedOrPassed = isPassed || (isUnlocked && score > 0);

            if (isUnlocked && hasStartedOrPassed) {
              return (
                <TouchableOpacity 
                  key={lesson.id} 
                  style={[styles.lessonCard, styles.lessonCardCompleted]} 
                  onPress={() => router.push(`/lesson/${lesson.id}` as any)}
                >
                  <View style={styles.lessonCardLeft}>
                    <CheckCircle2 color="#15803D" size={20} />
                    <View style={styles.lessonTextContainer}>
                      <Text style={[styles.lessonCardTitle, styles.lessonCardTitleCompleted]}>
                        {lesson.title}
                      </Text>
                      <Text style={styles.lessonScoreText}>Natija: {score}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            } else if (isUnlocked) {
              return (
                <TouchableOpacity 
                  key={lesson.id} 
                  style={[styles.lessonCard, styles.lessonCardUnlocked]} 
                  onPress={() => router.push(`/lesson/${lesson.id}` as any)}
                >
                  <View style={styles.lessonCardLeft}>
                    <PlayCircle color="#3B82F6" size={20} />
                    <View style={styles.lessonTextContainer}>
                      <Text style={[styles.lessonCardTitle, styles.lessonCardTitleUnlocked]}>
                        {lesson.title}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            } else {
              return (
                <TouchableOpacity 
                  key={lesson.id} 
                  style={[styles.lessonCard, styles.lessonCardLocked]} 
                  disabled
                >
                  <View style={styles.lessonCardLeft}>
                    <Lock color="#9CA3AF" size={20} />
                    <View style={styles.lessonTextContainer}>
                      <Text style={[styles.lessonCardTitle, styles.lessonCardTitleLocked]}>
                        {lesson.title}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }
          })}
        </View>
      )}
    </View>
  );
};

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <Text>Kurs topilmadi.</Text>
      </View>
    );
  }

  const imageUrl = course.thumbnail 
    ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${MEDIA_URL}${course.thumbnail}`)
    : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  const allLessons = course.modules?.flatMap((m: any) => m.lessons) || course.lessons || [];
  const progressPercent = course.user_progress_percent || 0;
  const studentsCount = course.students_count || 0;
  const modules = course.modules || [];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Banner Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.headerImage} />
          <View style={styles.overlay} />
          <Text style={styles.imageTitle}>{course.title}</Text>
        </View>

        {/* Info Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <PlayCircle color="#6B7280" size={16} />
            <Text style={styles.statText}>{allLessons.length} ta dars</Text>
          </View>
          <View style={styles.statItem}>
            <Clock color="#6B7280" size={16} />
            <Text style={styles.statText}>{formatDate(course.created_at)}</Text>
          </View>
          <View style={styles.statItem}>
            <Users color="#6B7280" size={16} />
            <Text style={styles.statText}>{studentsCount} nafar o'quvchi</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Kursni o'zlashtirish</Text>
            <Text style={styles.progressValue}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* About Course */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kurs haqida</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        {/* Lessons List with Accordion */}
        <View style={[styles.section, { marginTop: 32 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Darslar</Text>
          
          {modules.map((module: any, index: number) => (
            <ModuleItem key={module.id} module={module} index={index} router={router} />
          ))}

          {/* Final Test Card */}
          <View style={[styles.lessonCard, styles.lessonCardLocked, { marginTop: 16 }]}>
            <View style={styles.lessonCardLeft}>
              <Lock color="#9CA3AF" size={20} />
              <View style={styles.lessonTextContainer}>
                <Text style={[styles.lessonCardTitle, styles.lessonCardTitleLocked, { fontWeight: 'bold' }]}>
                  Yakuniy Test
                </Text>
                <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>
                  Barcha darslarni tugatgandan so'ng ochiladi
                </Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    marginHorizontal: 16,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 16,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  imageTitle: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  moduleContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 16,
  },
  moduleContent: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  lessonCardCompleted: {
    backgroundColor: '#F0FDF4',
  },
  lessonCardUnlocked: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lessonCardLocked: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  lessonCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  lessonCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  lessonCardTitleCompleted: {
    color: '#15803D',
    marginBottom: 2,
  },
  lessonCardTitleUnlocked: {
    color: '#1F2937',
  },
  lessonCardTitleLocked: {
    color: '#9CA3AF',
  },
  lessonScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803D',
  }
});
