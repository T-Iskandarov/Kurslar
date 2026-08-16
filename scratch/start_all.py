import paramiko

def execute(host, port, user, password, commands):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=password, timeout=10)
        print(f"Connected to {host}")
        
        for cmd in commands:
            print(f"\n[RUNNING] {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd)
            exit_status = stdout.channel.recv_exit_status()
            out = stdout.read().decode('utf-8', errors='replace')
            err = stderr.read().decode('utf-8', errors='replace')
            # Handle unicode correctly for windows terminal
            if out: print(out.encode('cp1251', errors='replace').decode('cp1251'))
            if err: print(f"ERROR: {err.encode('cp1251', errors='replace').decode('cp1251')}")
            print(f"[EXIT STATUS] {exit_status}")
            
    except Exception as e:
        print(f"Connection Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    host = '169.58.49.5'
    user = 'root'
    password = 'Ferrari3377274'
    
    commands = [
        "cd /var/www/kurslarim && docker compose up -d",
        "cd /var/www/kurslarim && docker compose exec -T web python manage.py migrate",
        "cd /root/tuy-tantana && docker compose up -d --build",
        "docker ps"
    ]
    
    execute(host, 22, user, password, commands)
