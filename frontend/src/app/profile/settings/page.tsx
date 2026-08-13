"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Save, User, Calendar, Phone } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user, login } = useAuth(); // Need login to update local context, but AuthContext might not support update directly without relog.
  // Wait, AuthContext handles login(data). If we update profile, we might just reload the window or have a custom updateUser function.
  // We'll just do a window.location.reload() or manually update user if context has it. Since we can't change AuthContext directly here without knowing its structure, let's see.
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    gender: user?.gender || "",
    birth_date: user?.birth_date || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await apiFetch("/auth/profile/", {
        method: "PATCH",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Ma'lumotlar muvaffaqiyatli saqlandi!");
        // Small delay then reload to update sidebar
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const data = await res.json();
        toast.error(data.detail || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
        <p className="text-gray-500 mt-1">Shaxsiy ma'lumotlaringizni tahrirlang</p>
      </div>

      <div className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon raqam
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                disabled
                value={user.phone}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Telefon raqamni o'zgartirib bo'lmaydi</p>
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              Ism va familiya
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Masalan: Tursunpo'lat Iskandarov"
              />
            </div>
          </div>

          <div>
            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
              Tug'ilgan sana
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jinsingiz
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`
                border rounded-xl p-4 flex items-center cursor-pointer transition-colors
                ${formData.gender === 'erkak' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}
              `}>
                <input
                  type="radio"
                  name="gender"
                  value="erkak"
                  checked={formData.gender === 'erkak'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-medium text-sm text-center w-full">Erkak</span>
              </label>
              <label className={`
                border rounded-xl p-4 flex items-center cursor-pointer transition-colors
                ${formData.gender === 'ayol' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 hover:bg-gray-50'}
              `}>
                <input
                  type="radio"
                  name="gender"
                  value="ayol"
                  checked={formData.gender === 'ayol'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-medium text-sm text-center w-full">Ayol</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={18} />
              )}
              Saqlash
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
