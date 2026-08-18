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
    server_name api.kurslarim.uz 169.58.49.5;

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
        client.exec_command(command)
        print("Nginx configured successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
