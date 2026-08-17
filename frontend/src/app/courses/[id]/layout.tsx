import { Metadata } from "next";

// Fetch course details on the server for SEO metadata
async function getCourse(id: string) {
  try {
    // Need to use the full backend URL since this runs on the server (Vercel)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://144.91.79.232:8000/api/v1";
    const res = await fetch(`${backendUrl}/courses/${id}/`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch course for SEO:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const course = await getCourse(resolvedParams.id);

  if (!course) {
    return {
      title: "Kurs Topilmadi",
      description: "Bunday kurs tizimda mavjud emas.",
    };
  }

  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_URL || "http://144.91.79.232:8000";
  const imageUrl = course.thumbnail 
    ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${mediaBase}${course.thumbnail}`)
    : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

  return {
    title: course.title,
    description: course.description?.substring(0, 160) + (course.description?.length > 160 ? "..." : "") || "Masofaviy ta'lim platformasi",
    openGraph: {
      title: course.title,
      description: course.description?.substring(0, 160) || "Masofaviy ta'lim platformasi",
      url: `https://kurslarim.uz/courses/${resolvedParams.id}`,
      siteName: "Kurslarim",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
      locale: "uz_UZ",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: course.description?.substring(0, 160) || "Masofaviy ta'lim platformasi",
      images: [imageUrl],
    },
  };
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const course = await getCourse(resolvedParams.id);

  if (!course) {
    return <>{children}</>;
  }

  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_URL || "http://144.91.79.232:8000";
  const imageUrl = course.thumbnail 
    ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${mediaBase}${course.thumbnail}`)
    : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

  // Structured Data for Google (Course Schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "Kurslarim",
      "sameAs": "https://kurslarim.uz"
    },
    "image": imageUrl,
    "url": `https://kurslarim.uz/courses/${params.id}`,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "instructor": {
        "@type": "Person",
        "name": "Tursunpo'lat Iskandarov"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
