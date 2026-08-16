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
    
    docker_compose = """
version: '3.8'

services:
  api:
    build:
      context: ./django_backend
    container_name: tuytantana_api
    restart: always
    ports:
      - "8001:8001"
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
    volumes:
      - ./telegram_bot:/app
      - ./django_backend:/app/django_backend
"""

    commands = [
        "cp /root/tuy-tantana/django_backend/requirements.txt /root/tuy-tantana/telegram_bot/requirements.txt",
        "sed -i 's/RUN pip install/RUN apt-get update \\&\\& apt-get install -y gcc libpq-dev \\&\\& pip install/g' /root/tuy-tantana/telegram_bot/Dockerfile",
        f"cat << 'EOF' > /root/tuy-tantana/docker-compose.yml\n{docker_compose.strip()}\nEOF",
        "cd /root/tuy-tantana && docker compose up -d --build bot",
    ]
    execute(host, 22, user, password, commands)
