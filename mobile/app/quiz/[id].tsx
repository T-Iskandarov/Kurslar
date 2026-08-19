import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS, SIZES } from '../../src/constants/theme';
import apiClient from '../../src/api/client';
import CustomAlert from '../../src/components/CustomAlert';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>({
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: undefined,
    onConfirm: () => setAlertVisible(false),
    onCancel: undefined,
  });

  const showAlert = (config: any) => {
    setAlertConfig({
      ...config,
      confirmText: config.confirmText || 'OK',
      onConfirm: () => {
        setAlertVisible(false);
        if (config.onConfirm) config.onConfirm();
      },
      onCancel: config.onCancel ? () => {
        setAlertVisible(false);
        config.onCancel();
      } : undefined
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    try {
      // In our backend, questions are returned inside lesson details
      const res = await apiClient.get(`/lessons/${id}/`);
      if (res.data.questions) {
        setQuestions(res.data.questions);
      }
    } catch (error) {
      console.log('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      showAlert({
        title: "Diqqat",
        message: "Iltimos, barcha savollarga javob bering.",
        type: "warning"
      });
      return;
    }

    setSubmitting(true);
    try {
      const answersList = Object.keys(selectedAnswers).map(qId => ({
        question_id: parseInt(qId),
        selected_option: selectedAnswers[parseInt(qId)]
      }));

      const res = await apiClient.post(`/lessons/${id}/submit-test/`, {
        answers: answersList
      });

      const result = res.data;
      if (result.passed) {
        showAlert({
          title: "Tabriklaymiz!",
          message: `Siz testdan muvaffaqiyatli o'tdingiz!\nNatija: ${result.score}%`,
          type: "success",
          confirmText: "Davom etish",
          onConfirm: () => router.back()
        });
      } else {
        showAlert({
          title: "Afsus!",
          message: `Siz testdan o'ta olmadingiz.\nNatija: ${result.score}%\nQaytadan urinib ko'ring.`,
          type: "error",
          confirmText: "Qayta ishlash",
          cancelText: "Orqaga",
          onConfirm: () => setSelectedAnswers({}),
          onCancel: () => router.back()
        });
      }
      
    } catch (error) {
      console.log('Error submitting test:', error);
      showAlert({
        title: "Xatolik",
        message: "Testni yuborishda xatolik yuz berdi.",
        type: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test ishlash</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {questions.length === 0 ? (
          <Text style={styles.emptyText}>Bu dars uchun testlar topilmadi.</Text>
        ) : (
          questions.map((q, index) => (
            <View key={q.id} style={styles.questionCard}>
              <Text style={styles.questionNumber}>Savol {index + 1} / {questions.length}</Text>
              <Text style={styles.questionText}>{q.question_text}</Text>
              
              <View style={styles.optionsContainer}>
                {q.options.map((opt: any, optIndex: number) => {
                  const isSelected = selectedAnswers[q.id] === optIndex;
                  return (
                    <TouchableOpacity 
                      key={optIndex}
                      style={[styles.optionButton, isSelected && styles.optionButtonActive]}
                      onPress={() => handleSelectAnswer(q.id, optIndex)}
                    >
                      <View style={[styles.radio, isSelected && styles.radioActive]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                        {opt.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}

      </ScrollView>

      {questions.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.submitButton, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Testni yakunlash</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.textLight,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: SIZES.radiusLg,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionNumber: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  optionButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  optionTextActive: {
    fontWeight: '600',
    color: COLORS.primary,
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
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
