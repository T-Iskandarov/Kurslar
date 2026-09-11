
import requests
import json
from django.conf import settings

def get_module_diagnostic(student_name, failed_lessons, module_title):
    api_key = getattr(settings, 'GEMINI_API_KEY', None)
    if not api_key:
        return "AI tizimi vaqtinchalik ishlamayapti."

    lessons_text = ", ".join([l.title for l in failed_lessons])
    
    system_prompt = f"""
Siz samimiy va tajribali o'qituvchisiz. Talaba ({student_name}) "{module_title}" modulining yakuniy testidan o'ta olmadi.
U quyidagi mavzulardagi savollarda xato qildi: {lessons_text}.

Vazifangiz:
1. Talabani ruhan qo'llab-quvvatlang (chalg'imasdan davom etishga undash).
2. Xatolarini umumlashtirib, nega aynan shu darslarni ({lessons_text}) qayta ko'rib chiqishi kerakligini tushuntiring. O'zlashtirishdagi bo'shliqni to'ldirish nima uchun muhimligini uqtiring.
3. Hech qanday test javoblarini yoki aniq kodlarni bermang.
4. Javob o'zbek tilida, qisqa (3-4 xatboshi) va konstruktiv bo'lsin.
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": system_prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 800
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print("Gemini Error:", e)
        return "Tizimda kichik uzilish yuz berdi. Iltimos, xato qilgan darslaringizni diqqat bilan qayta ko'rib chiqing."

def test_ai():
    api_key = getattr(settings, 'GEMINI_API_KEY', None)
    if not api_key:
        return False, "API kalit topilmadi"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={api_key}"
    payload = {"contents": [{"parts": [{"text": "Salom, sen ishladingmi? Qisqa 'ha' deb javob ber."}]}]}
    try:
        response = requests.post(url, json=payload, timeout=20)
        response.raise_for_status()
        return True, response.json()['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return False, str(e)

def get_lesson_chat_response(lesson_title, lesson_content, user_message, history=None):
    api_key = getattr(settings, 'GEMINI_API_KEY', None)
    if not api_key:
        return "Tizimda API kalit topilmadi. Admin bilan bog'laning."
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={api_key}"
    
    system_prompt = f"""Sen malakali 'AI O'qituvchi'san (Sun'iy intellekt ustoz). 
Vazifang: O'quvchiga quyidagi dars mavzusi va mazmuni bo'yicha yordam berish, tushunmagan joylarini tushuntirish va savollariga javob berish.

Dars mavzusi: {lesson_title}
Dars mazmuni: {lesson_content if lesson_content else 'Bu dars asosan video formatida. Oquvchi videodan kelib chiqib savol berishi mumkin.'}

QAT'IY QOIDALAR:
1. FAQAT va FAQAT shu dars mavzusi (va aynan shu soha) doirasida savollarga javob ber. 
2. Agar o'quvchi umuman boshqa mavzuda (masalan, ob-havo, siyosat, din, boshqa tillar/dasturlar) savol bersa yoki shaxsiy savollar bersa, muloyimlik bilan rad et: "Kechirasiz, men faqat '{lesson_title}' mavzusi doirasida savollarga javob bera olaman."
3. O'zbek tilida, do'stona, tushunarli, qisqa va aniq (ustozona ohangda) javob ber.
4. Javoblaringni o'qishga qulay qilib (abzaslar, ro'yxatlar bilan) yoz."""

    contents = []
    
    # Optional history handling:
    # History format expected: [{"role": "user", "parts": [{"text": "..."}]}, {"role": "model", "parts": [{"text": "..."}]}]
    if history and isinstance(history, list):
        for msg in history:
            role = msg.get('role', 'user')
            text = msg.get('text', '')
            if text:
                contents.append({
                    "role": role,
                    "parts": [{"text": text}]
                })
    
    # Append the new user message along with the system instruction injected into the context implicitly
    # Gemini requires role 'user' and 'model' strictly alternating. 
    # To enforce system prompt safely without breaking the chain, we can use the 'systemInstruction' field if available,
    # or just prepend it to the very first user message. For v1beta, systemInstruction is supported!
    
    contents.append({
        "role": "user",
        "parts": [{"text": user_message}]
    })

    payload = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": contents
    }

    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print("Gemini Chat Error:", e)
        if hasattr(e, 'response') and getattr(e, 'response') is not None:
            print("Response:", e.response.text)
        return "Kechirasiz, hozircha men javob qaytara olmayapman. Iltimos keyinroq urinib ko'ring yoki ustozga to'g'ridan-to'g'ri yozing."

