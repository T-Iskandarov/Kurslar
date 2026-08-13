"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function CourseFinalTestPage() {
  const params = useParams();
  const router = useRouter();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for storing user selections: { question_id: selected_option_index }
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiFetch(`/courses/${params.id}/final-test/`);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        } else {
          const errData = await res.json();
          setError(errData.detail || "Xatolik yuz berdi");
        }
      } catch (err) {
        console.error(err);
        setError("Tarmoq xatosi");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [params.id, router]);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (result) return; // Disallow changes after submit
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;
    
    // Check if all questions are answered
    if (Object.keys(answers).length < questions.length) {
      alert("Iltimos barcha savollarga javob bering.");
      return;
    }

    setSubmitting(true);
    
    const formattedAnswers = Object.entries(answers).map(([qId, optIdx]) => ({
      question_id: parseInt(qId),
      selected_option: optIdx
    }));

    try {
      const res = await apiFetch(`/courses/${params.id}/submit-final-test/`, {
        method: "POST",
        body: JSON.stringify({ answers: formattedAnswers })
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        alert("Testni topshirishda xatolik yuz berdi.");
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
          <XCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Xatolik</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link href={`/courses/${params.id}`} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
          Kursga qaytish
        </Link>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Test topilmadi</h2>
        <p className="text-gray-500 mb-8">Ushbu kurs uchun yakuniy test savollari kiritilmagan.</p>
        <Link href={`/courses/${params.id}`} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
          Kursga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link href={`/courses/${params.id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium text-sm">
        <ArrowLeft size={16} />
        Kursga qaytish
      </Link>

      <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-2xl border border-purple-100">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-900 tracking-tight mb-2">Yakuniy Test</h1>
        <p className="text-purple-700">Barcha savollarga javob bering. Sertifikat olish uchun kamida 80% natija qayd etishingiz kerak.</p>
      </div>

      <div className="space-y-8">
        {questions.map((q: any, i: number) => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 leading-relaxed">
              <span className="text-purple-600 font-bold mr-2">{i + 1}.</span>
              {q.question_text}
            </h3>
            
            <div className="space-y-3">
              {q.options.map((opt: any, optIdx: number) => (
                <label 
                  key={optIdx} 
                  className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[q.id] === optIdx 
                      ? "border-purple-500 bg-purple-50" 
                      : "border-gray-100 hover:border-purple-200 hover:bg-gray-50"
                  } ${result ? "pointer-events-none opacity-80" : ""}`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name={`question_${q.id}`}
                      value={optIdx}
                      checked={answers[q.id] === optIdx}
                      onChange={() => handleSelectOption(q.id, optIdx)}
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      disabled={!!result}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className={`font-medium ${answers[q.id] === optIdx ? "text-purple-900" : "text-gray-700"}`}>
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
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "Tekshirilmoqda..." : "Natijani ko'rish"}
          </button>
        </div>
      ) : (
        <div className={`mt-8 p-6 md:p-8 rounded-2xl border ${result.passed ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-red-50 border-red-200'}`}>
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
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              {result.passed && result.certificate_id ? (
                <Link
                  href={`/certificates/${result.certificate_id}`}
                  className="block w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-sm text-center transition-colors"
                >
                  Sertifikatni ko'rish
                </Link>
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
