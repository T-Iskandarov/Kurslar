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
            # Handle unicode correctly for windows terminal
            if out: print(out.encode('cp1251', errors='replace').decode('cp1251'))
            if err: print(f"ERROR: {err.encode('cp1251', errors='replace').decode('cp1251')}")
            
    except Exception as e:
        print(f"Connection Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    host = '169.58.49.5'
    user = 'root'
    password = 'Ferrari3377274'
    commands = [
        "docker logs --tail 20 tuytantana_bot"
    ]
    execute(host, 22, user, password, commands)
