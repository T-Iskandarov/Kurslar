import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        py_script = """
import builtins
from django.contrib.auth import get_user_model
User = get_user_model()
with open('/app/admin_info.txt', 'w') as f:
    for su in User.objects.filter(is_superuser=True):
        f.write('ADMIN_PHONE:' + str(su.phone) + '\\n')
"""
        
        command = f"""
        cat << 'EOF' > /root/Kurslar/get_admin_file.py
{py_script}
EOF
        docker cp /root/Kurslar/get_admin_file.py kurslarim_web:/app/get_admin_file.py
        docker exec kurslarim_web python manage.py shell < /root/Kurslar/get_admin_file.py
        docker exec kurslarim_web cat /app/admin_info.txt
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
