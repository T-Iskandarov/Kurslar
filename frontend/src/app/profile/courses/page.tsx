"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, CheckCircle2, PlayCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface MyCourse {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  progress_percent: number;
  is_completed: boolean;
  total_lessons: number;
  passed_lessons: number;
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch("/auth/my-courses/");
        if (res.ok) {
          const data = await res.json();
          const startedCourses = data.filter((course: MyCourse) => course.progress_percent > 0 || course.passed_lessons > 0);
          setCourses(startedCourses);
        } else {
          toast.error("Kurslarni yuklashda xatolik yuz berdi");
        }
      } catch (err) {
        console.error(err);
        toast.error("Tarmoq xatosi");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <BookOpen size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Hali kurslar yo'q</h3>
        <p className="text-gray-500 max-w-md mb-8">
          Siz hali hech qanday kursni boshlamagansiz. Bilim olishni hozirdan boshlang!
        </p>
        <Link 
          href="/courses"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Kurslarni ko'rish
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mening kurslarim</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">
            {/* Completion Badge */}
            {course.is_completed && (
              <div className="absolute top-3 right-3 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <CheckCircle2 size={14} />
                Tugatilgan
              </div>
            )}
            
            <Link href={`/courses/${course.id}`} className="block relative aspect-video bg-gray-100 overflow-hidden">
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <BookOpen size={48} />
                </div>
              )}
              {/* Overlay for hover effect */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white text-gray-900 rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  <PlayCircle size={24} />
                </div>
              </div>
            </Link>
            
            <div className="p-5 flex flex-col flex-1">
              <Link href={`/courses/${course.id}`}>
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
              </Link>
              
              <div className="mt-auto pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
                  <span>Jarayon</span>
                  <span className={course.is_completed ? "text-green-600 font-bold" : "text-blue-600 font-bold"}>
                    {course.progress_percent}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${course.is_completed ? 'bg-green-500' : 'bg-blue-600'}`}
                    style={{ width: `${course.progress_percent}%` }}
                  ></div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  {course.total_lessons} ta darsdan {course.passed_lessons} tasi o'zlashtirildi
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
