import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mening_loyiham.settings')
django.setup()

from kurslar.models import CustomUser

phone = '+998901234567'
password = 'Ferrari377274'

if not CustomUser.objects.filter(phone=phone).exists():
    CustomUser.objects.create_superuser(phone=phone, password=password, full_name='Admin User')
    print('Superuser created successfully.')
else:
    print('Superuser already exists.')
