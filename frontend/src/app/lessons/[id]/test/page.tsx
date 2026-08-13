"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State for storing user selections: { question_id: selected_option_index }
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await apiFetch(`/lessons/${params.id}/`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data);
        } else {
          router.push("/courses");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [params.id, router]);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (result) return; // Disallow changes after submit
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    if (!lesson?.questions) return;
    
    // Check if all questions are answered
    if (Object.keys(answers).length < lesson.questions.length) {
      alert("Iltimos barcha savollarga javob bering.");
      return;
    }

    setSubmitting(true);
    
    const formattedAnswers = Object.entries(answers).map(([qId, optIdx]) => ({
      question_id: parseInt(qId),
      selected_option: optIdx
    }));

    try {
      const res = await apiFetch(`/lessons/${params.id}/submit-test/`, {
        method: "POST",
        body: JSON.stringify({ answers: formattedAnswers })
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link href={`/lessons/${lesson.id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 font-medium text-sm">
        <ArrowLeft size={16} />
        Darsga qaytish
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Test: {lesson.title}</h1>
        <p className="text-gray-500 mt-2">Barcha savollarga javob bering. Keyingi darsga o'tish uchun kamida 70% natija qayd etishingiz kerak.</p>
      </div>

      <div className="space-y-8">
        {lesson.questions?.map((q: any, i: number) => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 leading-relaxed">
              <span className="text-blue-600 font-bold mr-2">{i + 1}.</span>
              {q.question_text}
            </h3>
            
            <div className="space-y-3">
              {q.options.map((opt: any, optIdx: number) => (
                <label 
                  key={optIdx} 
                  className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[q.id] === optIdx 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                  } ${result ? "pointer-events-none opacity-80" : ""}`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name={`question_${q.id}`}
                      value={optIdx}
                      checked={answers[q.id] === optIdx}
                      onChange={() => handleSelectOption(q.id, optIdx)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      disabled={!!result}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className={`font-medium ${answers[q.id] === optIdx ? "text-blue-900" : "text-gray-700"}`}>
                      {opt.text}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!result ? (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "Tekshirilmoqda..." : "Natijani ko'rish"}
          </button>
        </div>
      ) : (
        <div className={`mt-8 p-6 md:p-8 rounded-2xl border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`flex-shrink-0 p-3 rounded-full ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {result.passed ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
                  {result.passed ? "Tabriklaymiz!" : "Afsuski, o'ta olmadingiz."}
                </h3>
                <p className={`mt-1 font-medium ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                  Sizning natijangiz: {result.score}% ({result.total_questions} ta savoldan {result.correct_answers} ta to'g'ri)
                  {result.passed && !result.next_lesson_id && (
                    <span className="block mt-2 text-green-800 font-semibold">
                      Barcha darslarni muvaffaqiyatli tugatdingiz! Endi yakuniy testni topshirishingiz mumkin.
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex flex-col gap-3">
              {result.passed ? (
                result.next_lesson_id ? (
                  <Link
                    href={`/lessons/${result.next_lesson_id}`}
                    className="block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-sm text-center transition-colors whitespace-nowrap"
                  >
                    Keyingi darsga o'tish
                  </Link>
                ) : (
                  <Link
                    href={`/courses/${lesson.course_id}/final-test`}
                    className="block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-sm text-center transition-colors whitespace-nowrap"
                  >
                    Yakuniy testga o'tish
                  </Link>
                )
              ) : (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                  }}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-sm transition-colors"
                >
                  Qayta urinib ko'rish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
