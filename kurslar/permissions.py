from rest_framework import permissions
from .models import UserProgress

class IsAdminUser(permissions.IsAdminUser):
    """
    Allows access only to admin users (is_staff).
    """
    pass

class IsLessonUnlocked(permissions.BasePermission):
    """
    Allows access to a lesson only if the user has unlocked it.
    Assumes the view returns a Lesson object for get_object().
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.is_staff:
            return True
            
        # The very first lesson of the course is always unlocked
        course = obj.course
        first_module = course.modules.order_by('order').first()
        if first_module:
            first_lesson = first_module.lessons.order_by('order').first()
            if first_lesson and first_lesson.id == obj.id:
                return True
        else:
            first_unassigned = course.lessons.filter(module__isnull=True).order_by('order').first()
            if first_unassigned and first_unassigned.id == obj.id:
                return True
            
        progress = UserProgress.objects.filter(user=request.user, lesson=obj).first()
        return progress is not None and progress.is_unlocked
