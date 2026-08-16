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
            if out: print(out)
            if err: print(f"ERROR: {err}")
            print(f"[EXIT STATUS] {exit_status}")
            
    except Exception as e:
        print(f"Connection Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    host = '169.58.49.5'
    user = 'root'
    password = 'Ferrari3377274'
    
    django_dockerfile = """
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "--bind", "0.0.0.0:8001", "config.wsgi:application"]
"""

    bot_dockerfile = """
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "bot.py"]
"""

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
"""

    commands = [
        f"cat << 'EOF' > /root/tuy-tantana/django_backend/Dockerfile\n{django_dockerfile.strip()}\nEOF",
        f"cat << 'EOF' > /root/tuy-tantana/telegram_bot/Dockerfile\n{bot_dockerfile.strip()}\nEOF",
        f"cat << 'EOF' > /root/tuy-tantana/docker-compose.yml\n{docker_compose.strip()}\nEOF",
    ]
    
    execute(host, 22, user, password, commands)
