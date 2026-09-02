from rest_framework import serializers
from .models import CustomUser, Course, Module, Lesson, TestQuestion, UserProgress, LessonResource, FinalTestQuestion, Certificate, TestAttempt, FinalTestAttempt

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['phone', 'full_name', 'birth_date', 'gender', 'password']

    def validate_phone(self, value):
        val = value.replace('+', '')
        if not val.isdigit() or not (9 <= len(val) <= 15):
            raise serializers.ValidationError("Telefon raqami faqat raqamlardan iborat bo'lishi va 9 dan 15 gacha belgi uzunligida bo'lishi kerak.")
        return value

    def create(self, validated_data):
        user = CustomUser(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'phone', 'full_name', 'birth_date', 'gender', 'date_joined', 'is_staff']
        read_only_fields = ['id', 'phone', 'date_joined', 'is_staff']

class CourseListSerializer(serializers.ModelSerializer):
    lessons_count = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'created_at', 'lessons_count', 'students_count']

    def get_lessons_count(self, obj):
        return obj.lessons.count()

    def get_students_count(self, obj):
        return UserProgress.objects.filter(lesson__course=obj).values('user').distinct().count()

class LessonListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    order = serializers.IntegerField()
    is_unlocked = serializers.BooleanField()
    is_passed = serializers.BooleanField()
    score = serializers.FloatField(allow_null=True)

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'title', 'order']

class CourseDetailSerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()
    user_progress_percent = serializers.SerializerMethodField()
    has_certificate = serializers.SerializerMethodField()
    certificate_id = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'created_at', 'modules', 'students_count', 'user_progress_percent', 'has_certificate', 'certificate_id']

    def get_has_certificate(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Certificate.objects.filter(user=request.user, course=obj).exists()
        return False

    def get_certificate_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            cert = Certificate.objects.filter(user=request.user, course=obj).first()
            if cert:
                return cert.certificate_id
        return None

    def get_students_count(self, obj):
        return UserProgress.objects.filter(lesson__course=obj).values('user').distinct().count()

    def get_user_progress_percent(self, obj):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        if not user:
            return 0
        total_lessons = obj.lessons.count()
        if total_lessons == 0:
            return 0
        passed_lessons = UserProgress.objects.filter(lesson__course=obj, user=user, is_passed=True).count()
        return int((passed_lessons / total_lessons) * 100)

    def get_modules(self, obj):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        
        module_data_list = []
        is_first_lesson = True
        
        modules = obj.modules.order_by('order')
        for module in modules:
            lessons = module.lessons.order_by('order')
            lesson_data_list = []
            
            for lesson in lessons:
                if user:
                    progress = UserProgress.objects.filter(user=user, lesson=lesson).first()
                    if progress:
                        is_unlocked = progress.is_unlocked or is_first_lesson
                        is_passed = progress.is_passed
                        score = progress.score
                    else:
                        is_unlocked = is_first_lesson
                        is_passed = False
                        score = None
                else:
                    is_unlocked = is_first_lesson
                    is_passed = False
                    score = None
                
                is_first_lesson = False
                
                lesson_data_list.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'order': lesson.order,
                    'is_unlocked': is_unlocked,
                    'is_passed': is_passed,
                    'score': score
                })
            
            module_data_list.append({
                'id': module.id,
                'title': module.title,
                'order': module.order,
                'lessons': lesson_data_list
            })
            
        unassigned_lessons = obj.lessons.filter(module__isnull=True).order_by('order')
        if unassigned_lessons.exists():
            lesson_data_list = []
            for lesson in unassigned_lessons:
                if user:
                    progress = UserProgress.objects.filter(user=user, lesson=lesson).first()
                    if progress:
                        is_unlocked = progress.is_unlocked
                        is_passed = progress.is_passed
                        score = progress.score
                    else:
                        is_unlocked = False
                        is_passed = False
                        score = None
                else:
                    is_unlocked = is_first_lesson
                    is_passed = False
                    score = None
                
                is_first_lesson = False
                
                lesson_data_list.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'order': lesson.order,
                    'is_unlocked': is_unlocked,
                    'is_passed': is_passed,
                    'score': score
                })
            
            module_data_list.append({
                'id': 0,
                'title': 'Boshqa darslar',
                'order': 999,
                'lessons': lesson_data_list
            })
            
        return module_data_list

class LessonDetailSerializer(serializers.ModelSerializer):
    course_title = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()
    resources = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order', 'youtube_video_id', 'content', 'course_id', 'course_title', 'questions', 'resources']

    def get_course_title(self, obj):
        return obj.course.title

    def get_questions(self, obj):
        request = self.context.get('request')
        questions = obj.questions.all()
        return [
            {
                'id': q.id,
                'question_text': q.question_text,
                'image': q.image,
                'options': [{'text': opt.get('text', ''), 'image_url': opt.get('image_url', '')} for opt in q.options]
            }
            for q in obj.questions.all()
        ]

    def get_resources(self, obj):
        return LessonResourceSerializer(obj.resources.all(), many=True).data

class TestSubmitSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.DictField()
    )

class TestResultSerializer(serializers.Serializer):
    score = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    correct_answers = serializers.IntegerField()
    passed = serializers.BooleanField()
    next_lesson_unlocked = serializers.BooleanField(required=False)
    next_lesson_id = serializers.IntegerField(required=False, allow_null=True)
    details = serializers.ListField(child=serializers.DictField(), required=False)

