"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, X, FileText, Download } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminLessonResourcesPage() {
  const params = useParams();
  const id = params.id; // lesson_id

  const [lesson, setLesson] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLesson = async () => {
    try {
      const res = await apiFetch(`/admin/lessons/${id}/`);
      if (res.ok) {
        const data = await res.json();
        setLesson(data);
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLesson();
  }, [id]);

  const resetForm = () => {
    setTitle("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowAddForm(false);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleDelete = async (resourceId: number) => {
    if (!confirm("Haqiqatan ham bu faylni o'chirmoqchimisiz?")) return;
    try {
      const res = await apiFetch(`/admin/resources/${resourceId}/`, { method: "DELETE" });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Fayl nomini kiriting!");
      return;
    }
    
    if (!file) {
      alert("Faylni tanlang!");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      const res = await apiFetch(`/admin/lessons/${id}/resources/`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const newResource = await res.json();
        setResources((prev) => [...prev, newResource]);
        resetForm();
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      alert("Tarmoq xatosi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={lesson?.course_id ? `/admin/courses/${lesson.course_id}/lessons` : "/admin/courses"} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dars Resurslari</h1>
            <p className="text-gray-500 mt-1">{lesson?.title || "Dars"}</p>
          </div>
        </div>
        {!showAddForm && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
            Fayl qo'shish
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 mb-8 relative">
          <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Yangi fayl yuklash
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fayl nomi</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none font-medium text-gray-900"
                placeholder="Masalan: Qo'shimcha qo'llanma.pdf"
              />
            </div>
            
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <label className="block text-sm font-medium text-gray-900 mb-2">Faylni tanlang</label>
              <input
                type="file"
                required
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-3">PDF, DOCX, ZIP kabi barcha formatlar qo'llab-quvvatlanadi.</p>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={18} />
                )}
                Faylni yuklash
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {resources.length === 0 && !showAddForm && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Fayllar yo'q</h3>
            <p className="text-gray-500 mb-4">Ushbu dars uchun hali qo'shimcha resurslar yuklanmagan.</p>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
            >
              <Plus size={20} />
              Birinchi faylni yuklash
            </button>
          </div>
        )}
        
        {resources.map((resource) => {
          const fileUrl = resource.file.startsWith('http') 
            ? resource.file 
            : `http://127.0.0.1:8000${resource.file}`;
            
          return (
            <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-between p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{resource.title}</h3>
                  <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    <Download size={12} />
                    Faylni ko'rish/yuklash
                  </a>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(resource.id)}
                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="O'chirish"
              >
                <Trash2 size={20} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
