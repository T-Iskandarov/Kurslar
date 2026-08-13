"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminCourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await apiFetch(`/admin/courses/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || "");
          setDescription(data.description || "");
          if (data.thumbnail) {
            setThumbnailPreview(data.thumbnail);
          }
        } else {
          setError("Kurs ma'lumotlarini yuklashda xatolik yuz berdi.");
        }
      } catch (err) {
        console.error(err);
        setError("Tarmoq xatosi yuz berdi.");
      } finally {
        setFetching(false);
      }
    };
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    
    // Only append thumbnail if a NEW file was selected.
    // If not selected, we don't send it, so backend keeps the existing one.
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      const res = await apiFetch(`/admin/courses/${id}/`, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        router.push("/admin/courses");
      } else {
        const data = await res.json();
        setError(data.detail || "Xatolik yuz berdi. Iltimos tekshirib qayta urinib ko'ring.");
      }
    } catch (err) {
      setError("Tarmoq xatosi yuz berdi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/courses" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kursni tahrirlash</h1>
          <p className="text-gray-500 mt-1">Kurs ma'lumotlarini o'zgartirish</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Kurs nomi
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="Masalan: Front-End dasturlash kursi"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Kurs haqida ma'lumot (ta'rif)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Kurs haqida to'liq ma'lumot kiriting..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kurs rasmi (Thumbnail)
              </label>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 h-32 w-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center relative group">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon size={32} className="mb-2" />
                      <span className="text-xs">Rasm yuklanmagan</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="pt-2">
                  <label htmlFor="thumbnail" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors inline-block mb-2">
                    Rasmni o'zgartirish
                  </label>
                  <p className="text-xs text-gray-500">
                    Tavsiya etilgan o'lcham: 1280x720 (16:9).<br />
                    Maksimal hajm: 5MB. JPG yoki PNG.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/courses")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 mr-4 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={20} />
              )}
              O'zgarishlarni saqlash
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-blue-900">Darslar va Videolar</h3>
          <p className="text-blue-700 text-sm mt-1">Ushbu kursga yangi darslar qo'shish, mavjudlarini tahrirlash va test savollarini boshqarish</p>
        </div>
        <Link 
          href={`/admin/courses/${id}/lessons`}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Darslarni boshqarish &rarr;
        </Link>
      </div>
    </div>
  );
}
