"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Download, CheckCircle2, ShieldCheck } from "lucide-react";
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg shadow-sm transition-colors"
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
          className="bg-white shadow-2xl relative overflow-hidden print:shadow-none flex flex-col shrink-0"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-4 bg-yellow-600"></div>
          <div className="absolute top-4 left-0 w-full h-1 bg-yellow-400"></div>
          <div className="absolute bottom-0 left-0 w-full h-4 bg-yellow-600"></div>
          <div className="absolute bottom-4 left-0 w-full h-1 bg-yellow-400"></div>
          
          {/* Corner Decorations */}
          <div className="absolute top-10 left-10 w-20 h-20 border-t-4 border-l-4 border-yellow-600 opacity-30"></div>
          <div className="absolute top-10 right-10 w-20 h-20 border-t-4 border-r-4 border-yellow-600 opacity-30"></div>
          <div className="absolute bottom-10 left-10 w-20 h-20 border-b-4 border-l-4 border-yellow-600 opacity-30"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 border-b-4 border-r-4 border-yellow-600 opacity-30"></div>

          <div className="flex-1 flex flex-col items-center justify-center p-12 pb-14 text-center relative z-10">
            <div className="mb-4 flex items-center justify-center w-20 h-20 bg-yellow-50 rounded-full border border-yellow-200">
              <ShieldCheck size={40} className="text-yellow-600" />
            </div>
            
            <h1 className="text-6xl font-serif font-bold text-gray-900 mb-2 uppercase tracking-wider">
              Sertifikat
            </h1>
            <p className="text-base text-yellow-600 uppercase tracking-widest font-semibold mb-8">
              Muvaffaqiyatli yakunlaganlik uchun
            </p>
            
            <p className="text-gray-600 text-lg mb-2">Ushbu sertifikat</p>
            <h2 className="text-5xl font-serif font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2 px-12 inline-block">
              {cert.user_name}
            </h2>
            
            <p className="text-gray-600 text-lg mb-2">ga quyidagi kursni muvaffaqiyatli tugatganligi uchun berildi:</p>
            <h3 className="text-3xl font-bold text-gray-800 mb-auto max-w-2xl line-clamp-2">
              "{cert.course_title}"
            </h3>
            
            <div className="flex justify-between items-center w-full max-w-4xl mt-12 border-t border-gray-200 pt-6 px-8">
              <div className="text-left flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Berilgan sana</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(cert.issued_at), "d MMMM yyyy", { locale: uz })}
                </p>
              </div>
              
              <div className="text-center flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Natija</p>
                <p className="font-semibold text-gray-900 text-xl">{cert.score}%</p>
              </div>
              
              <div className="text-right flex-1 flex justify-end items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">ID Raqam</p>
                  <p className="font-mono font-semibold text-gray-900 text-sm">{cert.certificate_id}</p>
                </div>
                <div className="flex items-center justify-center bg-white p-1 border border-gray-200 rounded shadow-sm">
                  <img src={qrCodeUrl} alt="QR Code for verification" className="w-14 h-14" />
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