class AdminCourseSerializer(serializers.ModelSerializer):
    lessons_count = serializers.SerializerMethodField()
    modules = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_lessons_count(self, obj):
        return obj.lessons.count()

    def get_modules(self, obj):
        modules = obj.modules.order_by('order')
        return AdminModuleSerializer(modules, many=True).data

class LessonResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonResource
        fields = '__all__'
        read_only_fields = ['lesson']

class AdminLessonSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    course_id = serializers.IntegerField(source='course.id', read_only=True)
    module_id = serializers.IntegerField(source='module.id', read_only=True)
    resources = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'
        read_only_fields = ['course', 'module']

    def get_questions(self, obj):
        return AdminTestQuestionSerializer(obj.questions.all(), many=True).data

    def get_resources(self, obj):
        return LessonResourceSerializer(obj.resources.all(), many=True).data

class AdminModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()
    
    class Meta:
        model = Module
        fields = '__all__'
        read_only_fields = ['course']
        
    def get_lessons(self, obj):
        lessons = obj.lessons.order_by('order')
        return AdminLessonSerializer(lessons, many=True).data

class AdminTestQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestQuestion
        fields = '__all__'
        read_only_fields = ['lesson']

class AdminUserSerializer(serializers.ModelSerializer):
    courses_progress = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'phone', 'full_name', 'birth_date', 'gender', 'is_active', 'is_staff', 'date_joined', 'courses_progress']

    def get_courses_progress(self, obj):
        # Find courses where user has a certificate or progress
        courses_dict = {}
        
        # 1. Certificates
        certs = Certificate.objects.filter(user=obj).select_related('course')
        for cert in certs:
            courses_dict[cert.course.id] = f"{cert.course.title}: Tamomlagan"
            
        # 2. Progress
        progresses = UserProgress.objects.filter(user=obj, is_unlocked=True).select_related('lesson', 'lesson__course').order_by('lesson__course_id', '-lesson__order')
        
        for p in progresses:
            course = p.lesson.course
            if course.id not in courses_dict:
                courses_dict[course.id] = f"{course.title}: {p.lesson.order}-darsda"
                
        return list(courses_dict.values())

class FinalTestQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalTestQuestion
        fields = ['id', 'question_text', 'options', 'image']

    def to_representation(self, instance):
        # We strip is_correct from options so frontend doesn't see it
        data = super().to_representation(instance)
        opts = data.get('options', [])
        if isinstance(opts, list):
            clean_opts = [{'text': o.get('text', ''), 'image_url': o.get('image_url', '')} for o in opts]
            data['options'] = clean_opts
        return data

class AdminFinalTestQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalTestQuestion
        fields = '__all__'
        read_only_fields = ['course']

class CertificateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Certificate
        fields = ['id', 'user_name', 'course_title', 'certificate_id', 'issued_at', 'score']

from .models import UploadedMedia
class UploadedMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedMedia
        fields = ['id', 'file', 'uploaded_at']

class TestAttemptSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = TestAttempt
        fields = ['id', 'lesson', 'lesson_title', 'score', 'is_passed', 'details', 'created_at']

class FinalTestAttemptSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = FinalTestAttempt
        fields = ['id', 'course', 'course_title', 'score', 'is_passed', 'details', 'created_at']

class AdminStatisticsCourseListSerializer(serializers.ModelSerializer):
    students_enrolled = serializers.SerializerMethodField()
    students_completed = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'thumbnail', 'created_at', 'students_enrolled', 'students_completed']

    def get_students_enrolled(self, obj):
        return UserProgress.objects.filter(lesson__course=obj).values('user').distinct().count()

    def get_students_completed(self, obj):
        return Certificate.objects.filter(course=obj).count()

class AdminCourseStudentSerializer(serializers.ModelSerializer):
    progress_status = serializers.SerializerMethodField()
    has_certificate = serializers.SerializerMethodField()
    total_test_attempts = serializers.SerializerMethodField()
    failed_test_attempts = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'phone', 'full_name', 'progress_status', 'has_certificate', 'total_test_attempts', 'failed_test_attempts']

    def get_progress_status(self, obj):
        course = self.context.get('course')
        if not course:
            return ""
        if Certificate.objects.filter(user=obj, course=course).exists():
            return "Tamomlagan"
        latest_progress = UserProgress.objects.filter(user=obj, lesson__course=course, is_unlocked=True).order_by('-lesson__order').first()
        if latest_progress:
            return f"{latest_progress.lesson.order}-darsda"
        return "Boshlamagan"

    def get_has_certificate(self, obj):
        course = self.context.get('course')
        if not course:
            return False
        return Certificate.objects.filter(user=obj, course=course).exists()

    def get_total_test_attempts(self, obj):
        course = self.context.get('course')
        if not course:
            return 0
        return TestAttempt.objects.filter(user=obj, lesson__course=course).count() + FinalTestAttempt.objects.filter(user=obj, course=course).count()

    def get_failed_test_attempts(self, obj):
        course = self.context.get('course')
        if not course:
            return 0
        return TestAttempt.objects.filter(user=obj, lesson__course=course, is_passed=False).count() + FinalTestAttempt.objects.filter(user=obj, course=course, is_passed=False).count()
