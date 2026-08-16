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
    
    docker_compose_kurslarim = """
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: kurslarim_db
    restart: always
    volumes:
      - kurslarim_postgres_data:/var/lib/postgresql/data
    env_file:
      - .env.production
    environment:
      POSTGRES_DB: ${DB_NAME:-kurslarim_db}
      POSTGRES_USER: ${DB_USER:-kurslarim_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    networks:
      - kurslarim_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-kurslarim_user} -d ${DB_NAME:-kurslarim_db}"]
      interval: 5s
      timeout: 5s
      retries: 5

  web:
    build: .
    container_name: kurslarim_web
    restart: always
    volumes:
      - kurslarim_media:/app/media
      - kurslarim_static:/app/staticfiles
    env_file:
      - .env.production
    environment:
      DB_HOST: db
      DB_PORT: 5432
    depends_on:
      db:
        condition: service_healthy
    networks:
      - kurslarim_network
    command: >
      sh -c "python manage.py migrate --noinput &&
             gunicorn mening_loyiham.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120"

  nginx:
    image: nginx:alpine
    container_name: kurslarim_nginx
    restart: always
    ports:
      - "8080:80"
    volumes:
      - ./nginx/kurslarim.conf:/etc/nginx/conf.d/default.conf
      - kurslarim_media:/app/media:ro
      - kurslarim_static:/app/staticfiles:ro
    depends_on:
      - web
    networks:
      - kurslarim_network

volumes:
  kurslarim_postgres_data:
  kurslarim_media:
  kurslarim_static:

networks:
  kurslarim_network:
    driver: bridge
"""

    commands = [
        f"cat << 'EOF' > /var/www/kurslarim/docker-compose.yml\n{docker_compose_kurslarim.strip()}\nEOF",
        "cd /var/www/kurslarim && docker compose down",
        "cd /var/www/kurslarim && docker compose up -d",
        "cd /var/www/kurslarim && docker compose ps",
        "cd /var/www/kurslarim && docker compose exec -T web python manage.py migrate",
        "cd /var/www/kurslarim && docker compose exec -T web python manage.py collectstatic --noinput",
    ]
    
    execute(host, 22, user, password, commands)
