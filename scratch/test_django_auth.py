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
if user:
    print('AUTHENTICATED:', user.phone)
else:
    print('FAILED TO AUTHENTICATE')
sys.exit(0)
"""
        
        command = "docker exec -i kurslarim_web python manage.py shell"
        stdin, stdout, stderr = client.exec_command(command)
        
        stdin.write(py_script)
        stdin.channel.shutdown_write()
        
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
