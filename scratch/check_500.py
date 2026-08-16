import paramiko

def execute(host, port, user, password, commands):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=password, timeout=10)
        
        for cmd in commands:
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode('utf-8', errors='replace')
            err = stderr.read().decode('utf-8', errors='replace')
            if out: print(out)
            if err: print(f"ERROR: {err}")
            
    except Exception as e:
        print(f"Connection Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    host = '169.58.49.5'
    user = 'root'
    password = 'Ferrari3377274'
    
    commands = [
        "sed -i 's/DEBUG=False/DEBUG=True/g' /root/tuy-tantana/docker-compose.yml",
        "cd /root/tuy-tantana && docker compose up -d api",
        "sleep 5",
        "curl -s -H 'X-Forwarded-Proto: https' http://127.0.0.1:8001/api/services?limit=5 | grep -i 'Exception'",
    ]
    execute(host, 22, user, password, commands)
