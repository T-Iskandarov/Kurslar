"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Download, Calendar, BarChart, FileText } from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { toast } from "react-hot-toast";
import * as htmlToImage from "html-to-image";

export default function CertificatePage() {
  const params = useParams();
  const id = params.id as string; // certificate_id
  
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await apiFetch(`/certificates/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setCert(data);
        } else {
          setError("Sertifikat topilmadi yoki yaroqsiz.");
        }
      } catch (err) {
        console.error(err);
        setError("Tarmoq xatosi");
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  const handleDownload = async () => {
    if (!certificateRef.current || downloading) return;
    
    setDownloading(true);
    const toastId = toast.loading("Sertifikat rasmga aylanmoqda. Iltimos kuting...");
    
    try {
      const element = certificateRef.current;
      
      const image = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 2, // High resolution
        backgroundColor: "#ffffff",
      });
      
      const link = document.createElement("a");
      link.download = `Sertifikat-${cert?.user_name?.replace(/\s+/g, "_") || id}.png`;
      link.href = image;
      link.click();
      
      toast.success("Sertifikat muvaffaqiyatli saqlandi!", { id: toastId });
    } catch (err) {
      console.error("Rasmga olishda xatolik:", err);
      toast.error("Xatolik: Rasmni yuklab olish imkoni bo'lmadi.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a8a]"></div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Xatolik</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link href="/courses" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
          Asosiy sahifaga qaytish
        </Link>
      </div>
    );
  }

  const verificationUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify?id=${cert.certificate_id}` : `https://example.com/verify?id=${cert.certificate_id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0 print:px-0 flex flex-col items-center">
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center print:hidden">
        <Link href="/courses" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium">
          <ArrowLeft size={16} />
          Kurslarga qaytish
        </Link>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg shadow-sm transition-colors"
        >
          <Download size={18} />
          Sertifikatni yuklab olish
        </button>
      </div>

      {/* Certificate Container Wrapper for Mobile */}
      <div className="w-full max-w-full overflow-x-auto pb-8 flex justify-start md:justify-center">
        <div 
          ref={certificateRef}
          style={{ width: '1000px', minWidth: '1000px', height: '707px', minHeight: '707px' }}
          className="bg-white shadow-2xl relative overflow-hidden print:shadow-none flex flex-col shrink-0 bg-[url('/certificates/sertifikat_background.png')] bg-cover bg-center"
        >
          {/* Main Content Container - Positioned absolutely to match the background design */}
          <div className="absolute inset-0 z-10 flex flex-col items-center pt-[55px] px-[80px]">
            
            {/* Logos */}
            <div className="flex items-center justify-center gap-6 h-[40px]">
              <img src="/certificates/cubo-logo.png" alt="Cubo" className="h-full object-contain" />
              <div className="h-full w-px bg-gray-300"></div>
              <img src="/certificates/kurslarim-logo.png" alt="Kurslarim.uz" className="h-full object-contain" />
            </div>

            {/* Title */}
            <h1 className="text-[60px] leading-tight font-serif font-bold text-[#0a195c] mt-[10px] mb-1 tracking-wider uppercase">
              Sertifikat
            </h1>
            
            {/* Subtitle */}
            <div className="flex items-center gap-4 mb-[40px]">
              <div className="h-px bg-[#0a195c] w-12"></div>
              <p className="text-sm text-[#0a195c] uppercase tracking-widest font-semibold">
                Muvaffaqiyatli yakunlaganlik uchun
              </p>
              <div className="h-px bg-[#0a195c] w-12"></div>
            </div>
            
            <p className="text-gray-500 text-base mb-1 font-medium">Ushbu sertifikat</p>
            <h2 className="text-[46px] leading-tight font-serif font-bold text-[#0a195c] mb-6 border-b border-gray-400 pb-2 px-16 inline-block min-w-[500px] text-center">
              {cert.user_name}
            </h2>
            
            <p className="text-gray-500 text-base mb-2 font-medium">quyidagi kursni muvaffaqiyatli tugatganligi uchun berildi:</p>
            <h3 className="text-4xl font-bold text-[#2563eb] mb-auto max-w-2xl text-center line-clamp-2">
              "{cert.course_title}"
            </h3>
            
            {/* Bottom Section */}
            <div className="w-[840px] absolute bottom-[90px] left-[80px] flex flex-col gap-6">
              
              {/* Info Row & QR Code */}
              <div className="flex items-center justify-between">
                {/* 3 Info Items */}
                <div className="flex items-center gap-6 flex-1">
                  
                  {/* Date */}
                  <div className="flex items-center gap-3">
                    <Calendar className="text-blue-500" size={32} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Berilgan sana</p>
                      <p className="font-bold text-[#0a195c] text-sm">
                        {format(new Date(cert.issued_at), "d MMMM yyyy", { locale: uz })}
                      </p>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-gray-200"></div>

                  {/* Result */}
                  <div className="flex items-center gap-3">
                    <BarChart className="text-blue-500" size={32} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Natija</p>
                      <p className="font-bold text-[#0a195c] text-sm">{cert.score}%</p>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-gray-200"></div>

                  {/* ID */}
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-500" size={32} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">ID Raqam</p>
                      <p className="font-bold text-[#0a195c] text-sm">{cert.certificate_id}</p>
                    </div>
                  </div>
                  
                </div>

                <div className="h-10 w-px bg-gray-200 mx-6"></div>

                {/* QR Code */}
                <div className="flex-shrink-0 bg-white p-1.5 border border-gray-200 rounded-lg shadow-sm">
                  <img src={qrCodeUrl} alt="QR Code" className="w-[60px] h-[60px]" />
                </div>
              </div>

              {/* Signature & Stamp */}
              <div className="flex items-end mt-2">
                <div className="flex items-end">
                  <div className="flex flex-col items-center w-40">
                    <img src="/certificates/imzo.png" alt="Imzo" className="h-[60px] w-auto object-contain -mb-2 z-10" />
                    <div className="w-full h-px bg-gray-400 mb-1"></div>
                    <p className="font-bold text-[#0a195c] text-sm">CUBO MCHJ</p>
                    <p className="text-gray-500 text-xs">Direktor</p>
                  </div>
                  <img src="/certificates/pechat-sifatlisi.png" alt="Pechat" className="h-[90px] w-[90px] object-contain ml-4 -mb-4 opacity-90 mix-blend-multiply" />
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
      
      {/* Verify Instructions (hidden on print) */}
      <div className="w-full max-w-5xl mt-8 text-center text-gray-500 text-sm print:hidden">
        <p>Sertifikat haqiqiyligini tekshirish uchun QR kodni skanerlang yoki saytning <Link href="/verify" className="text-blue-600 hover:underline">tekshirish bo'limiga</Link> kirib, ID raqamni kiriting.</p>
      </div>
    </div>
  );
}
