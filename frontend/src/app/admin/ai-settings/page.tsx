"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Bot, Save, AlertTriangle, Key } from "lucide-react";

export default function AdminAISettingsPage() {
  const { user, token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    is_ai_enabled: true,
    active_ai_provider: "gemini",
    gemini_api_key: "",
    openai_api_key: "",
    claude_api_key: ""
  });

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    if (!token) return;
    try {
      const res = await fetch("https://api.kurslarim.uz/api/v1/admin/system-settings/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Sozlamalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("https://api.kurslarim.uz/api/v1/admin/system-settings/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Muvaffaqiyatli saqlandi");
      } else {
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      toast.error("Saqlashda tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Sozlamalari</h1>
          <p className="text-gray-500 text-sm mt-1">Sun'iy intellekt modellarini va ularning API kalitlarini boshqarish</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-colors font-medium disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bot className="text-purple-600" />
              Umumiy AI Holati
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Agar o'chirib qo'yilsa, saytdagi barcha AI funksiyalar (Test, O'qituvchi) foydalanuvchilarga ko'rinmaydi.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={settings.is_ai_enabled}
              onChange={(e) => setSettings({...settings, is_ai_enabled: e.target.checked})}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="pt-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Aktiv Modelni Tanlash</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['gemini', 'openai', 'claude'].map(provider => (
              <label 
                key={provider}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  settings.active_ai_provider === provider 
                    ? "border-purple-600 bg-purple-50" 
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <input 
                  type="radio" 
                  name="provider" 
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600"
                  checked={settings.active_ai_provider === provider}
                  onChange={() => setSettings({...settings, active_ai_provider: provider})}
                />
                <span className="font-medium text-gray-900 capitalize">{provider}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Key className="text-blue-600" />
          API Kalitlar
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Gemini API Key</label>
            <input 
              type="text" 
              placeholder="AIzaSy..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
              value={settings.gemini_api_key || ''}
              onChange={(e) => setSettings({...settings, gemini_api_key: e.target.value})}
            />
            {settings.active_ai_provider === 'gemini' && !settings.gemini_api_key && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertTriangle size={14}/> Ushbu model tanlangan, lekin kalit kiritilmagan!</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI API Key (ChatGPT)</label>
            <input 
              type="text" 
              placeholder="sk-..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
              value={settings.openai_api_key || ''}
              onChange={(e) => setSettings({...settings, openai_api_key: e.target.value})}
            />
             {settings.active_ai_provider === 'openai' && !settings.openai_api_key && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertTriangle size={14}/> Ushbu model tanlangan, lekin kalit kiritilmagan!</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Anthropic API Key (Claude)</label>
            <input 
              type="text" 
              placeholder="sk-ant-..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
              value={settings.claude_api_key || ''}
              onChange={(e) => setSettings({...settings, claude_api_key: e.target.value})}
            />
             {settings.active_ai_provider === 'claude' && !settings.claude_api_key && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertTriangle size={14}/> Ushbu model tanlangan, lekin kalit kiritilmagan!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
