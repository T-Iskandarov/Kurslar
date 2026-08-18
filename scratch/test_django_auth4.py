import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        py_script = """
import sys
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(phone='+998973173497')
    print('USER FOUND:', user.phone)
    print('IS ACTIVE:', user.is_active)
    print('CHECK PASSWORD:', user.check_password('admin1234'))
except User.DoesNotExist:
    print('USER DOES NOT EXIST')
sys.exit(0)
"""
        
        command = f"""
        cat << 'EOF' > /root/Kurslar/test_auth4.py
{py_script}
EOF
        docker cp /root/Kurslar/test_auth4.py kurslarim_web:/app/test_auth4.py
        docker exec kurslarim_web python manage.py shell -c "$(cat /root/Kurslar/test_auth4.py)"
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
