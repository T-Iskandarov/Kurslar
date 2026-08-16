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
        "sed -i 's/os.path.dirname(os.path.dirname(os.path.abspath(__file__)))/os.path.dirname(os.path.abspath(__file__))/g' /root/tuy-tantana/telegram_bot/bot_config.py",
        "cd /root/tuy-tantana && docker compose up -d bot",
        "sleep 5 && docker ps",
    ]
    execute(host, 22, user, password, commands)
