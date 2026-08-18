import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        cat << 'EOF' > /etc/nginx/sites-available/api.kurslarim.uz
server {
    server_name api.kurslarim.uz;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_addrs;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /media/ {
        alias /root/Kurslar/media/;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.kurslarim.uz/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.kurslarim.uz/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = api.kurslarim.uz) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name api.kurslarim.uz;
    return 404; # managed by Certbot


}
EOF
        systemctl reload nginx
        
        # Add SECURE_PROXY_SSL_HEADER to settings.py
        grep -q "SECURE_PROXY_SSL_HEADER" /root/Kurslar/mening_loyiham/mening_loyiham/settings.py || echo "SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')" >> /root/Kurslar/mening_loyiham/mening_loyiham/settings.py
        
        # Restart Gunicorn
        docker restart kurslarim_web
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
