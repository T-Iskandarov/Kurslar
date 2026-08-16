"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, MEDIA_BASE_URL } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, PlayCircle, FileText, Download, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await apiFetch(`/lessons/${params.id}/`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data);
        } else {
          // If locked or unauthorized
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link href={`/courses/${lesson.course_id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 font-medium text-sm">
        <ArrowLeft size={16} />
        Kursga qaytish
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Video Player */}
        <div className="relative w-full aspect-video bg-gray-900">
          {lesson.youtube_video_id ? (
            <iframe
              src={`https://www.youtube.com/embed/${lesson.youtube_video_id}`}
              title={lesson.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              Video mavjud emas
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-3">
            <PlayCircle size={16} />
            <span>{lesson.order}-dars</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-6">{lesson.title}</h1>

          {lesson.content && (
            <div className="prose prose-blue max-w-none text-gray-600 mb-8 whitespace-pre-wrap">
              {lesson.content}
            </div>
          )}

          {lesson.resources && lesson.resources.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Qo'shimcha resurslar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.resources.map((resource: any) => {
                  const fileUrl = resource.file.startsWith('http') 
                    ? resource.file 
                    : `${MEDIA_BASE_URL}${resource.file}`;
                  
                  return (
                    <a
                      key={resource.id}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-xl transition-colors group"
                    >
                      <div className="bg-white p-2 rounded-lg text-emerald-600 shadow-sm mr-4 group-hover:bg-emerald-100 transition-colors">
                        <Download size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{resource.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Yuklab olish &rarr;</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a 
                href={`https://t.me/T_Iskandarov_kurslar_bot?text=${encodeURIComponent(`Talaba: ${user?.full_name || 'Noma\'lum'}\nKurs: ${lesson.course_title}\nDars: ${lesson.title}\n\nSavolim: `)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0088cc] hover:bg-[#0077b5] text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                <MessageCircle size={20} />
                <span className="hidden sm:inline">Savol berish (Telegram)</span>
                <span className="sm:hidden">Savol berish</span>
              </a>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
              <Link
                href={`/lessons/${lesson.id}/test`}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm text-center"
              >
                Testni ishlash
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
