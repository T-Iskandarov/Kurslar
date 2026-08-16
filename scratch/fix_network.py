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
    
    docker_compose = """
version: '3.8'

services:
  api:
    build:
      context: ./django_backend
    container_name: tuytantana_api
    restart: always
    network_mode: "host"
    volumes:
      - ./django_backend:/app
      - ./uploads:/root/tuy-tantana/uploads
    environment:
      - DEBUG=False

  bot:
    build:
      context: ./telegram_bot
    container_name: tuytantana_bot
    restart: always
    network_mode: "host"
    volumes:
      - ./telegram_bot:/app
      - ./django_backend:/app/django_backend
"""

    commands = [
        f"cat << 'EOF' > /root/tuy-tantana/docker-compose.yml\n{docker_compose.strip()}\nEOF",
        "cd /root/tuy-tantana && docker compose down && docker compose up -d",
        "sleep 5",
        "curl -s -H 'X-Forwarded-Proto: https' http://127.0.0.1:8001/api/services?limit=5 | head -n 10"
    ]
    execute(host, 22, user, password, commands)
