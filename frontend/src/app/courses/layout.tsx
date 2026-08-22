import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barcha kurslar | Tursunpo'lat Iskandarov",
  description: "Barcha IT, Dasturlash, va Sun'iy intellekt bo'yicha masofaviy kurslar ro'yxati. O'zingizga qulay vaqtda, sifatli darsliklar orqali mutaxassisga aylaning.",
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: "Barcha kurslar - Masofaviy Ta'lim Platformasi",
    description: "Barcha IT, Dasturlash, va Sun'iy intellekt bo'yicha masofaviy kurslar ro'yxati.",
    url: "https://kurslarim.uz/courses",
  }
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
