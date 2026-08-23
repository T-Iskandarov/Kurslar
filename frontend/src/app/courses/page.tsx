import CourseListClient from "@/components/CourseListClient";

// 1 soatda bir marta yoki yangilanganda keshlashni yangilash
export const revalidate = 3600;

export default async function CoursesPage() {
  let initialCourses = [];
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://144.91.79.232:8000/api/v1";
    // Avoid apiFetch which might be client-side only (uses localStorage token)
    const res = await fetch(`${backendUrl}/courses/`, {
      next: { revalidate: 60 }
    });
    
    if (res.ok) {
      const data = await res.json();
      initialCourses = Array.isArray(data) ? data : (data.results || []);
    }
  } catch (error) {
    console.error("Failed to fetch courses:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <CourseListClient initialCourses={initialCourses} />
    </div>
  );
}
