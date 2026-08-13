"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, CheckCircle, Circle, Image as ImageIcon, Upload, Download, GripVertical } from "lucide-react";
import { apiFetch } from "@/lib/api";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

export default function AdminCourseFinalTestPage() {
  const params = useParams();
  const id = params.id; // course_id

  const [course, setCourse] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionImage, setQuestionImage] = useState<string | null>(null);
  const [options, setOptions] = useState([
    { text: "", is_correct: true, image_url: "" },
    { text: "", is_correct: false, image_url: "" },
    { text: "", is_correct: false, image_url: "" },
    { text: "", is_correct: false, image_url: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const _questions = [...questions];
      const draggedItemContent = _questions.splice(dragItem.current, 1)[0];
      _questions.splice(dragOverItem.current, 0, draggedItemContent);
      
      setQuestions(_questions);
      
      const orderedIds = _questions.map(q => q.id);
      try {
        const res = await apiFetch(`/admin/courses/${id}/final-questions/reorder/`, {
          method: "POST",
          body: JSON.stringify({ ordered_ids: orderedIds })
        });
        if (!res.ok) throw new Error("API error");
        toast.success("Tartib saqlandi");
      } catch (err) {
        toast.error("Tartibni saqlashda xatolik yuz berdi");
        fetchData();
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const fetchData = async () => {
    try {
      const [courseRes, questionsRes] = await Promise.all([
        apiFetch(`/admin/courses/${id}/`),
        apiFetch(`/admin/courses/${id}/final-questions/`)
      ]);
      if (courseRes.ok && questionsRes.ok) {
        const courseData = await courseRes.json();
        const questionsData = await questionsRes.json();
        setCourse(courseData);
        setQuestions(Array.isArray(questionsData) ? questionsData : (questionsData?.results || []));
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error(err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const resetForm = () => {
    setQuestionText("");
    setQuestionImage(null);
    setOptions([
      { text: "", is_correct: true, image_url: "" },
      { text: "", is_correct: false, image_url: "" },
      { text: "", is_correct: false, image_url: "" },
      { text: "", is_correct: false, image_url: "" },
    ]);
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditClick = (q: any) => {
    setQuestionText(q.question_text);
    setQuestionImage(q.image);
    
    let parsedOptions = q.options;
    if (typeof parsedOptions === 'string') {
      try {
        parsedOptions = JSON.parse(parsedOptions);
      } catch (e) {
        parsedOptions = [];
      }
    }
    
    if (!parsedOptions || parsedOptions.length === 0) {
      parsedOptions = [
        { text: "", is_correct: true, image_url: "" }, 
        { text: "", is_correct: false, image_url: "" }
      ];
    }
    
    setOptions(parsedOptions);
    setEditingId(q.id);
    setShowAddForm(true);
  };

  const handleDelete = async (qId: number) => {
    if (!confirm("Haqiqatan ham bu savolni o'chirmoqchimisiz?")) return;
    try {
      const res = await apiFetch(`/admin/final-questions/${qId}/`, { method: "DELETE" });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleSetCorrect = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index
    }));
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, { text: "", is_correct: false, image_url: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("Kamida 2 ta variant bo'lishi shart!");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    if (options[index].is_correct && newOptions.length > 0) {
      newOptions[0].is_correct = true;
    }
    setOptions(newOptions);
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiFetch("/admin/upload-media/", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch (e) {
      console.error("Upload error", e);
    }
    return null;
  };

  const handleQuestionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const url = await uploadMedia(e.target.files[0]);
      if (url) setQuestionImage(url);
    }
  };

  const handleOptionImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const url = await uploadMedia(e.target.files[0]);
      if (url) {
        const newOptions = [...options];
        newOptions[index].image_url = url;
        setOptions(newOptions);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim() && !questionImage) {
      toast.error("Savol matnini yoki rasmini kiritishingiz shart!");
      return;
    }
    
    const validOptions = options.filter(o => o.text.trim() !== "" || (o.image_url && o.image_url.trim() !== ""));
    if (validOptions.length < 2) {
      toast.error("Kamida 2 ta to'ldirilgan variant bo'lishi kerak!");
      return;
    }
    
    if (!validOptions.some(o => o.is_correct)) {
      toast.error("Bitta to'g'ri javobni belgilashingiz kerak!");
      return;
    }

    setSubmitting(true);

    const data = {
      question_text: questionText,
      image: questionImage,
      options: validOptions
    };

    try {
      if (editingId) {
        const res = await apiFetch(`/admin/final-questions/${editingId}/`, {
          method: "PATCH",
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const updatedQ = await res.json();
          setQuestions((prev) => prev.map((q) => q.id === editingId ? updatedQ : q));
          resetForm();
        } else {
          toast.error("Xatolik yuz berdi");
        }
      } else {
        const res = await apiFetch(`/admin/courses/${id}/final-questions/`, {
          method: "POST",
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const newQ = await res.json();
          setQuestions((prev) => [...prev, newQ]);
          resetForm();
        } else {
          toast.error("Xatolik yuz berdi");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Tarmoq xatosi");
    } finally {
      setSubmitting(false);
    }
  };



  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;

        for (const row of data as any[]) {
          const qText = row["Savol"]?.toString().trim();
          if (!qText) continue;

          const opts = [];
          for (const prefix of ["A", "B", "C", "D"]) {
            const text = row[`${prefix} javob`]?.toString().trim();
            const isCorrect = row[`${prefix} (to'g'ri - 1, noto'g'ri - 0)`] === 1;
            if (text) {
              opts.push({ text, is_correct: isCorrect, image_url: "" });
            }
          }

          if (opts.length >= 2 && opts.some(o => o.is_correct)) {
            const res = await apiFetch(`/admin/courses/${id}/final-questions/`, {
              method: "POST",
              body: JSON.stringify({ question_text: qText, options: opts, image: null })
            });
            if (res.ok) {
              const newQ = await res.json();
              setQuestions((prev) => [...prev, newQ]);
              successCount++;
            }
          }
        }
        toast.success(`${successCount} ta savol muvaffaqiyatli yuklandi!`);
      } catch (err) {
        console.error(err);
        toast.error("Faylni o'qishda xatolik yuz berdi!");
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/admin/courses/${id}/lessons`} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yakuniy Test Savollari</h1>
            <p className="text-gray-500 mt-1">{course?.title || "Kurs"}</p>
          </div>
        </div>
        
        {!showAddForm && (
          <div className="flex items-center gap-2">
            <a
              href="/test_uchun_shablon.xlsx"
              download
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              title="Excel shablonni yuklab olish"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Shablon</span>
            </a>
            
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleExcelImport}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {importing ? <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div> : <Upload size={18} />}
              <span className="hidden sm:inline">Excel orqali</span>
            </button>

            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Yangi savol
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-200 p-6 mb-8 relative animate-in fade-in slide-in-from-top-4">
          <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {editingId ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Savol matni</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none font-medium text-gray-900 mb-3"
                placeholder="Bu yerga savolni yozing..."
              ></textarea>
              
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
                  <ImageIcon size={18} />
                  <span>Rasm qo'shish (ixtiyoriy)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleQuestionImageUpload} />
                </label>
                {questionImage && (
                  <div className="relative inline-block group">
                    <img src={questionImage} alt="Savol rasmi" className="h-16 w-16 object-cover rounded border border-gray-200" />
                    <button type="button" onClick={() => setQuestionImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-900">Javob variantlari</label>
                <span className="text-xs text-gray-500">To'g'ri javobni belgilashni unutmang</span>
              </div>
              
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${option.is_correct ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                    <button
                      type="button"
                      onClick={() => handleSetCorrect(index)}
                      className={`flex-shrink-0 focus:outline-none mt-2 ${option.is_correct ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                      title="To'g'ri javob qilish"
                    >
                      {option.is_correct ? <CheckCircle size={24} /> : <Circle size={24} />}
                    </button>
                    
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                        placeholder={`${index + 1}-variant matni...`}
                        className={`w-full bg-transparent border-none outline-none focus:ring-0 ${option.is_correct ? 'font-medium text-green-900' : 'text-gray-700'}`}
                      />
                      
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <ImageIcon size={14} /> Rasm qo'shish
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleOptionImageUpload(index, e)} />
                        </label>
                        {option.image_url && (
                          <div className="relative inline-block group">
                            <img src={option.image_url} alt="Variant rasmi" className="h-10 w-10 object-cover rounded border border-gray-200" />
                            <button type="button" onClick={() => {
                              const newOpts = [...options];
                              newOpts[index].image_url = "";
                              setOptions(newOpts);
                            }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="flex-shrink-0 text-gray-400 hover:text-red-500 p-1 mt-1 transition-colors"
                      title="O'chirish"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus size={16} /> Yana variant qo'shish
              </button>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={18} />
                )}
                {editingId ? "Saqlash" : "Savolni qo'shish"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {(!Array.isArray(questions) || questions.length === 0) && !showAddForm && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Savollar yo'q</h3>
            <p className="text-gray-500 mb-4">Ushbu kurs uchun hali yakuniy test savollari qo'shilmagan.</p>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              <Plus size={20} />
              Birinchi savolni qo'shish
            </button>
          </div>
        )}
        
        {Array.isArray(questions) && questions.map((q, index) => {
          let opts = q.options;
          if (typeof opts === 'string') {
            try { opts = JSON.parse(opts); } catch(e) { opts = []; }
          }
          
          return (
            <div 
              key={q.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-move transition-all"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
                <div className="flex gap-3 items-start flex-1">
                  <div className="mt-1 text-gray-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={20} />
                  </div>
                  <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-bold h-8 w-8 rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  <div className="mt-1">
                    {q.question_text && <h3 className="font-medium text-gray-900 mb-2">{q.question_text}</h3>}
                    {q.image && <img src={q.image} alt="Savol rasmi" className="max-h-32 object-contain rounded border border-gray-200" />}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditClick(q)}
                    className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-5 pl-16">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.isArray(opts) && opts.map((opt: any, i: number) => (
                    <li key={i} className={`flex items-start gap-2 p-3 rounded-lg border ${opt.is_correct ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                      {opt.is_correct ? (
                        <CheckCircle size={18} className="mt-0.5 flex-shrink-0 text-green-600" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-gray-300 mt-0.5 flex-shrink-0 inline-block mx-0.5"></span>
                      )}
                      <div>
                        {opt.text && <span className={`block text-sm ${opt.is_correct ? 'font-medium text-green-900' : 'text-gray-700'}`}>{opt.text}</span>}
                        {opt.image_url && <img src={opt.image_url} alt="Variant" className="mt-2 max-h-20 object-contain rounded border border-gray-200" />}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
