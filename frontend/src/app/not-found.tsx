"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={48} />
        </div>
        
        <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Sahifa topilmadi</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
          Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan bo'lishi mumkin.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
            Orqaga qaytish
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <Home size={18} />
            Bosh sahifaga
          </Link>
        </div>
      </div>
    </div>
  );
}
