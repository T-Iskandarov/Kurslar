"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { Search, CheckCircle, XCircle, ShieldCheck, Calendar, BookOpen, User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || "";
  
  const [certId, setCertId] = useState(initialId);
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    
    setLoading(true);
    setError(null);
    setSearched(true);
    setCert(null);
    
    try {
      const res = await apiFetch(`/certificates/verify/${idToVerify.trim().toUpperCase()}/`);
      if (res.ok) {
        const data = await res.json();
        setCert(data.certificate);
      } else {
        setError("Sertifikat topilmadi yoki haqiqiy emas.");
      }
    } catch (err) {
      console.error(err);
      setError("Tarmoq xatosi yuz berdi. Iltimos keyinroq qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleVerify(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(certId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" />
            Tursunpo'lat Iskandarov
          </Link>
          <Link href="/courses" className="text-gray-600 hover:text-gray-900 font-medium">
            Kurslar
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-16 px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Sertifikatni Tekshirish</h1>
            <p className="text-lg text-gray-600">Sertifikat haqiqiyligini uning ID raqami yordamida tekshiring.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value.toUpperCase())}
                    placeholder="Masalan: ABCD-1234"
                    className="block w-full pl-11 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono tracking-widest uppercase transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center whitespace-nowrap text-lg"
                >
                  {loading ? (
                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Tekshirish"
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {searched && !loading && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {cert ? (
                <div className="bg-white rounded-2xl shadow-md border-t-4 border-t-green-500 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Haqiqiy Sertifikat</h2>
                    <p className="text-center text-green-600 font-medium mb-8">Bu sertifikat platformamiz tomonidan rasman berilgan.</p>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-4">
                        <User className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 uppercase">Sertifikat egasi</p>
                          <p className="text-lg font-bold text-gray-900">{cert.user_name}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-4">
                        <BookOpen className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 uppercase">Kurs nomi</p>
                          <p className="text-lg font-bold text-gray-900">{cert.course_title}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-4">
                          <Calendar className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-500 uppercase">Berilgan sana</p>
                            <p className="text-lg font-bold text-gray-900">{format(new Date(cert.issued_at), "d MMMM yyyy", { locale: uz })}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-4">
                          <ShieldCheck className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-500 uppercase">Natija / ID</p>
                            <p className="text-lg font-bold text-gray-900">{cert.score}% <span className="text-gray-400 font-normal">|</span> <span className="font-mono text-blue-600">{cert.certificate_id}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-center">
                    <Link href={`/certificates/${cert.certificate_id}`} className="text-blue-600 font-medium hover:text-blue-800 transition-colors inline-flex items-center gap-2">
                      Sertifikatni ko'rish
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-white rounded-2xl shadow-sm border-t-4 border-t-red-500 p-8 text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6 mx-auto">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Topilmadi</h2>
                  <p className="text-red-600 font-medium mb-4">{error}</p>
                  <p className="text-gray-500">ID raqamini tekshirib, qaytadan urinib ko'ring. Format: XXXX-XXXX</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Yuklanmoqda...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
