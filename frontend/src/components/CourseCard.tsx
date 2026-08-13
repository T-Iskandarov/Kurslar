import Link from "next/link";
import { BookOpen, User, PlayCircle } from "lucide-react";

interface CourseProps {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  lessons_count: number;
  created_at: string;
}

export default function CourseCard({ course }: { course: CourseProps }) {
  // Use placeholder image if no thumbnail
  const imageUrl = course.thumbnail 
    ? course.thumbnail 
    : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="relative h-48 w-full overflow-hidden bg-gray-100 p-2">
          <img 
            src={imageUrl} 
            alt={course.title} 
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
          />

        </div>
        
        <div className="p-5">
          <h3 className="font-bold text-xl text-gray-900 leading-tight line-clamp-1 mb-1">{course.title}</h3>
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {course.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-5">
            <div className="flex items-center gap-1.5">
              <User size={16} className="text-gray-400" />
              <span>{course.students_count || 0} ta o'quvchi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen size={16} className="text-gray-400" />
              <span>{course.lessons_count} ta dars</span>
            </div>
          </div>
          
          <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
            Boshlash &rarr;
          </button>
        </div>
      </div>
    </Link>
  );
}
