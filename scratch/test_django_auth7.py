import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        py_script = """import sys
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mening_loyiham.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(phone='+998901234567')
    user.set_password('admin1234')
    user.save()
    print('USER FOUND:', user.phone)
    print('IS ACTIVE:', user.is_active)
    print('CHECK PASSWORD AFTER SAVE:', user.check_password('admin1234'))
except User.DoesNotExist:
    print('USER DOES NOT EXIST, CREATING IT...')
    User.objects.create_superuser(phone='+998901234567', password='admin1234')
    print('CREATED NEW USER')
except Exception as e:
    print('ERROR:', str(e))
"""
        
        command = f"""
        cat << 'EOF' > /root/Kurslar/test_auth7.py
{py_script}
EOF
        docker cp /root/Kurslar/test_auth7.py kurslarim_web:/app/test_auth7.py
        docker exec kurslarim_web python /app/test_auth7.py
        """
        stdin, stdout, stderr = client.exec_command(command)
        
        print("RESULT:")
        print(stdout.read().decode('utf-8', errors='replace'))
        print("ERRORS:")
        print(stderr.read().decode('utf-8', errors='replace'))
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
