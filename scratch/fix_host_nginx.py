import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        cat << 'EOF' > /etc/nginx/sites-available/api.kurslarim.uz
server {
    listen 80;
    server_name api.kurslarim.uz;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.kurslarim.uz;

    ssl_certificate /etc/letsencrypt/live/api.kurslarim.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.kurslarim.uz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
        systemctl reload nginx
        curl -I https://api.kurslarim.uz/media/courses/thumbnails/Screenshot_2026-08-16_170746.png
        """
        stdin, stdout, stderr = client.exec_command(command)
        
        print("RESULT:")
        print(stdout.read().decode('utf-8', errors='replace'))
        print("ERRORS:")
        print(stderr.read().decode('utf-8', errors='replace'))
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
