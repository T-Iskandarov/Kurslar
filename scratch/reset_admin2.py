import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        py_script = """
from django.contrib.auth import get_user_model
User = get_user_model()
superusers = User.objects.filter(is_superuser=True)
if superusers.exists():
    for su in superusers:
        su.set_password('admin1234')
        su.save()
        print(f"Reset password to 'admin1234' for existing superuser: {su.phone}")
else:
    try:
        User.objects.create_superuser(phone='+998901234567', password='admin1234')
        print('Created new superuser: +998901234567 / admin1234')
    except Exception as e:
        print('Failed to create superuser:', str(e))
"""
        
        command = f"""
        docker exec kurslarim_web python manage.py shell -c "{py_script}"
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
