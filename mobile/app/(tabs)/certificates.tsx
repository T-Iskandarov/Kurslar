import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, Award } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import apiClient from '../../src/api/client';
import CustomAlert from '../../src/components/CustomAlert';

export default function CertificatesScreen() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'info' as any });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await apiClient.get('/auth/my-certificates/');
      setCertificates(res.data?.results || res.data || []);
    } catch (error) {
      console.log('Error fetching certificates', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDownload = async (certId: string) => {
    try {
      // Veb saytdagi sertifikat manzilini ochamiz
      const url = `https://kurslarim.uz/certificates/${certId}`;
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      setAlertConfig({
        title: 'Xatolik',
        message: 'Brauzerni ochishda xatolik yuz berdi!',
        type: 'error'
      });
      setAlertVisible(true);
    }
  };

  const renderCertificate = ({ item, index }: any) => {
    const color = index % 2 === 0 ? COLORS.primary : '#fbbf24'; // Alternate colors
    
    return (
      <View style={[styles.card, { borderColor: color + '40' }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.courseTitle, { color: color }]}>{item.course_title?.toUpperCase()}</Text>
          <Award size={32} color={color} />
        </View>

        <Text style={styles.studentName}>{item.user_name}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Sana: {formatDate(item.issued_at)}</Text>
          <Text style={styles.infoText}>ID: {item.certificate_id}</Text>
        </View>

        <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownload(item.certificate_id)}>
          <Download size={18} color={color} style={{ marginRight: 8 }} />
          <Text style={[styles.downloadText, { color: color }]}>Yuklab olish</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sertifikatlarim</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={certificates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCertificate}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Award color={COLORS.primary} size={48} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>Sertifikatlar yo'q</Text>
              <Text style={styles.emptyDesc}>Sizda hozircha sertifikatlar mavjud emas. Kurslarni to'liq yakunlab, o'z sertifikatlaringizga ega bo'ling!</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/(tabs)/my-courses')}
              >
                <Text style={styles.emptyButtonText}>Mening kurslarim</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertVisible(false)}
      />
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    ...SHADOWS.light,
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 40,
    fontSize: 16,
  }
});

