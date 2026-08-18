import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, Award } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';

export default function CertificatesScreen() {
  
  // Dummy data representing user's certificates
  const certificates = [
    {
      id: '1',
      title: 'FRONTEND ASOSLARI',
      studentName: 'Ismoilova Xilola',
      date: '13.08.2026',
      certId: '#FT-00123',
      color: COLORS.primary
    },
    {
      id: '2',
      title: 'KOMPYUTER SAVODXONLIGI',
      studentName: 'Ismoilova Xilola',
      date: '05.08.2026',
      certId: '#KC-00687',
      color: '#fbbf24' // Yellow/Gold
    }
  ];

  const renderCertificate = ({ item }: any) => {
    return (
      <View style={[styles.card, { borderColor: item.color + '40' }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.courseTitle, { color: item.color }]}>{item.title}</Text>
          <Award size={32} color={item.color} />
        </View>

        <Text style={styles.studentName}>{item.studentName}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Sana: {item.date}</Text>
          <Text style={styles.infoText}>ID: {item.certId}</Text>
        </View>

        <TouchableOpacity style={styles.downloadButton}>
          <Download size={18} color={item.color} style={{ marginRight: 8 }} />
          <Text style={[styles.downloadText, { color: item.color }]}>Yuklab olish</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sertifikatlarim</Text>
      </View>

      <FlatList
        data={certificates}
        keyExtractor={(item) => item.id}
        renderItem={renderCertificate}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
  }
});
