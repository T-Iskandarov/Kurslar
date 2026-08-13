from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from kurslar import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.ProfileView.as_view(), name='profile'),
    path('auth/my-courses/', views.MyCoursesView.as_view(), name='my-courses'),
    path('auth/my-certificates/', views.MyCertificatesView.as_view(), name='my-certificates'),
    
    # Courses & Lessons
    path('courses/', views.CourseListView.as_view(), name='course-list'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:pk>/final-test/', views.CourseFinalTestView.as_view(), name='course-final-test'),
    path('courses/<int:pk>/submit-final-test/', views.SubmitFinalTestView.as_view(), name='submit-final-test'),
    
    path('lessons/<int:pk>/', views.LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/<int:pk>/submit-test/', views.SubmitTestView.as_view(), name='submit-test'),
    
    # Certificates
    path('certificates/verify/<str:cert_id>/', views.VerifyCertificateView.as_view(), name='verify-certificate'),
    path('certificates/<str:certificate_id>/', views.CertificateDetailView.as_view(), name='certificate-detail'),
    
    # Admin
    path('admin/statistics/courses/', views.AdminStatisticsCourseListView.as_view(), name='admin-statistics-courses'),
    path('admin/statistics/courses/<int:pk>/', views.AdminStatisticsCourseDetailView.as_view(), name='admin-statistics-course-detail'),
    path('admin/statistics/courses/<int:course_id>/users/<int:user_id>/', views.AdminStatisticsUserDetailView.as_view(), name='admin-statistics-user-detail'),
    
    path('admin/upload-media/', views.AdminMediaUploadView.as_view(), name='admin-upload-media'),
    path('admin/dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/courses/', views.AdminCourseListCreateView.as_view(), name='admin-course-list'),
    path('admin/courses/<int:pk>/', views.AdminCourseDetailView.as_view(), name='admin-course-detail'),
    path('admin/courses/<int:course_id>/modules/', views.AdminModuleCreateView.as_view(), name='admin-module-create'),
    path('admin/courses/<int:course_id>/modules/reorder/', views.AdminModuleReorderView.as_view(), name='admin-module-reorder'),
    path('admin/modules/<int:pk>/', views.AdminModuleDetailView.as_view(), name='admin-module-detail'),
    path('admin/modules/<int:module_id>/lessons/', views.AdminLessonCreateView.as_view(), name='admin-lesson-create'),
    path('admin/modules/<int:module_id>/lessons/reorder/', views.AdminLessonReorderView.as_view(), name='admin-lesson-reorder'),
    path('admin/courses/<int:course_id>/final-questions/', views.AdminFinalTestQuestionListCreateView.as_view(), name='admin-final-questions-list-create'),
    path('admin/courses/<int:course_id>/final-questions/reorder/', views.AdminFinalTestQuestionReorderView.as_view(), name='admin-final-questions-reorder'),
    path('admin/final-questions/<int:pk>/', views.AdminFinalTestQuestionDetailView.as_view(), name='admin-final-question-detail'),
    path('admin/lessons/<int:pk>/', views.AdminLessonDetailView.as_view(), name='admin-lesson-detail'),
    path('admin/lessons/<int:lesson_id>/questions/', views.AdminQuestionCreateView.as_view(), name='admin-question-create'),
    path('admin/lessons/<int:lesson_id>/questions/reorder/', views.AdminQuestionReorderView.as_view(), name='admin-question-reorder'),
    path('admin/questions/<int:pk>/', views.AdminQuestionDetailView.as_view(), name='admin-question-detail'),
    path('admin/lessons/<int:lesson_id>/resources/', views.AdminResourceCreateView.as_view(), name='admin-resource-create'),
    path('admin/resources/<int:pk>/', views.AdminResourceDetailView.as_view(), name='admin-resource-detail'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
]
