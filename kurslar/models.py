from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import CustomUserManager

class CustomUser(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = [
        ('erkak', 'Erkak'),
        ('ayol', 'Ayol'),
    ]
    phone = models.CharField(max_length=15, unique=True)
    full_name = models.CharField(max_length=150)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['full_name']

    objects = CustomUserManager()

    def __str__(self):
        return self.phone


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.course.title} - {self.title}'


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons', null=True, blank=True)
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField()
    youtube_video_id = models.CharField(max_length=50)
    content = models.TextField(blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.course.title} - {self.title}'


class TestQuestion(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    image = models.CharField(max_length=500, blank=True, null=True)
    options = models.JSONField(help_text='List of {"text": "...", "is_correct": true/false, "image_url": "..."}')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.question_text[:50] + '...' if len(self.question_text) > 50 else self.question_text


class UserProgress(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress')
    is_unlocked = models.BooleanField(default=False)
    is_passed = models.BooleanField(default=False)
    score = models.IntegerField(default=0)

    class Meta:
        unique_together = ['user', 'lesson']

    def __str__(self):
        return f'{self.user.phone} - {self.lesson.title}'


class LessonResource(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='lessons/resources/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

import random
import string

def generate_certificate_id():
    # Format XXXX-XXXX (8 uppercase letters/digits)
    part1 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    part2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{part1}-{part2}"

class FinalTestQuestion(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='final_questions')
    question_text = models.TextField()
    image = models.CharField(max_length=500, blank=True, null=True)
    options = models.JSONField(help_text='List of {"text": "...", "is_correct": true/false, "image_url": "..."}')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.question_text[:50] + '...' if len(self.question_text) > 50 else self.question_text


class Certificate(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    certificate_id = models.CharField(max_length=9, unique=True, default=generate_certificate_id)
    issued_at = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(default=0)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.full_name} - {self.course.title} ({self.certificate_id})"

class UploadedMedia(models.Model):
    file = models.FileField(upload_to='uploads/media/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.file.name

class TestAttempt(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='test_attempts')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='test_attempts')
    score = models.IntegerField(default=0)
    is_passed = models.BooleanField(default=False)
    details = models.JSONField(help_text='List of user answers and correctness')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.phone} - {self.lesson.title} - Score: {self.score}"

class FinalTestAttempt(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='final_test_attempts')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='final_test_attempts')
    score = models.IntegerField(default=0)
    is_passed = models.BooleanField(default=False)
    details = models.JSONField(help_text='List of user answers and correctness')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.phone} - {self.course.title} Final Test - Score: {self.score}"
