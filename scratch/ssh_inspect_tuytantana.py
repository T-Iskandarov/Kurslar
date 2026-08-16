import paramiko

def inspect_tuytantana(host, port, user, password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=password, timeout=10)
        print(f"Connected to {host}")
        
        commands = [
            "ls -la /root/tuy-tantana",
            "ls -la /root/tuy-tantana/django_backend",
            "cat /root/tuy-tantana/django_backend/requirements.txt",
            "cat /root/tuy-tantana/telegram_bot/requirements.txt"
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
    inspect_tuytantana(host, 22, user, password)
