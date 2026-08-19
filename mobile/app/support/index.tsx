import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Phone, Send, Instagram, Youtube, Heart } from 'lucide-react-native';
import { COLORS, SIZES } from '../../src/constants/theme';

export default function SupportScreen() {
  const router = useRouter();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("URL ochishda xatolik:", err));
  };

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
        <Text style={styles.headerTitle}>Yordam</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Biz bilan bog'lanish</Text>
          <Text style={styles.cardSubtitle}>
            Savollaringiz bo'lsa yoki yordam kerak bo'lsa, quyidagi raqam yoki ijtimoiy tarmoqlar orqali biz bilan bog'lanishingiz mumkin.
          </Text>

          <View style={styles.linksContainer}>
            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => handleOpenLink('tel:+998973173497')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Phone color={COLORS.primary} size={22} />
              </View>
              <View style={styles.linkTextContainer}>
                <Text style={styles.linkLabel}>Telefon raqam</Text>
                <Text style={styles.linkValue}>+998 97 317 34 97</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => handleOpenLink('https://t.me/T_Iskandarov')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#EBF8FF' }]}>
                <Send color="#0088CC" size={22} />
              </View>
              <View style={styles.linkTextContainer}>
                <Text style={styles.linkLabel}>Telegram</Text>
                <Text style={styles.linkValue}>@T_Iskandarov</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => handleOpenLink('https://instagram.com/T_Iskandarov_')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#FDF2F8' }]}>
                <Instagram color="#E1306C" size={22} />
              </View>
              <View style={styles.linkTextContainer}>
                <Text style={styles.linkLabel}>Instagram</Text>
                <Text style={styles.linkValue}>@T_Iskandarov_</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.linkItem, { borderBottomWidth: 0 }]}
              onPress={() => handleOpenLink('https://youtube.com/@T_Iskandarov')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#FFE5E5' }]}>
                <Youtube color="#FF0000" size={22} />
              </View>
              <View style={styles.linkTextContainer}>
                <Text style={styles.linkLabel}>YouTube</Text>
                <Text style={styles.linkValue}>@T_Iskandarov</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>© 2026 Tursunpo'lat Iskandarov. Barcha huquqlar himoyalangan.</Text>
          <View style={styles.cuboContainer}>
            <Text style={styles.cuboText}>Made with </Text>
            <Heart color="#EF4444" size={14} fill="#EF4444" />
            <Text style={styles.cuboText}> by </Text>
            <TouchableOpacity onPress={() => handleOpenLink('https://cubo.uz')}>
              <Text style={styles.cuboBrand}>CUBO.uz</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 24,
  },
  linksContainer: {
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: COLORS.white,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  linkTextContainer: {
    flex: 1,
  },
  linkLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  linkValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  copyright: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  cuboContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuboText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  cuboBrand: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  }
});
