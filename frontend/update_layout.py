import re

with open('c:\\Users\\CUBO\\Desktop\\Vazifa\\frontend\\src\\app\\certificates\\[id]\\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_inner = '''{/* Main Content Container - Centered nicely */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-between w-full h-full pt-[45px] pb-[75px] px-[80px]">
            
            {/* TOP SECTION (Logos to Course Title) */}
            <div className="flex flex-col items-center w-full">
              {/* Logos */}
              <div className="flex items-center justify-center gap-6 h-[40px] mb-[15px]">
                <img src="/certificates/cubo-logo.png" alt="Cubo" className="h-[35px] object-contain" />
                <div className="h-[30px] w-px bg-gray-300"></div>
                <img src="/certificates/kurslarim-logo.png" alt="Kurslarim.uz" className="h-[25px] object-contain" />
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
                  <Calendar className="text-[#3b82f6]" size={28} strokeWidth={1.5} />
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Berilgan sana</p>
                    <p className="font-bold text-[#081a54] text-[13px]">
                      {format(new Date(cert.issued_at), "d MMMM yyyy", { locale: uz })}
                    </p>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-gray-300"></div>
                
                {/* Result */}
                <div className="flex items-center gap-3">
                  <BarChart className="text-[#3b82f6]" size={28} strokeWidth={1.5} />
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Natija</p>
                    <p className="font-bold text-[#081a54] text-[13px]">{cert.score}%</p>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-gray-300"></div>
                
                {/* ID */}
                <div className="flex items-center gap-3">
                  <FileText className="text-[#3b82f6]" size={28} strokeWidth={1.5} />
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">ID Raqam</p>
                    <p className="font-bold text-[#081a54] text-[13px] uppercase">{cert.certificate_id}</p>
                  </div>
                </div>
              </div>

              {/* SIGNATURE, STAMP AND QR */}
              <div className="flex justify-between items-end w-full px-[20px]">
                
                {/* Left: Signature & Stamp */}
                <div className="flex items-end relative">
                  <div className="flex flex-col items-center w-[160px] z-10">
                    <img src="/certificates/imzo.png" alt="Imzo" className="h-[55px] object-contain -mb-1" />
                    <div className="w-full h-px bg-gray-400 mb-1"></div>
                    <p className="font-bold text-[#081a54] text-[13px]">CUBO MCHJ</p>
                    <p className="text-gray-500 text-[11px]">Direktor</p>
                  </div>
                  <img src="/certificates/pechat-sifatlisi.png" alt="Pechat" className="h-[95px] w-[95px] object-contain absolute left-[120px] top-[-30px] opacity-90 mix-blend-multiply pointer-events-none" />
                </div>

                {/* Right: QR Code */}
                <div className="bg-white p-1.5 border border-gray-200 rounded-md shadow-sm mb-2">
                  <img src={qrCodeUrl} alt="QR Code" className="w-[65px] h-[65px]" />
                </div>
                
              </div>
            </div>

          </div>'''

start_idx = content.find('{/* Main Content Container')
end_idx = content.find('</div>\n        </div>\n      </div>\n      \n      {/* Verify')

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_inner + '\n        ' + content[end_idx:]
    with open('c:\\Users\\CUBO\\Desktop\\Vazifa\\frontend\\src\\app\\certificates\\[id]\\page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Replaced successfully')
else:
    print('Could not find boundaries')
    print('start_idx:', start_idx, 'end_idx:', end_idx)
