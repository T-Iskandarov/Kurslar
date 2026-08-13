from rest_framework.views import APIView
from rest_framework.generics import (
    ListAPIView, RetrieveAPIView, CreateAPIView, 
    RetrieveUpdateAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
)
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from kurslar.models import CustomUser, Course, Module, Lesson, TestQuestion, UserProgress, LessonResource, FinalTestQuestion, Certificate, TestAttempt, FinalTestAttempt
from kurslar.serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    CourseListSerializer, CourseDetailSerializer, LessonDetailSerializer,
    TestSubmitSerializer, TestResultSerializer, AdminCourseSerializer,
    AdminLessonSerializer, AdminTestQuestionSerializer, AdminUserSerializer,
    LessonResourceSerializer, FinalTestQuestionSerializer, 
    AdminFinalTestQuestionSerializer, CertificateSerializer,
    AdminStatisticsCourseListSerializer, AdminCourseStudentSerializer,
    TestAttemptSerializer, FinalTestAttemptSerializer, AdminModuleSerializer
)

class RegisterView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            password = serializer.validated_data['password']
            user = authenticate(phone=phone, password=password)
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserProfileSerializer(user).data
                })
            return Response({'detail': "Noto'g'ri telefon raqam yoki parol"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class CourseListView(ListAPIView):
    permission_classes = [AllowAny]
    queryset = Course.objects.all()
    serializer_class = CourseListSerializer


class CourseDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer

    def get(self, request, *args, **kwargs):
        course = self.get_object()
        if request.user.is_authenticated:
            first_module = course.modules.order_by('order').first()
            first_lesson = None
            if first_module:
                first_lesson = first_module.lessons.order_by('order').first()
            else:
                first_lesson = course.lessons.filter(module__isnull=True).order_by('order').first()
                
            if first_lesson:
                UserProgress.objects.get_or_create(
                    user=request.user,
                    lesson=first_lesson,
                    defaults={'is_unlocked': True}
                )
        serializer = self.get_serializer(course, context={'request': request})
        return Response(serializer.data)


class LessonDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Lesson.objects.all()
    serializer_class = LessonDetailSerializer

    def get(self, request, *args, **kwargs):
        lesson = self.get_object()
        course = lesson.course
        first_module = course.modules.order_by('order').first()
        is_first = False
        if first_module:
            first_lesson = first_module.lessons.order_by('order').first()
            if first_lesson and first_lesson.id == lesson.id:
                is_first = True
        else:
            first_unassigned = course.lessons.filter(module__isnull=True).order_by('order').first()
            if first_unassigned and first_unassigned.id == lesson.id:
                is_first = True
                
        if not is_first and not request.user.is_staff:
            progress = UserProgress.objects.filter(user=request.user, lesson=lesson).first()
            if not progress or not progress.is_unlocked:
                return Response({'detail': 'Bu dars hali qulflangan'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(lesson)
        return Response(serializer.data)


class SubmitTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            lesson = Lesson.objects.get(pk=pk)
        except Lesson.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = TestSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        answers = serializer.validated_data.get('answers', [])
        questions = lesson.questions.all()
        total_questions = questions.count()
        if total_questions == 0:
            return Response({'detail': 'No questions found for this lesson'}, status=status.HTTP_400_BAD_REQUEST)
            
        correct_answers = 0
        details = []
        for ans in answers:
            q_id = ans.get('question_id')
            selected_option_idx = ans.get('selected_option')
            try:
                question = questions.get(id=q_id)
                options = question.options
                is_correct = False
                if isinstance(options, list) and 0 <= selected_option_idx < len(options):
                    if options[selected_option_idx].get('is_correct'):
                        is_correct = True
                        correct_answers += 1
                details.append({
                    'question_id': q_id,
                    'question_text': question.question_text,
                    'selected_option': selected_option_idx,
                    'is_correct': is_correct
                })
            except TestQuestion.DoesNotExist:
                continue
                
        score = int((correct_answers / total_questions) * 100)
        passed = score >= 70
        
        TestAttempt.objects.create(
            user=request.user,
            lesson=lesson,
            score=score,
            is_passed=passed,
            details=details
        )
        
        progress, _ = UserProgress.objects.update_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'score': score, 'is_passed': passed, 'is_unlocked': True}
        )
        
        next_lesson_unlocked = False
        next_lesson_id = None
        if passed:
            # Flatten all lessons in order
            course = lesson.course
            all_lessons = []
            for module in course.modules.order_by('order'):
                all_lessons.extend(list(module.lessons.order_by('order')))
            all_lessons.extend(list(course.lessons.filter(module__isnull=True).order_by('order')))
            
            next_lesson = None
            try:
                idx = all_lessons.index(lesson)
                if idx + 1 < len(all_lessons):
                    next_lesson = all_lessons[idx + 1]
            except ValueError:
                pass
                
            if next_lesson:
                UserProgress.objects.update_or_create(
                    user=request.user,
                    lesson=next_lesson,
                    defaults={'is_unlocked': True}
                )
                next_lesson_unlocked = True
                next_lesson_id = next_lesson.id
                
        result_serializer = TestResultSerializer({
            'score': score,
            'total_questions': total_questions,
            'correct_answers': correct_answers,
            'passed': passed,
            'next_lesson_unlocked': next_lesson_unlocked,
            'next_lesson_id': next_lesson_id
        })
        return Response(result_serializer.data)


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        data = {
            'total_courses': Course.objects.count(),
            'total_lessons': Lesson.objects.count(),
            'total_users': CustomUser.objects.count(),
            'total_active_users': CustomUser.objects.filter(is_active=True).count()
        }
        return Response(data)


class AdminCourseListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Course.objects.all()
    serializer_class = AdminCourseSerializer


class AdminCourseDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Course.objects.all()
    serializer_class = AdminCourseSerializer


class AdminLessonCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AdminLessonSerializer

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        from django.db.models import Max
        
        module_id = self.kwargs.get('module_id')
        module = get_object_or_404(Module, id=module_id)
        
        max_order = Lesson.objects.filter(course=module.course).aggregate(Max('order'))['order__max'] or 0
        serializer.save(course=module.course, module=module, order=max_order + 1)


class AdminLessonDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Lesson.objects.all()
    serializer_class = AdminLessonSerializer

class AdminLessonReorderView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, module_id):
        ordered_ids = request.data.get('ordered_ids', [])
        if not isinstance(ordered_ids, list):
            return Response({'detail': 'ordered_ids must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        
        for index, l_id in enumerate(ordered_ids):
            Lesson.objects.filter(id=l_id, module_id=module_id).update(order=index + 1)
            
        return Response({'detail': 'Order updated successfully'}, status=status.HTTP_200_OK)

class AdminModuleCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AdminModuleSerializer

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        from django.db.models import Max
        
        course_id = self.kwargs.get('course_id')
        course = get_object_or_404(Course, id=course_id)
        
        max_order = Module.objects.filter(course=course).aggregate(Max('order'))['order__max'] or 0
        serializer.save(course=course, order=max_order + 1)

class AdminModuleDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Module.objects.all()
    serializer_class = AdminModuleSerializer

class AdminModuleReorderView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, course_id):
        ordered_ids = request.data.get('ordered_ids', [])
        if not isinstance(ordered_ids, list):
            return Response({'detail': 'ordered_ids must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        
        for index, m_id in enumerate(ordered_ids):
            Module.objects.filter(id=m_id, course_id=course_id).update(order=index + 1)
            
        return Response({'detail': 'Order updated successfully'}, status=status.HTTP_200_OK)


class AdminQuestionCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AdminTestQuestionSerializer

    def perform_create(self, serializer):
        lesson_id = self.kwargs.get('lesson_id')
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            raise ValidationError('Lesson not found')
        serializer.save(lesson=lesson)


class AdminQuestionDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = TestQuestion.objects.all()
    serializer_class = AdminTestQuestionSerializer


class AdminUserListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserSerializer


class AdminResourceCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = LessonResourceSerializer

    def perform_create(self, serializer):
        lesson_id = self.kwargs.get('lesson_id')
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            raise ValidationError('Lesson not found')
        serializer.save(lesson=lesson)


class AdminResourceDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = LessonResource.objects.all()
    serializer_class = LessonResourceSerializer

class AdminFinalTestQuestionListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AdminFinalTestQuestionSerializer

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return FinalTestQuestion.objects.filter(course_id=course_id)

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise ValidationError('Course not found')
        serializer.save(course=course)

class AdminFinalTestQuestionDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = FinalTestQuestion.objects.all()
    serializer_class = AdminFinalTestQuestionSerializer

class CourseFinalTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
        
        lessons = course.lessons.all()
        if not lessons:
            return Response({'detail': 'No lessons in course'}, status=400)
            
        passed_lessons = UserProgress.objects.filter(user=request.user, lesson__course=course, is_passed=True).count()
        if passed_lessons < lessons.count():
            return Response({'detail': 'Barcha darslarni tugatmagansiz!'}, status=403)
            
        questions = course.final_questions.all()
        serializer = FinalTestQuestionSerializer(questions, many=True)
        return Response(serializer.data)

class SubmitFinalTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
            
        serializer = TestSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        answers = serializer.validated_data.get('answers', [])
        questions = course.final_questions.all()
        total_questions = questions.count()
        if total_questions == 0:
            return Response({'detail': 'No questions found for this final test'}, status=400)
            
        correct_answers = 0
        details = []
        for ans in answers:
            q_id = ans.get('question_id')
            selected_option_idx = ans.get('selected_option')
            try:
                question = questions.get(id=q_id)
                options = question.options
                is_correct = False
                if isinstance(options, list) and 0 <= selected_option_idx < len(options):
                    if options[selected_option_idx].get('is_correct'):
                        is_correct = True
                        correct_answers += 1
                details.append({
                    'question_id': q_id,
                    'question_text': question.question_text,
                    'selected_option': selected_option_idx,
                    'is_correct': is_correct
                })
            except FinalTestQuestion.DoesNotExist:
                continue
                
        score = int((correct_answers / total_questions) * 100)
        passed = score >= 80
        
        FinalTestAttempt.objects.create(
            user=request.user,
            course=course,
            score=score,
            is_passed=passed,
            details=details
        )
        
        certificate_id = None
        if passed:
            cert, created = Certificate.objects.update_or_create(
                user=request.user,
                course=course,
                defaults={'score': score}
            )
            certificate_id = cert.certificate_id
            
        return Response({
            'score': score,
            'total_questions': total_questions,
            'correct_answers': correct_answers,
            'passed': passed,
            'certificate_id': certificate_id
        })

class VerifyCertificateView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, cert_id):
        try:
            cert = Certificate.objects.get(certificate_id=cert_id)
            serializer = CertificateSerializer(cert)
            return Response({'valid': True, 'certificate': serializer.data})
        except Certificate.DoesNotExist:
            return Response({'valid': False, 'detail': 'Certificate not found'}, status=404)

class CertificateDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    lookup_field = 'certificate_id'

from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UploadedMediaSerializer

class AdminMediaUploadView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UploadedMediaSerializer
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Absolute URL
        file_url = request.build_absolute_uri(serializer.instance.file.url)
        return Response({'url': file_url}, status=status.HTTP_201_CREATED)

class AdminQuestionReorderView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, lesson_id):
        # Expects: {"ordered_ids": [5, 2, 8, 1]}
        ordered_ids = request.data.get('ordered_ids', [])
        if not isinstance(ordered_ids, list):
            return Response({'detail': 'ordered_ids must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        
        for index, q_id in enumerate(ordered_ids):
            TestQuestion.objects.filter(id=q_id, lesson_id=lesson_id).update(order=index)
            
        return Response({'detail': 'Order updated successfully'})

class AdminFinalTestQuestionReorderView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, course_id):
        # Expects: {"ordered_ids": [5, 2, 8, 1]}
        ordered_ids = request.data.get('ordered_ids', [])
        if not isinstance(ordered_ids, list):
            return Response({'detail': 'ordered_ids must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        
        for index, q_id in enumerate(ordered_ids):
            FinalTestQuestion.objects.filter(id=q_id, course_id=course_id).update(order=index)
            
        return Response({'detail': 'Order updated successfully'})

class AdminStatisticsCourseListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Course.objects.all()
    serializer_class = AdminStatisticsCourseListSerializer

class AdminStatisticsCourseDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)

        # Get all users who have some progress in this course
        enrolled_users = CustomUser.objects.filter(progress__lesson__course=course).distinct()
        
        course_data = AdminStatisticsCourseListSerializer(course).data
        users_data = AdminCourseStudentSerializer(enrolled_users, many=True, context={'course': course}).data
        
        return Response({
            'course': course_data,
            'users': users_data
        })

class AdminStatisticsUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, course_id, user_id):
        try:
            course = Course.objects.get(pk=course_id)
            user = CustomUser.objects.get(pk=user_id)
        except (Course.DoesNotExist, CustomUser.DoesNotExist):
            return Response({'detail': 'Not found'}, status=404)

        # Get all test attempts for this user in this course
        test_attempts = TestAttempt.objects.filter(user=user, lesson__course=course).order_by('-created_at')
        final_test_attempts = FinalTestAttempt.objects.filter(user=user, course=course).order_by('-created_at')
        
        cert = Certificate.objects.filter(user=user, course=course).first()
        
        data = {
            'user': AdminUserSerializer(user).data,
            'course': {
                'id': course.id,
                'title': course.title
            },
            'certificate': CertificateSerializer(cert).data if cert else None,
            'test_attempts': TestAttemptSerializer(test_attempts, many=True).data,
            'final_test_attempts': FinalTestAttemptSerializer(final_test_attempts, many=True).data,
        }
        
        return Response(data)

class MyCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Barcha olingan sertifikatlar course idlari
        completed_course_ids = Certificate.objects.filter(user=user).values_list('course_id', flat=True)
        
        # Foydalanuvchining jarayoni mavjud bo'lgan kurslar idlari
        progress_course_ids = UserProgress.objects.filter(user=user, is_unlocked=True).values_list('lesson__course_id', flat=True).distinct()
        
        all_course_ids = set(completed_course_ids) | set(progress_course_ids)
        
        courses = Course.objects.filter(id__in=all_course_ids)
        
        data = []
        for course in courses:
            total_lessons = course.lessons.count()
            passed_lessons = UserProgress.objects.filter(user=user, lesson__course=course, is_passed=True).count()
            progress_percent = int((passed_lessons / total_lessons) * 100) if total_lessons > 0 else 0
            is_completed = course.id in completed_course_ids
            
            data.append({
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
                'progress_percent': progress_percent,
                'is_completed': is_completed,
                'total_lessons': total_lessons,
                'passed_lessons': passed_lessons
            })
            
        return Response(data)

class MyCertificatesView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CertificateSerializer
    pagination_class = None
    
    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user).order_by('-issued_at')
