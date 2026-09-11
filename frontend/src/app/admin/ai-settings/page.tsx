"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTokens } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Bot, Save, AlertTriangle, Key, X, CheckCircle2 } from "lucide-react";

export default function AdminAISettingsPage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    is_ai_enabled: true,
    active_ai_provider: "gemini",
    gemini_api_key: "",
    openai_api_key: "",
    claude_api_key: ""
  });

  const [keyModalProvider, setKeyModalProvider] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const tokens = getTokens();
    const token = tokens ? tokens.access : null;
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
    const tokens = getTokens();
    const token = tokens ? tokens.access : null;
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

  const handleProviderSelect = (provider: string) => {
    setSettings({ ...settings, active_ai_provider: provider });
    // If no key exists for this provider, auto-open modal
    const currentKey = settings[`${provider}_api_key` as keyof typeof settings];
    if (!currentKey) {
      openKeyModal(provider);
    }
  };

  const openKeyModal = (provider: string) => {
    const currentKey = settings[`${provider}_api_key` as keyof typeof settings];
    setTempKey(currentKey as string || "");
    setKeyModalProvider(provider);
  };

  const saveKeyFromModal = () => {
    if (keyModalProvider) {
      setSettings({
        ...settings,
        [`${keyModalProvider}_api_key`]: tempKey
      });
    }
    setKeyModalProvider(null);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  const providers = ['gemini', 'openai', 'claude'];

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-6 relative">
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
            {providers.map(provider => {
              const hasKey = !!settings[`${provider}_api_key` as keyof typeof settings];
              return (
                <div 
                  key={provider}
                  className={`flex flex-col gap-3 p-4 rounded-xl border-2 transition-colors ${
                    settings.active_ai_provider === provider 
                      ? "border-purple-600 bg-purple-50" 
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer w-full">
                    <input 
                      type="radio" 
                      name="provider" 
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600"
                      checked={settings.active_ai_provider === provider}
                      onChange={() => handleProviderSelect(provider)}
                    />
                    <span className="font-bold text-gray-900 capitalize text-lg flex-1">{provider}</span>
                  </label>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50">
                    <span className="text-xs font-medium flex items-center gap-1">
                      {hasKey ? (
                        <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> Ulandigan</span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={14}/> Kalit yo'q</span>
                      )}
                    </span>
                    
                    <button 
                      onClick={() => openKeyModal(provider)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Key size={14} />
                      API Kalit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Modal */}
      {keyModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2">
                <Key className="text-purple-600" />
                {keyModalProvider} API Kalit
              </h3>
              <button 
                onClick={() => setKeyModalProvider(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Iltimos, {keyModalProvider} xizmati uchun taqdim etilgan yashirin API kalitni kiriting.
            </p>
            
            <input 
              type="password" 
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="API kalitni shu yerga kiriting..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all font-mono text-sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && saveKeyFromModal()}
            />
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setKeyModalProvider(null)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                Bekor qilish
              </button>
              <button 
                onClick={saveKeyFromModal}
                className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
