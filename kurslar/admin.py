from django.contrib import admin
from .models import CustomUser, Course, Lesson, TestQuestion, UserProgress

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('phone', 'full_name', 'is_staff', 'is_active')
    search_fields = ('phone', 'full_name')
    ordering = ('phone',)
    readonly_fields = ('date_joined', 'last_login')
    
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal info', {'fields': ('full_name', 'birth_date', 'gender')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1

class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    inlines = [LessonInline]

class TestQuestionInline(admin.TabularInline):
    model = TestQuestion
    extra = 1

class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    inlines = [TestQuestionInline]

class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'is_unlocked', 'is_passed', 'score')
    search_fields = ('user__phone', 'lesson__title')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(Lesson, LessonAdmin)
admin.site.register(TestQuestion)
admin.site.register(UserProgress, UserProgressAdmin)
