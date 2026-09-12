"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function ModuleTestPage() {
  const params = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // State for user answers: { question_id: "selected text" }
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiFetch(`/modules/${params.id}/test/generate/`);
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        } else if (res.status === 403) {
          const resData = await res.json();
          setErrorMsg(resData.error);
          setResult({
            passed: false,
            failed_lessons: resData.required_lessons,
            score: 0,
            is_locked: true
          });

        } else {
          router.push("/courses");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [params.id, router]);

  const handleSelectOption = (questionId: number, text: string) => {
    if (result) return;
    setAnswers({ ...answers, [questionId]: text });
  };

  const handleSubmit = async () => {
    if (!data?.questions) return;
    
    if (Object.keys(answers).length < data.questions.length) {
      alert("Iltimos barcha savollarga javob bering.");
      return;
    }

    setSubmitting(true);
    
    try {
      const res = await apiFetch(`/modules/${params.id}/test/submit/`, {
        method: "POST",
        body: JSON.stringify({ answers })
      });
      
      if (res.ok) {
        const resData = await res.json();
        setResult({
          passed: resData.is_passed,
          score: resData.score,
          correct_count: resData.correct_count,
          total_count: resData.total_count,
          failed_lessons: resData.failed_lessons
        });
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

  if (result?.is_locked) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
         <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Test bloklangan</h2>
            <p className="text-red-700 mb-6">{errorMsg || "Sizda qayta ko'rilishi majburiy bo'lgan darslar bor."}</p>
            
            <div className="bg-white rounded-xl p-4 text-left max-w-md mx-auto mb-6 shadow-sm border border-red-100">
              <h4 className="font-semibold text-gray-800 mb-2">Quyidagi darslarni qayta o'qib, testini yechishingiz shart:</h4>
              <ul className="list-disc pl-5 text-gray-600">
                {result.failed_lessons?.map((l: any) => (
                  <li key={l.id} className="mb-1">{l.title}</li>
                ))}
              </ul>
            </div>



            <div className="mt-10">
               <button onClick={() => router.back()} className="px-10 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-gray-300 shadow-sm hover:shadow transition-all focus:ring-4 focus:ring-gray-100 flex items-center gap-2 mx-auto">
                 <ArrowLeft size={18} className="text-gray-500" />
                 Kursga qaytish
               </button>
            </div>
         </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 font-medium text-sm">
        <ArrowLeft size={16} />
        Modulga qaytish
      </button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Yakuniy Test: {data.module_title}</h1>
        <p className="text-gray-500 mt-2">Ushbu modulni muvaffaqiyatli tugatish uchun barcha savollarga javob bering. O'tish bali kamida 80%.</p>
      </div>

      <div className="space-y-8">
        {data.questions?.map((q: any, i: number) => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 leading-relaxed">
              <span className="text-blue-600 font-bold mr-2">{i + 1}.</span>
              {q.question_text}
            </h3>
            
            <div className="space-y-3">
              {q.options.map((opt: any, optIdx: number) => {
                let labelStyle = answers[q.id] === opt.text 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-100 hover:border-blue-200 hover:bg-gray-50";
                let textStyle = answers[q.id] === opt.text ? "text-blue-900" : "text-gray-700";
                
                return (
                <label 
                  key={optIdx} 
                  className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${labelStyle} ${result ? "pointer-events-none" : ""}`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name={`question_${q.id}`}
                      value={opt.text}
                      checked={answers[q.id] === opt.text}
                      onChange={() => handleSelectOption(q.id, opt.text)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      disabled={!!result}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className={`font-medium ${textStyle}`}>
                      {opt.text}
                    </span>
                  </div>
                </label>
                );
              })}
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
            {submitting ? "Tekshirilmoqda..." : "Testni yakunlash"}
          </button>
        </div>
      ) : (
        <div className={`mt-8 p-6 md:p-8 rounded-2xl border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-4 rounded-full ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {result.passed ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
            </div>
            
            <h3 className={`text-2xl font-bold ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
              {result.passed ? "Tabriklaymiz!" : "Siz modul testidan o'ta olmadingiz."}
            </h3>
            
            <p className={`text-lg font-medium ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
              Natija: {result.score}% ({result.total_count} ta savoldan {result.correct_count} ta to'g'ri)
            </p>

            {!result.passed && (
              <div className="w-full max-w-2xl mt-4">
                <div className="bg-white rounded-xl p-6 text-left shadow-sm border border-red-100">
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">Xato qilingan mavzular (Qayta ko'rish majburiy):</h4>
                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                    {result.failed_lessons?.map((l: any) => (
                      <li key={l.id}>{l.title}</li>
                    ))}
                  </ul>


                </div>
              </div>
            )}

            <div className="mt-8">
               <button onClick={() => router.back()} className="px-10 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-gray-300 shadow-sm hover:shadow transition-all focus:ring-4 focus:ring-gray-100 flex items-center gap-2 mx-auto">
                 <ArrowLeft size={18} className="text-gray-500" />
                 Kursga qaytish
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
