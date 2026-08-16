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
    
    script = """
cat << 'EOF' > /etc/nginx/sites-available/tuytantana
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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
EOF
nginx -t && systemctl reload nginx
"""
    commands = [script]
    execute(host, 22, user, password, commands)
