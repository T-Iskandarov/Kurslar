"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, MEDIA_BASE_URL } from "@/lib/api";
import { ArrowLeft, PlayCircle, Lock, CheckCircle2, Clock, Users, ListChecks, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await apiFetch(`/courses/${params.id}/`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
          if (data.modules && data.modules.length > 0) {
            setExpandedModules([data.modules[0].id]);
          }
        } else {
          router.push("/courses");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) return null;

  const imageUrl = course.thumbnail 
    ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${MEDIA_BASE_URL}${course.thumbnail}`)
    : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-80 bg-gray-900 w-full overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img src={imageUrl} alt={course.title} className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
          <Link href="/courses" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 w-fit">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Barcha kurslar</span>
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">{course.title}</h1>
          <div className="flex items-center gap-4 text-gray-300 text-sm">
            <div className="flex items-center gap-1.5">
              <PlayCircle size={16} />
              <span>{course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0} ta dars</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{format(new Date(course.created_at), "d MMMM, yyyy", { locale: uz })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} />
              <span>{course.students_count || 0} nafar o'quvchi</span>
            </div>
          </div>
          
          {course.user_progress_percent !== undefined && (
            <div className="mt-6 max-w-md">
              <div className="flex items-center justify-between text-sm text-gray-300 mb-2 font-medium">
                <span>Kursni o'zlashtirish</span>
                <span>{course.user_progress_percent}%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${course.user_progress_percent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Kurs haqida</h2>
              <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap">
                {course.description}
              </div>
            </div>

            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 md:p-8 text-center flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kursni o'qishni boshlash uchun</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Darslarni ko'rish va topshiriqlarni bajarish uchun tizimga kirishingiz yoki ro'yxatdan o'tishingiz kerak.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/login" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                    Tizimga kirish
                  </Link>
                  <Link href="/register" className="px-6 py-2.5 bg-white text-blue-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                    Ro'yxatdan o'tish
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span>Darslar</span>
                <span className="bg-blue-50 text-blue-700 py-1 px-2.5 rounded-lg text-sm font-semibold">
                  {course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0}
                </span>
              </h3>
              
              <div className="space-y-4">
                {course.modules?.map((module: any) => {
                  const isExpanded = expandedModules.includes(module.id);
                  
                  return (
                  <div key={module.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button 
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <h4 className="font-bold text-gray-900 text-sm">
                        {module.order}-Modul: {module.title}
                      </h4>
                      <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <div className="p-3 space-y-2">
                      {module.lessons?.map((lesson: any, index: number) => {
                        const isLocked = !lesson.is_unlocked;
                        const isPassed = lesson.is_passed;
                        
                        return (
                          <Link 
                            key={lesson.id} 
                            href={isLocked ? "#" : `/lessons/${lesson.id}`}
                            className={`block rounded-xl border p-4 transition-all ${
                              isLocked 
                                ? "bg-gray-50 border-gray-100 cursor-not-allowed opacity-75" 
                                : isPassed
                                  ? "bg-green-50 border-green-100 hover:border-green-200"
                                  : "bg-white border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200"
                            }`}
                            onClick={(e) => {
                              if (!user) {
                                e.preventDefault();
                                setShowAuthModal(true);
                                return;
                              }
                              if (isLocked) e.preventDefault();
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 flex-shrink-0 ${isLocked ? 'text-gray-400' : isPassed ? 'text-green-500' : 'text-blue-500'}`}>
                                {isLocked ? (
                                  <Lock size={18} />
                                ) : isPassed ? (
                                  <CheckCircle2 size={18} />
                                ) : (
                                  <PlayCircle size={18} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium leading-tight mb-1 ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                                  {module.order}.{index + 1}. {lesson.title}
                                </p>
                                
                                {isPassed && lesson.score !== null && (
                                  <p className="text-xs font-semibold text-green-600">
                                    Natija: {lesson.score}%
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                      {(!module.lessons || module.lessons.length === 0) && (
                        <p className="text-gray-400 text-xs italic py-2 pl-2">Bu modulda hozircha darslar yo'q.</p>
                      )}
                      </div>
                    </div>
                  </div>
                  );
                })}

                {(!course.modules || course.modules.length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">Bu kursda hozircha modullar yo'q.</p>
                )}

                {(course.modules && course.modules.length > 0) && (
                  <div className="pt-2 mt-4">
                    {course.has_certificate ? (
                      <Link
                        href={`/certificates/${course.certificate_id}`}
                        className="block rounded-xl border p-4 transition-all bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-300 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0 text-yellow-600">
                            <CheckCircle2 size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold leading-tight mb-1 text-yellow-900">
                              Sertifikat
                            </p>
                            <p className="text-xs font-medium text-yellow-700">
                              Siz ushbu kursni muvaffaqiyatli yakunladingiz!
                            </p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <Link 
                        href={course.user_progress_percent === 100 ? `/courses/${course.id}/final-test` : "#"}
                        className={`block rounded-xl border p-4 transition-all ${
                          course.user_progress_percent === 100
                            ? "bg-purple-50 border-purple-200 shadow-sm hover:shadow-md hover:border-purple-300"
                            : "bg-gray-50 border-gray-100 cursor-not-allowed opacity-75"
                        }`}
                        onClick={(e) => course.user_progress_percent !== 100 && e.preventDefault()}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex-shrink-0 ${course.user_progress_percent === 100 ? 'text-purple-600' : 'text-gray-400'}`}>
                            {course.user_progress_percent === 100 ? <ListChecks size={18} /> : <Lock size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold leading-tight mb-1 ${course.user_progress_percent === 100 ? 'text-purple-900' : 'text-gray-500'}`}>
                              Yakuniy Test
                            </p>
                            <p className={`text-xs ${course.user_progress_percent === 100 ? 'text-purple-700 font-medium' : 'text-gray-400'}`}>
                              {course.user_progress_percent === 100 ? "Sertifikat olish uchun testni ishlash" : "Barcha darslarni tugatgandan so'ng ochiladi"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Auth Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200 text-center">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
            >
              <X size={20} />
            </button>
            
            <div className="bg-blue-100 p-4 rounded-full text-blue-600 inline-flex mb-5 mt-2">
              <Lock size={28} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Tizimga kirish talab etiladi</h3>
            
            <p className="text-gray-600 mb-8 text-sm">
              Darslarni ko'rish va topshiriqlarni bajarish uchun tizimga kirishingiz yoki ro'yxatdan o'tishingiz kerak.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => router.push("/login")}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Tizimga kirish
              </button>
              <button 
                onClick={() => router.push("/register")}
                className="w-full px-4 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Ro'yxatdan o'tish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
