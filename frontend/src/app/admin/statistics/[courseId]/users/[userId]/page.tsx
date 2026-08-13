"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, CheckCircle2, XCircle, FileCheck, Phone, User, Calendar, Award } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

export default function UserStatisticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId;
  const userId = params?.userId;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.is_staff) {
      router.push("/courses");
      return;
    }

    if (courseId && userId) {
      fetchData();
    }
  }, [user, authLoading, router, courseId, userId]);

  const fetchData = async () => {
    try {
      const res = await apiFetch(`/admin/statistics/courses/${courseId}/users/${userId}/`);
      if (res.ok) {
        setData(await res.json());
      } else {
        toast.error("Ma'lumot topilmadi");
      }
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div>Ma'lumot topilmadi</div>;
  }

  const { user: student, course, certificate, test_attempts, final_test_attempts } = data;

  const renderAttemptDetails = (attempt: any, titlePrefix: string) => {
    return (
      <div key={attempt.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        <div className={`px-4 py-3 border-b border-gray-200 flex justify-between items-center ${attempt.is_passed ? 'bg-green-50' : 'bg-red-50'}`}>
          <div>
            <h3 className="font-semibold text-gray-900">{titlePrefix} - Urinish</h3>
            <p className="text-xs text-gray-500">
              {format(new Date(attempt.created_at), "d MMM, yyyy HH:mm", { locale: uz })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-500 block">Natija</span>
              <span className={`font-bold ${attempt.is_passed ? 'text-green-600' : 'text-red-600'}`}>
                {attempt.score}% ({attempt.is_passed ? "O'tdi" : "Yiqildi"})
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {attempt.details && attempt.details.length > 0 ? (
            attempt.details.map((detail: any, idx: number) => (
              <div key={idx} className="flex gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {detail.is_correct ? (
                    <CheckCircle2 className="text-green-500 h-5 w-5" />
                  ) : (
                    <XCircle className="text-red-500 h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{detail.question_text}</p>
                  <p className={`text-xs mt-1 ${detail.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {detail.is_correct ? "To'g'ri javob berilgan" : "Xato javob berilgan"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Tafsilotlar mavjud emas (Eski tizimda saqlanmagan).</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <Link href={`/admin/statistics/${courseId}`} className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
          <ArrowLeft size={16} className="mr-1" /> O'quvchilar ro'yxatiga qaytish
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.full_name}</h1>
            <div className="flex items-center text-gray-500 mt-1 gap-4 text-sm">
              <span className="flex items-center"><Phone size={14} className="mr-1"/> {student.phone}</span>
              <span className="flex items-center"><Calendar size={14} className="mr-1"/> A'zo bo'ldi: {format(new Date(student.date_joined), "d MMM, yyyy", { locale: uz })}</span>
            </div>
          </div>
        </div>
        
        {certificate && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <Award className="text-yellow-600 h-8 w-8" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Sertifikat olingan</p>
              <p className="text-xs text-yellow-700">ID: {certificate.certificate_id} • Natija: {certificate.score}%</p>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">{course.title} - Yakuniy test urinishlari</h2>
      {final_test_attempts.length > 0 ? (
        final_test_attempts.map((attempt: any) => renderAttemptDetails(attempt, "Yakuniy Test"))
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 mb-8 border border-gray-100">
          Yakuniy testga urinishlar yo'q
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">{course.title} - Darslardagi test urinishlari</h2>
      {test_attempts.length > 0 ? (
        test_attempts.map((attempt: any) => renderAttemptDetails(attempt, attempt.lesson_title))
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 mb-8 border border-gray-100">
          Darslardagi testlarga urinishlar yo'q
        </div>
      )}
      
    </div>
  );
}
