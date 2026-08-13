import re

with open("src/app/admin/courses/[id]/lessons/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add DragDropContext imports
content = content.replace(
    'import { ArrowLeft, Plus, Edit, Trash2, ListChecks, Save, X, Folder, Video } from "lucide-react";',
    'import { ArrowLeft, Plus, Edit, Trash2, ListChecks, Save, X, Folder, Video, GripVertical } from "lucide-react";\nimport { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";'
)

# 2. Add onDragEnd inside the component (before fetchCourse)
on_drag_end_code = """
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
"""
content = content.replace("  const fetchCourse = async () => {", on_drag_end_code)

# 3. Replace the list rendering section
list_start_str = """      <div className="space-y-6">
        {modules.sort((a, b) => a.order - b.order).map((module) => (
          <div key={module.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
"""

new_list_start = """      <DragDropContext onDragEnd={onDragEnd}>
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
"""
content = content.replace(list_start_str, new_list_start)

# Add drag handle to module header
module_header_str = """            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
"""
new_module_header = """            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab flex items-center">
                  <GripVertical size={20} />
                </div>
                <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
"""
content = content.replace(module_header_str, new_module_header)

# Replace table with draggable list
table_start = """            <div className="p-0">
              {module.lessons && module.lessons.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-100">
                  <tbody className="bg-white divide-y divide-gray-100">
                    {module.lessons.sort((a: any, b: any) => a.order - b.order).map((lesson: any) => (
                      <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-500 w-16">
                          {module.order}.{lesson.order}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <Video size={16} className="text-gray-400" />
                            {lesson.title}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                            {lesson.youtube_video_id}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">"""

new_table_start = """            <div className="p-0">
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
                              <div className="flex items-center justify-end gap-2 shrink-0">"""
content = content.replace(table_start, new_table_start)

table_end = """                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-6 text-sm text-gray-500 bg-gray-50/50">
                  Ushbu modulda hozircha darslar yo'q
                </div>
              )}
            </div>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
            Ushbu kursda hozircha modullar yo'q. Birinchi modulni qo'shing.
          </div>
        )}
      </div>"""

new_table_end = """                          </div>
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
      </DragDropContext>"""
content = content.replace(table_end, new_table_end)

with open("src/app/admin/courses/[id]/lessons/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
