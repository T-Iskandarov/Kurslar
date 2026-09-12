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
          {/* Main Content Container - Centered nicely */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-between w-full h-full pt-[45px] pb-[75px] px-[80px]">
            
            {/* TOP SECTION (Logos to Course Title) */}
            <div className="flex flex-col items-center w-full">
              {/* Logos */}
              <div className="flex items-center justify-center gap-6 h-[45px] mb-[15px]">
                <img src="/certificates/cubo-logo.png" alt="Cubo" className="h-[40px] object-contain" />
                <div className="h-[35px] w-px bg-gray-300"></div>
                <img src="/certificates/kurslarim-logo.png" alt="Kurslarim.uz" className="h-[38px] object-contain" />
              </div>

              {/* Title */}
              <h1 className="text-[55px] leading-tight font-serif font-bold text-[#081a54] mb-2 tracking-wider uppercase">
                Sertifikat
              </h1>
              
              {/* Subtitle */}
              <div className="flex items-center justify-center gap-4 w-full mb-[35px]">
                <div className="h-px bg-[#081a54] w-[120px]"></div>
                <p className="text-[13px] text-[#081a54] uppercase tracking-[0.2em] font-semibold">
                  Muvaffaqiyatli yakunlaganlik uchun
                </p>
                <div className="h-px bg-[#081a54] w-[120px]"></div>
              </div>
              
              <p className="text-gray-500 text-[15px] mb-2 font-medium">Ushbu sertifikat</p>
              
              <div className="relative w-full max-w-[700px] flex flex-col items-center mb-6">
                <h2 className="text-[44px] leading-tight font-serif font-bold text-[#081a54] px-8 text-center z-10 bg-transparent">
                  {cert.user_name}
                </h2>
                {/* Absolute line under text so it has fixed max width */}
                <div className="w-full max-w-[600px] h-px bg-gray-400 mt-2"></div>
              </div>
              
              <p className="text-gray-500 text-[15px] mb-2 font-medium">quyidagi kursni muvaffaqiyatli tugatganligi uchun berildi:</p>
              <h3 className="text-[34px] font-bold text-[#1d4ed8] text-center max-w-[700px] leading-snug">
                "{cert.course_title}"
              </h3>
            </div>

            {/* BOTTOM SECTION */}
            <div className="w-full flex flex-col justify-end flex-1">
              
              {/* INFO ROW */}
              <div className="flex justify-center items-center gap-[50px] w-full mb-[30px]">
                {/* Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#3b82f6]" size={36} strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Berilgan sana</p>
                    <p className="font-bold text-[#081a54] text-[16px]">
                      {format(new Date(cert.issued_at), "d MMMM yyyy", { locale: uz })}
                    </p>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-gray-300"></div>
                
                {/* Result */}
                <div className="flex items-center gap-3">
                  <BarChart className="text-[#3b82f6]" size={36} strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Natija</p>
                    <p className="font-bold text-[#081a54] text-[16px]">{cert.score}%</p>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-gray-300"></div>
                
                {/* ID */}
                <div className="flex items-center gap-3">
                  <FileText className="text-[#3b82f6]" size={36} strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">ID Raqam</p>
                    <p className="font-bold text-[#081a54] text-[16px] uppercase">{cert.certificate_id}</p>
                  </div>
                </div>
              </div>

              {/* SIGNATURE, STAMP AND QR */}
              <div className="flex justify-between items-end w-full px-[20px]">
                
                {/* Left: Signature & Stamp */}
                <div className="flex items-end relative ml-[60px]">
                  <div className="flex flex-col items-center w-[160px] z-10">
                    <img src="/certificates/imzo.png" alt="Imzo" className="h-[55px] object-contain -mb-1" />
                    <div className="w-full h-px bg-gray-400 mb-1"></div>
                    <p className="font-bold text-[#081a54] text-[13px]">CUBO MCHJ</p>
                    <p className="text-gray-500 text-[11px]">Direktor</p>
                  </div>
                  <img src="/certificates/pechat-sifatlisi.png" alt="Pechat" className="h-[110px] w-[110px] object-contain absolute left-[60px] top-[-40px] opacity-90 mix-blend-multiply pointer-events-none z-20" />
                </div>

                {/* Right: QR Code */}
                <div className="bg-white p-1.5 border border-gray-200 rounded-md shadow-sm mb-2">
                  <img src={qrCodeUrl} alt="QR Code" className="w-[65px] h-[65px]" />
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
