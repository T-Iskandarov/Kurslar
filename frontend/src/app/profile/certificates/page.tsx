"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { Award, Download, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { toast } from "react-hot-toast";

interface MyCertificate {
  id: number;
  certificate_id: string;
  user_name: string;
  course_title: string;
  issued_at: string;
  score: number;
}

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<MyCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await apiFetch("/auth/my-certificates/");
        if (res.ok) {
          const data = await res.json();
          setCertificates(data);
        } else {
          toast.error("Sertifikatlarni yuklashda xatolik yuz berdi");
        }
      } catch (err) {
        console.error(err);
        toast.error("Tarmoq xatosi");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
          <Award size={32} className="text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Hali sertifikatlar yo'q</h3>
        <p className="text-gray-500 max-w-md mb-8">
          Siz hali hech qanday kursni to'liq yakunlamagansiz. Kurslarni muvaffaqiyatli tugatib sertifikatlarga ega bo'ling!
        </p>
        <Link 
          href="/profile/courses"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Kurslarga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Sertifikatlarim</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* Certificate Header Graphic */}
            <div className="h-24 bg-gradient-to-r from-yellow-500 to-yellow-600 relative flex items-center px-6">
              <div className="absolute inset-0 bg-white/10 pattern-dots"></div>
              <Award size={48} className="text-white/20 absolute -right-4 -bottom-4 transform rotate-12" />
              <h3 className="text-white font-bold text-lg relative z-10 drop-shadow-sm line-clamp-1">
                {cert.course_title}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Sertifikat ID</span>
                  <span className="font-mono text-sm font-semibold text-gray-900">{cert.certificate_id}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Olingan sana</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    {format(new Date(cert.issued_at), "d MMMM, yyyy", { locale: uz })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Natija</span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    {cert.score}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Link 
                  href={`/certificates/${cert.certificate_id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  <ExternalLink size={16} />
                  Ko'rish
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
