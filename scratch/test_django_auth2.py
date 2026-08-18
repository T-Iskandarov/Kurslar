import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        py_script = """
import sys
from django.contrib.auth import authenticate
user = authenticate(phone='+998973173497', password='admin1234')
with open('/app/auth_test.txt', 'w') as f:
    if user:
        f.write('AUTHENTICATED: ' + str(user.phone) + '\\n')
    else:
        f.write('FAILED TO AUTHENTICATE\\n')
sys.exit(0)
"""
        
        command = f"""
        cat << 'EOF' > /root/Kurslar/test_auth.py
{py_script}
EOF
        docker cp /root/Kurslar/test_auth.py kurslarim_web:/app/test_auth.py
        docker exec kurslarim_web python manage.py shell < /root/Kurslar/test_auth.py
        docker exec kurslarim_web cat /app/auth_test.txt
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
