
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
        response = requests.post(url, json=payload, timeout=15)
        response.raise_for_status()
        data = response.json()
        return data['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print("Gemini Error:", e)
        return "Tizimda kichik uzilish yuz berdi. Iltimos, xato qilgan darslaringizni diqqat bilan qayta ko'rib chiqing."
