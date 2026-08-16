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
    
    nginx_config = """
server {
    server_name api.tuytantana.uz 169.58.49.5;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /root/tuy-tantana/django_backend/staticfiles/;
    }

    location /uploads/ {
        alias /root/tuy-tantana/uploads/;
    }

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://127.0.0.1:8001;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.tuytantana.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tuytantana.uz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
server {
    if ($host = api.tuytantana.uz) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name api.tuytantana.uz 169.58.49.5;
    return 404;
}
"""

    commands = [
        # 1. Migrate Kurslarim
        "cd /var/www/kurslarim && docker compose exec -T web python manage.py migrate",
        "cd /var/www/kurslarim && docker compose exec -T web python manage.py createsuperuser --phone 998901234567 --full_name Admin --noinput", # We'll try, might fail if no such flag
        
        # 2. Stop old tuytantana
        "pkill -f 'gunicorn.*tuytantana'",
        "pkill -f 'bot.py'",
        
        # 3. Update Nginx for tuytantana
        f"cat << 'EOF' > /etc/nginx/sites-available/tuytantana\n{nginx_config.strip()}\nEOF",
        "nginx -t",
        "systemctl reload nginx",
        
        # 4. Start Tuytantana in Docker
        "cd /root/tuy-tantana && docker compose up -d --build",
    ]
    
    execute(host, 22, user, password, commands)
