"use client";

import { useState, useMemo } from "react";
import CourseCard from "@/components/CourseCard";
import { Search, SlidersHorizontal } from "lucide-react";

type SortOption = "alphabetical" | "date" | "lessons";

export default function CourseListClient({ initialCourses }: { initialCourses: any[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");

  const filteredAndSortedCourses = useMemo(() => {
    let result = initialCourses.filter((course: any) => 
      course.title.toLowerCase().includes(search.toLowerCase()) || 
      course.description.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "lessons") {
        return b.lessons_count - a.lessons_count;
      }
      return 0;
    });

    return result;
  }, [initialCourses, search, sortBy]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Barcha <span className="text-blue-600">kurslar</span></h1>
          <p className="text-gray-500 mt-1">O'zingizga qiziq bo'lgan sohani tanlang va o'rganishni boshlang</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto flex items-center gap-2">
            <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-200 w-full">
              <SlidersHorizontal size={18} className="mr-2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer appearance-none pr-4 w-full"
              >
                <option value="alphabetical">Alifbo bo'yicha</option>
                <option value="date">Ochilgan sanasiga qarab</option>
                <option value="lessons">Darslar soniga qarab</option>
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-64 lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Kurslarni qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {filteredAndSortedCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedCourses.map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 text-gray-400 rounded-full mb-4">
            <Search size={24} />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Kurslar topilmadi</h2>
          <p className="text-gray-500 mt-1">Siz qidirgan nomda kurs afsuski mavjud emas.</p>
        </div>
      )}
    </>
  );
}
