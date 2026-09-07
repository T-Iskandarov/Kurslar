"use client";

import { useState, useMemo } from "react";
import CourseCard from "@/components/CourseCard";
import { Search, LayoutGrid, Monitor, Palette, Code, BrainCircuit, Cpu } from "lucide-react";

const categories = [
  { id: "all", label: "Barcha kurslar", icon: LayoutGrid, color: "text-blue-600", bg: "bg-blue-100" },
  { id: "kompyuter_asoslari", label: "Kompyuter asoslari", icon: Monitor, color: "text-emerald-600", bg: "bg-emerald-100" },
  { id: "grafik_dizayn", label: "Grafik dizayn", icon: Palette, color: "text-purple-600", bg: "bg-purple-100" },
  { id: "dasturlash", label: "Dasturlash", icon: Code, color: "text-indigo-600", bg: "bg-indigo-100" },
  { id: "suniy_intellekt", label: "Sun'iy intellekt", icon: BrainCircuit, color: "text-rose-600", bg: "bg-rose-100" },
  { id: "robototexnika", label: "Robototexnika", icon: Cpu, color: "text-amber-600", bg: "bg-amber-100" },
];

export default function CourseListClient({ initialCourses }: { initialCourses: any[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialCourses.length };
    categories.slice(1).forEach(cat => {
      counts[cat.id] = initialCourses.filter(c => c.category === cat.id).length;
    });
    return counts;
  }, [initialCourses]);

  const filteredAndSortedCourses = useMemo(() => {
    let result = initialCourses.filter((course: any) => 
      (course.title.toLowerCase().includes(search.toLowerCase()) || 
       course.description.toLowerCase().includes(search.toLowerCase())) &&
      (activeCategory === "all" || course.category === activeCategory)
    );

    result.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [initialCourses, search, activeCategory]);


  const activeCatObj = categories.find(c => c.id === activeCategory) || categories[0];
  
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {activeCategory === "all" ? (
              <>Barcha <span className="text-blue-600">kurslar</span></>
            ) : (
              <>{activeCatObj.label} <span className={activeCatObj.color}>kurslari</span></>
            )}
          </h1>
          <p className="text-gray-500 mt-1">O'zingizga qiziq bo'lgan sohani tanlang va o'rganishni boshlang</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
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

      {/* Categories Tabs */}
      <div className="flex justify-center w-full mb-8">
        <div className="inline-flex overflow-x-auto p-1.5 bg-white border border-gray-100 shadow-sm rounded-2xl gap-1 hide-scrollbar max-w-full">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] || 0;
            const isActive = activeCategory === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className={`p-1.5 rounded-full ${cat.bg}`}>
                  <Icon size={16} className={cat.color} />
                </div>
                {cat.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                  isActive 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
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
          <p className="text-gray-500 mt-1">Ushbu bo'limda yoki siz qidirgan nomda kurs afsuski mavjud emas.</p>
        </div>
      )}
    </>
  );
}
