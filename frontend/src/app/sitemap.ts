import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kurslarim.uz';

  // Basic routes
  const routes = [
    '',
    '/courses',
    '/verify',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch dynamic courses
  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://144.91.79.232:8000/api/v1";
    const res = await fetch(`${backendUrl}/courses/`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (res.ok) {
      const courses = await res.json();
      courseRoutes = courses.map((course: any) => ({
        url: `${baseUrl}/courses/${course.id}`,
        lastModified: new Date(course.updated_at || course.created_at || new Date()).toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch courses for sitemap:", error);
  }

  return [...routes, ...courseRoutes];
}
