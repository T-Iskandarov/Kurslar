import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Modal } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Download, Info } from 'lucide-react-native';
import { COLORS, SIZES } from '../../src/constants/theme';
import apiClient, { MEDIA_URL } from '../../src/api/client';

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'materials'>('info');
  const [showModal, setShowModal] = useState(false);

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

  const getYoutubeId = (url: string) => {
    if (!url) return 'dQw4w9WgXcQ';
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <Text>Dars topilmadi.</Text>
      </View>
    );
  }

  const videoId = getYoutubeId(lesson.youtube_video_id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lesson.order}. {lesson.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* YouTube Video Player (Fallback to Web/App for Expo Go compatibility) */}
        <TouchableOpacity 
          style={styles.videoContainer}
          onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`)}
        >
          <Image 
            source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }} 
            style={styles.videoThumbnail}
            contentFit="cover"
          />
          <View style={styles.videoOverlay}>
            <View style={styles.playButtonCircle}>
              <Text style={styles.playButtonTriangle}>▶</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'info' && styles.tabButtonActive]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
              Dars haqida
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'materials' && styles.tabButtonActive]}
            onPress={() => setActiveTab('materials')}
          >
            <Text style={[styles.tabText, activeTab === 'materials' && styles.tabTextActive]}>
              Materiallar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'info' ? (
            <View>
              <Text style={styles.descriptionText}>
                {lesson.content || "Bu dars uchun qo'shimcha ma'lumot kiritilmagan."}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>Qo'shimcha resurslar</Text>
              
              <View style={styles.materialsList}>
                {lesson.resources && lesson.resources.length > 0 ? (
                  lesson.resources.map((res: any, index: number) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.materialCard}
                      onPress={() => {
                        if (res.file) {
                          const fileUrl = res.file.startsWith('http') 
                            ? res.file 
                            : `${MEDIA_URL.replace(/\/$/, '')}/${res.file.replace(/^\//, '')}`;
                          Linking.openURL(fileUrl);
                        } else {
                          setShowModal(true);
                        }
                      }}
                    >
                      <View style={styles.materialIconBox}>
                        <Download color="#15803D" size={24} />
                      </View>
                      <View>
                        <Text style={styles.materialTitle}>{res.title}</Text>
                        <Text style={styles.materialSubtitle}>Yuklab olish →</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.descriptionText}>Hozircha bu darsga fayl biriktirilmagan.</Text>
                )}
              </View>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Bottom Fixed Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.telegramButton}
          onPress={() => Linking.openURL('https://t.me/T_Iskandarov_kurslar_bot')}
        >
          <Text style={styles.telegramButtonText}>Savol berish{"\n"}(Telegram)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quizButton}
          onPress={() => router.push(`/quiz/${lesson.id}` as any)}
        >
          <Text style={styles.quizButtonText}>Testni ishlash</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Alert Modal */}
      <Modal visible={showModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <Info color="#2563EB" size={28} />
            </View>
            <Text style={styles.modalTitle}>Hozircha fayl yo'q</Text>
            <Text style={styles.modalText}>
              Bu dars uchun fayl yuklanmagan. Iltimos keyinroq qayta urinib ko'ring.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalButtonText}>Tushunarli</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  videoContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  playButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonTriangle: {
    color: '#FFFFFF',
    fontSize: 24,
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  contentContainer: {
    padding: 20,
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  materialsList: {
    gap: 12,
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  materialIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  materialSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    gap: 12,
  },
  telegramButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  quizButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  }
});
