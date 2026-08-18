import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        py_script = """
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin1234')
    print('Created new admin user')
else:
    u = User.objects.get(username='admin')
    u.set_password('admin1234')
    u.save()
    print('Reset password for existing admin user')
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
