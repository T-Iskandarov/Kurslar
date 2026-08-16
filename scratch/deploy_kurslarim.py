import paramiko
import os

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
            out = stdout.read().decode('utf-8')
            err = stderr.read().decode('utf-8')
            if out: print(out)
            if err: print(f"ERROR: {err}")
            print(f"[EXIT STATUS] {exit_status}")
            if exit_status != 0:
                print("Stopping execution due to error.")
                break
            
    except Exception as e:
        print(f"Connection Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    host = '169.58.49.5'
    user = 'root'
    password = 'Ferrari3377274'
    
    # Base command for writing .env.production
    env_content = """
SECRET_KEY=django-insecure-prod-key-for-kurslarim
DEBUG=False
ALLOWED_HOSTS=169.58.49.5,api.kurslarim.uz,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://169.58.49.5,https://kurslarim.uz,http://kurslarim.uz,http://localhost:3000
DB_NAME=kurslarim_db
DB_USER=kurslarim_user
DB_PASSWORD=supersecurepassword123
DB_HOST=db
DB_PORT=5432
"""
    
    commands = [
        "mkdir -p /var/www",
        "rm -rf /var/www/kurslarim", # Clean if exists
        "cd /var/www && git clone https://github.com/T-Iskandarov/Kurslar.git kurslarim",
        f"cat << 'EOF' > /var/www/kurslarim/.env.production\n{env_content.strip()}\nEOF",
        "cd /var/www/kurslarim && docker compose up -d --build",
    ]
    
    execute(host, 22, user, password, commands)
