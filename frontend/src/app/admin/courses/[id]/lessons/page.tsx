"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, ListChecks, Save, X, Folder, Video, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { apiFetch } from "@/lib/api";

export default function AdminCourseLessonsPage() {
  const params = useParams();
  const id = params.id;

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Module
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [moduleFormData, setModuleFormData] = useState({
    title: "",
    order: "",
  });

  // Form states for Lesson
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    order: "",
    youtube_video_id: "",
    content: ""
  });

  const [submitting, setSubmitting] = useState(false);


  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;

    if (result.type === "module") {
      const newModules = Array.from(modules);
      const [reorderedItem] = newModules.splice(sourceIndex, 1);
      newModules.splice(destinationIndex, 0, reorderedItem);
      
      // Update local state and orders immediately for UI
      newModules.forEach((m, idx) => m.order = idx + 1);
      setModules(newModules);
      
      const ordered_ids = newModules.map(m => m.id);
      try {
        await apiFetch(`/admin/courses/${id}/modules/reorder/`, {
          method: "POST",
          body: JSON.stringify({ ordered_ids })
        });
      } catch (err) {
        console.error(err);
      }
    } else if (result.type === "lesson") {
      const moduleId = parseInt(result.source.droppableId.split('-')[1]);
      const destModuleId = parseInt(result.destination.droppableId.split('-')[1]);
      
      // We only support reordering within the same module for now
      if (moduleId !== destModuleId) return;

      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      if (moduleIndex === -1) return;
      
      const newModules = [...modules];
      const newLessons = Array.from(newModules[moduleIndex].lessons);
      const [reorderedItem] = newLessons.splice(sourceIndex, 1);
      newLessons.splice(destinationIndex, 0, reorderedItem);
      
      newLessons.forEach((l: any, idx) => l.order = idx + 1);
      newModules[moduleIndex].lessons = newLessons;
      setModules(newModules);
      
      const ordered_ids = newLessons.map((l: any) => l.id);
      try {
        await apiFetch(`/admin/modules/${moduleId}/lessons/reorder/`, {
          method: "POST",
          body: JSON.stringify({ ordered_ids })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const fetchCourse = async () => {

    try {
      const res = await apiFetch(`/admin/courses/${id}/`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
        setModules(data.modules || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

  const resetModuleForm = () => {
    setModuleFormData({ title: "", order: String(modules.length + 1) });
    setEditingModuleId(null);
    setShowModuleForm(false);
  };

  const handleAddModuleClick = () => {
    setModuleFormData({ title: "", order: String(modules.length + 1) });
    setEditingModuleId(null);
    setShowModuleForm(true);
    setShowLessonForm(false);
  };

  const handleEditModuleClick = (module: any) => {
    setModuleFormData({
      title: module.title,
      order: String(module.order),
    });
    setEditingModuleId(module.id);
    setShowModuleForm(true);
    setShowLessonForm(false);
  };

  const resetLessonForm = () => {
    setLessonFormData({ title: "", order: "1", youtube_video_id: "", content: "" });
    setEditingLessonId(null);
    setActiveModuleId(null);
    setShowLessonForm(false);
  };

  const handleAddLessonClick = (moduleId: number) => {
    const mod = modules.find(m => m.id === moduleId);
    const order = mod && mod.lessons ? mod.lessons.length + 1 : 1;
    setLessonFormData({ title: "", order: String(order), youtube_video_id: "", content: "" });
    setActiveModuleId(moduleId);
    setEditingLessonId(null);
    setShowLessonForm(true);
    setShowModuleForm(false);
  };

  const handleEditLessonClick = (lesson: any, moduleId: number) => {
    setLessonFormData({
      title: lesson.title,
      order: String(lesson.order),
      youtube_video_id: lesson.youtube_video_id,
      content: lesson.content || ""
    });
    setActiveModuleId(moduleId);
    setEditingLessonId(lesson.id);
    setShowLessonForm(true);
    setShowModuleForm(false);
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Haqiqatan ham bu modulni va uning ichidagi barcha darslarni o'chirmoqchimisiz?")) return;
    try {
      const res = await apiFetch(`/admin/modules/${moduleId}/`, { method: "DELETE" });
      if (res.ok) {
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Haqiqatan ham bu darsni o'chirmoqchimisiz?")) return;
    try {
      const res = await apiFetch(`/admin/lessons/${lessonId}/`, { method: "DELETE" });
      if (res.ok) {
        fetchCourse(); // Refresh to update nested lessons
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      title: moduleFormData.title,
      order: parseInt(moduleFormData.order, 10),
    };
    try {
      if (editingModuleId) {
        const res = await apiFetch(`/admin/modules/${editingModuleId}/`, {
          method: "PATCH",
          body: JSON.stringify(data)
        });
        if (res.ok) {
          fetchCourse();
          resetModuleForm();
        } else {
          alert("Xatolik yuz berdi");
        }
      } else {
        const res = await apiFetch(`/admin/courses/${id}/modules/`, {
          method: "POST",
          body: JSON.stringify(data)
        });
        if (res.ok) {
          fetchCourse();
          resetModuleForm();
        } else {
          alert("Xatolik yuz berdi");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Tarmoq xatosi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      title: lessonFormData.title,
      order: parseInt(lessonFormData.order, 10),
      youtube_video_id: lessonFormData.youtube_video_id,
      content: lessonFormData.content
    };
    try {
      if (editingLessonId) {
        const res = await apiFetch(`/admin/lessons/${editingLessonId}/`, {
          method: "PATCH",
          body: JSON.stringify(data)
        });
        if (res.ok) {
          fetchCourse();
          resetLessonForm();
        } else {
          alert("Xatolik yuz berdi");
        }
      } else if (activeModuleId) {
        const res = await apiFetch(`/admin/modules/${activeModuleId}/lessons/`, {
          method: "POST",
          body: JSON.stringify(data)
        });
        if (res.ok) {
          fetchCourse();
          resetLessonForm();
        } else {
          alert("Xatolik yuz berdi");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Tarmoq xatosi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/admin/courses/${id}/edit`} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modullar va Darslarni boshqarish</h1>
            <p className="text-gray-500 mt-1">{course?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/courses/${id}/final-test`}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <ListChecks size={20} />
            Yakuniy Test
          </Link>
          {!showModuleForm && !showLessonForm && (
            <button
              onClick={handleAddModuleClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Yangi modul
            </button>
          )}
        </div>
      </div>

      {showModuleForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 relative">
          <button onClick={resetModuleForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Folder className="text-blue-600" size={24} />
            {editingModuleId ? "Modulni tahrirlash" : "Yangi modul qo'shish"}
          </h2>
          
          <form onSubmit={handleModuleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modul nomi</label>
                <input
                  type="text"
                  required
                  value={moduleFormData.title}
                  onChange={(e) => setModuleFormData({...moduleFormData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  placeholder="Masalan: 1-Modul: Kirish"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tartib raqami</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={moduleFormData.order}
                  onChange={(e) => setModuleFormData({...moduleFormData, order: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetModuleForm}
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
                {editingModuleId ? "O'zgarishlarni saqlash" : "Qo'shish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showLessonForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 relative">
          <button onClick={resetLessonForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Video className="text-orange-500" size={24} />
            {editingLessonId ? "Darsni tahrirlash" : "Yangi dars qo'shish"}
          </h2>
          
          <form onSubmit={handleLessonSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dars nomi</label>
                <input
                  type="text"
                  required
                  value={lessonFormData.title}
                  onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  placeholder="Masalan: HTML asoslari"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tartib raqami</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={lessonFormData.order}
                  onChange={(e) => setLessonFormData({...lessonFormData, order: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID</label>
              <input
                type="text"
                required
                value={lessonFormData.youtube_video_id}
                onChange={(e) => setLessonFormData({...lessonFormData, youtube_video_id: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-mono text-sm"
                placeholder="Masalan: dQw4w9WgXcQ"
              />
              <p className="text-xs text-gray-500 mt-1">
                YouTube havolasidagi v= dan keyingi qism. Misol uchun: https://youtube.com/watch?v=<strong className="text-gray-700">dQw4w9WgXcQ</strong>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qo'shimcha matn (ixtiyoriy)</label>
              <textarea
                value={lessonFormData.content}
                onChange={(e) => setLessonFormData({...lessonFormData, content: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                placeholder="Dars haqida qo'shimcha ma'lumotlar..."
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetLessonForm}
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
                {editingLessonId ? "O'zgarishlarni saqlash" : "Qo'shish"}
              </button>
            </div>
          </form>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="course-modules" type="module">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
              {modules.sort((a, b) => a.order - b.order).map((module, mIndex) => (
                <Draggable key={`module-${module.id}`} draggableId={`module-${module.id}`} index={mIndex}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.draggableProps} 
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                    >
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab flex items-center">
                  <GripVertical size={20} />
                </div>
                <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                  {module.order}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddLessonClick(module.id)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={16} /> Dars qo'shish
                </button>
                <button
                  onClick={() => handleEditModuleClick(module)}
                  className="text-gray-500 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                  title="Modulni tahrirlash"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteModule(module.id)}
                  className="text-gray-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                  title="Modulni o'chirish"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="p-0">
              {module.lessons && module.lessons.length > 0 ? (
                <Droppable droppableId={`module-${module.id}`} type="lesson">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-gray-100 bg-white">
                      {module.lessons.sort((a: any, b: any) => a.order - b.order).map((lesson: any, lIndex: number) => (
                        <Draggable key={`lesson-${lesson.id}`} draggableId={`lesson-${lesson.id}`} index={lIndex}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef} 
                              {...provided.draggableProps} 
                              className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab mr-4">
                                <GripVertical size={16} />
                              </div>
                              <div className="text-sm font-medium text-gray-500 w-16 shrink-0">
                                {module.order}.{lesson.order}
                              </div>
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-900 flex-1 min-w-0">
                                <Video size={16} className="text-gray-400 shrink-0" />
                                <span className="truncate">{lesson.title}</span>
                              </div>
                              <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded hidden md:block w-32 truncate mx-4 shrink-0">
                                {lesson.youtube_video_id}
                              </div>
                              <div className="flex items-center justify-end gap-2 shrink-0">
                            <Link
                              href={`/admin/lessons/${lesson.id}/resources`}
                              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-900 px-2 py-1.5 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                              title="Resurslar"
                            >
                              <ListChecks size={16} />
                            </Link>
                            <Link
                              href={`/admin/lessons/${lesson.id}/questions`}
                              className="flex items-center gap-1 text-purple-600 hover:text-purple-900 px-2 py-1.5 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-100 mr-2"
                              title="Testlar"
                            >
                              <ListChecks size={16} />
                            </Link>
                            <button
                              onClick={() => handleEditLessonClick(lesson, module.id)}
                              className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Tahrirlash"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ) : (
                <div className="text-center py-6 text-sm text-gray-500 bg-gray-50/50">
                  Ushbu modulda hozircha darslar yo'q
                </div>
              )}
            </div>
          </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {modules.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
                  Ushbu kursda hozircha modullar yo'q. Birinchi modulni qo'shing.
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
