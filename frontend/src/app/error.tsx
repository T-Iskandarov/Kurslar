"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div className="w-24 h-24 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={48} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Kutilmagan xatolik!</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
          Kechirasiz, sahifani yuklashda qandaydir muammo yuz berdi. Iltimos, birozdan so'ng qayta urinib ko'ring yoki bosh sahifaga qayting.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-yellow-500 text-white font-medium rounded-xl hover:bg-yellow-600 transition-colors shadow-sm shadow-yellow-200"
          >
            <RotateCcw size={18} />
            Qayta urinish
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Home size={18} />
            Bosh sahifaga
          </Link>
        </div>
        
        <p className="text-xs text-gray-400 mt-8 font-mono">
          Xato kodi: {error.digest || error.message?.slice(0, 50) || "Noma'lum"}
        </p>
      </div>
    </div>
  );
}
