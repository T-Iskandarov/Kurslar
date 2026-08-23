import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barcha kurslar",
  description: "IT, Dasturlash va Sun'iy intellekt bo'yicha masofaviy kurslar ro'yxati. O'zingizga qulay vaqtda mutaxassisga aylaning.",
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: "Barcha kurslar - Masofaviy Ta'lim Platformasi",
    description: "IT, Dasturlash va Sun'iy intellekt bo'yicha masofaviy kurslar ro'yxati.",
    url: "https://kurslarim.uz/courses",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Tursunpo'lat Iskandarov Kurslari",
      },
    ],
  },
  twitter: {
    title: "Barcha kurslar - Masofaviy Ta'lim Platformasi",
    description: "IT, Dasturlash va Sun'iy intellekt bo'yicha masofaviy kurslar ro'yxati.",
    images: ['/og-image.png'],
  }
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
