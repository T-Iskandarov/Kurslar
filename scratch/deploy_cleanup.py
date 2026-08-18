import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        cd /root/Kurslar
        git pull origin main
        docker compose up -d --remove-orphans
        
        # Remove the frontend nginx config
        rm -f /etc/nginx/sites-enabled/kurslarim.uz
        rm -f /etc/nginx/sites-available/kurslarim.uz
        
        # Add api nginx config
        cat << 'EOF' > /etc/nginx/sites-available/api.kurslarim.uz
server {
    listen 80;
    server_name api.kurslarim.uz;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
        ln -sf /etc/nginx/sites-available/api.kurslarim.uz /etc/nginx/sites-enabled/api.kurslarim.uz
        systemctl reload nginx
        """
        stdin, stdout, stderr = client.exec_command(command)
        
        print("RESULT:")
        print(stdout.read().decode('utf-8', errors='replace'))
        print(stderr.read().decode('utf-8', errors='replace'))
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
