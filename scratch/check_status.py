import paramiko

def check_status(host, port, user, password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=password, timeout=10)
        print(f"Connected to {host}")
        
        commands = [
            "cd /var/www/kurslarim && docker compose ps",
            "/root/tuy-tantana/django_backend/venv/bin/pip freeze > /root/tuy-tantana/django_backend/requirements.txt",
            "cat /root/tuy-tantana/django_backend/requirements.txt"
        ]
        
        for cmd in commands:
            print(f"\n--- {cmd} ---")
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode('utf-8')
            err = stderr.read().decode('utf-8')
            if out: print(out)
            if err: print(f"ERROR: {err}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    host = '169.58.49.5'
    user = 'root'
    password = 'Ferrari3377274'
    check_status(host, 22, user, password)
