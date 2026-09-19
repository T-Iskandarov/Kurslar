import requests
import json
import time
from django.conf import settings
from kurslar.models import SystemSetting

def get_api_credentials():
    sys_set = SystemSetting.get_settings()
    if not sys_set.is_ai_enabled:
        return False, "Tizimda AI xizmatlari vaqtincha o'chirilgan."
    
    provider = sys_set.active_ai_provider
    api_key = getattr(sys_set, f"{provider}_api_key", None)
    if not api_key:
        return False, f"Tizimda {provider} API kalit kiritilmagan. Admin sozlamalarini tekshiring."
    
    return True, {"provider": provider, "api_key": api_key}

def generate_text(system_prompt, user_message, history=None):
    """
    history: [{"role": "user", "text": "..."}, {"role": "model", "text": "..."}]
    """
    status, creds = get_api_credentials()
    if not status: 
        return creds
        
    provider = creds['provider']
    api_key = creds['api_key']

    if provider == 'gemini':
        return call_gemini(api_key, system_prompt, user_message, history)
    else:
        return call_openai_compatible(provider, api_key, system_prompt, user_message, history)

def call_gemini(api_key, system_prompt, user_message, history=None):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
    contents = []
    if history and isinstance(history, list):
        for msg in history:
            role = msg.get('role', 'user')
            text = msg.get('text', '')
            if text:
                contents.append({"role": role, "parts": [{"text": text}]})
                
    contents.append({"role": "user", "parts": [{"text": user_message}]})

    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1500}
    }
    
    for attempt in range(3):
        try:
            response = requests.post(url, json=payload, timeout=60)
            response.raise_for_status()
            return response.json()['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            if attempt == 2: return "Kechirasiz, xatolik yuz berdi. Iltimos keyinroq urinib ko'ring."
            time.sleep(2)
    return "Xatolik."

def call_openai_compatible(provider, api_key, system_prompt, user_message, history=None):
    if provider == 'deepinfra':
        url = "https://api.deepinfra.com/v1/openai/chat/completions"
        model = "meta-llama/Meta-Llama-3.1-8B-Instruct"
    elif provider == 'openrouter':
        url = "https://openrouter.ai/api/v1/chat/completions"
        model = "google/gemini-flash-1.5-8b"
    elif provider == 'openai':
        url = "https://api.openai.com/v1/chat/completions"
        model = "gpt-4o-mini"
    elif provider == 'claude':
        return "Claude xizmati hozircha ulanganicha yo'q."
    else:
        return "Noma'lum provayder."

    messages = [{"role": "system", "content": system_prompt}]
    
    if history and isinstance(history, list):
        for msg in history:
            role = "assistant" if msg.get('role') == 'model' else "user"
            text = msg.get('text', '')
            if text:
                messages.append({"role": role, "content": text})
                
    messages.append({"role": "user", "content": user_message})

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    if provider == 'openrouter':
        headers["HTTP-Referer"] = "https://kurslarim.uz"
        headers["X-Title"] = "Kurslarim"

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 1500
    }

    for attempt in range(3):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except Exception as e:
            if attempt == 2: return f"AI Xatosi ({provider}): Iltimos keyinroq urinib ko'ring."
            time.sleep(2)
    return "Xatolik."


def get_module_diagnostic(student_name, failed_lessons, module_title):
    lessons_text = ", ".join([l.title for l in failed_lessons])
    system_prompt = f"""
Siz samimiy va tajribali o'qituvchisiz. Talaba ({student_name}) "{module_title}" modulining yakuniy testidan o'ta olmadi.
U quyidagi mavzulardagi savollarda xato qildi: {lessons_text}.
Vazifangiz:
1. Talabani ruhan qo'llab-quvvatlang (chalg'imasdan davom etishga undash).
2. Xatolarini umumlashtirib, nega aynan shu darslarni ({lessons_text}) qayta ko'rib chiqishi kerakligini tushuntiring.
3. Hech qanday test javoblarini bermang.
4. Javob o'zbek tilida, qisqa (3-4 xatboshi) bo'lsin.
"""
    return generate_text(system_prompt, "Test xatolari tahlilini yozib bering.")

def test_ai():
    status, creds = get_api_credentials()
    if not status: return False, creds
    try:
        ans = generate_text("Sen AI assissantsan.", "Salom, sen ishladingmi? Qisqa 'ha' deb javob ber.")
        return True, ans
    except Exception as e:
        return False, str(e)

def get_lesson_chat_response(lesson_title, lesson_content, user_message, history=None):
    system_prompt = f"""Sen malakali 'AI O'qituvchi'san.
Dars mavzusi: {lesson_title}
Dars mazmuni: {lesson_content if lesson_content else 'Bu dars asosan video formatida. Oquvchi videodan kelib chiqib savol berishi mumkin.'}
QAT'IY QOIDALAR:
1. FAQAT va FAQAT shu dars mavzusi doirasida savollarga javob ber. 
2. Agar o'quvchi umuman boshqa mavzuda savol bersa, muloyimlik bilan rad et: "Kechirasiz, men faqat '{lesson_title}' mavzusi doirasida savollarga javob bera olaman."
3. O'zbek tilida, do'stona, tushunarli, qisqa va aniq (ustozona ohangda) javob ber.
4. Javoblaringni o'qishga qulay qilib (abzaslar, ro'yxatlar bilan) yoz."""

    return generate_text(system_prompt, user_message, history)
