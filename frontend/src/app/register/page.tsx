"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { setTokens, apiFetch } from "@/lib/api";
import Link from "next/link";
import { UserPlus, Phone, User, Calendar } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    phone: "",
    full_name: "",
    birth_date: "",
    gender: "erkak",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Assume register doesn't return tokens directly in our logic, so we log in right away
        const loginRes = await fetch("http://localhost:8000/api/v1/auth/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formData.phone, password: formData.password }),
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          setTokens(data.access, data.refresh);
          
          const profileRes = await apiFetch("/auth/profile/");
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            login(profileData);
            router.push("/courses");
          }
        }
      } else {
        const data = await res.json();
        const errText = Object.values(data).flat().join(" ");
        setError(errText || "Xatolik yuz berdi.");
      }
    } catch (err) {
      setError("Server bilan ulanishda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 text-green-600 rounded-xl mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ro'yxatdan o'tish</h2>
          <p className="text-gray-500 mt-2 text-sm">Yangi profil yarating va o'qishni boshlang</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">F.I.SH</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="full_name"
                required
                placeholder="To'liq ismingiz"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqam</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="phone"
                required
                placeholder="+998901234567"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tug'ilgan sana</label>
              <div className="relative">
                <input
                  type="date"
                  name="birth_date"
                  required
                  className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.birth_date}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jinsi</label>
              <select
                name="gender"
                className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="erkak">Erkak</option>
                <option value="ayol">Ayol</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 mt-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Kutilmoqda..." : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Profil mavjudmi? </span>
          <Link href="/login" className="text-blue-600 font-medium hover:text-blue-500 transition-colors">
            Tizimga kiring
          </Link>
        </div>
      </div>
    </div>
  );
}
