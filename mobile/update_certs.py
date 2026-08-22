import re

with open('app/(tabs)/certificates.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useRouter
content = content.replace("import * as WebBrowser from 'expo-web-browser';", "import * as WebBrowser from 'expo-web-browser';\nimport { useRouter } from 'expo-router';")

# Instantiate useRouter
content = content.replace("export default function CertificatesScreen() {\n  const [certificates, setCertificates] = useState<any[]>([]);", "export default function CertificatesScreen() {\n  const router = useRouter();\n  const [certificates, setCertificates] = useState<any[]>([]);")

# Replace ListEmptyComponent
pattern = r"<Text style=\{styles\.emptyText\}>Sizda hozircha sertifikatlar yo'q\. Kurslarni to'liq yakunlang!</Text>"
replacement = """<View style={styles.emptyContainer}>
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
            </View>"""
content = re.sub(pattern, replacement, content)

# Remove old emptyText style and add new styles
style_pattern = r"emptyText: \{[^}]+\},"
style_replacement = """emptyContainer: {
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
  },"""
content = re.sub(style_pattern, style_replacement, content)

with open('app/(tabs)/certificates.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("certificates.tsx updated")
