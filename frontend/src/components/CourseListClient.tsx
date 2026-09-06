"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import CourseCard from "@/components/CourseCard";
import { Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";

type SortOption = "date" | "lessons";

const categories = [
  { id: "all", label: "Barcha kurslar" },
  { id: "kompyuter_asoslari", label: "Kompyuter asoslari" },
  { id: "grafik_dizayn", label: "Grafik dizayn" },
  { id: "dasturlash", label: "Dasturlash" },
  { id: "suniy_intellekt", label: "Sun'iy intellekt" },
  { id: "robototexnika", label: "Robototexnika" },
];

export default function CourseListClient({ initialCourses }: { initialCourses: any[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [activeCategory, setActiveCategory] = useState("all");
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "date", label: "Ochilgan sanasiga qarab" },
    { value: "lessons", label: "Darslar soniga qarab" }
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label;

  const filteredAndSortedCourses = useMemo(() => {
    let result = initialCourses.filter((course: any) => 
      (course.title.toLowerCase().includes(search.toLowerCase()) || 
       course.description.toLowerCase().includes(search.toLowerCase())) &&
      (activeCategory === "all" || course.category === activeCategory)
    );

    result.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "lessons") {
        return b.lessons_count - a.lessons_count;
      }
      return 0;
    });

    return result;
  }, [initialCourses, search, sortBy, activeCategory]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Barcha <span className="text-blue-600">kurslar</span></h1>
          <p className="text-gray-500 mt-1">O'zingizga qiziq bo'lgan sohani tanlang va o'rganishni boshlang</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Custom Sort Dropdown */}
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full sm:w-64 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <div className="flex items-center text-gray-700">
                <SlidersHorizontal size={18} className="mr-2.5 text-gray-400" />
                <span className="text-sm font-medium">{currentSortLabel}</span>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 opacity-100 translate-y-0 transform origin-top transition-all">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <span className={sortBy === option.value ? 'font-semibold text-blue-700' : 'text-gray-700'}>
                      {option.label}
                    </span>
                    {sortBy === option.value && <Check size={16} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
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

      {/* Categories Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
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
