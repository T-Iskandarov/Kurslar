import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        cd /root/Kurslar
        git pull origin main
        
        # Build and start the new frontend container
        docker compose --env-file .env up -d --build > frontend_build.log 2>&1
        
        # Configure nginx for frontend
        cat << 'EOF' > /etc/nginx/sites-available/kurslarim.uz
server {
    listen 80;
    server_name kurslarim.uz www.kurslarim.uz;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
        ln -sf /etc/nginx/sites-available/kurslarim.uz /etc/nginx/sites-enabled/kurslarim.uz
        systemctl reload nginx
        """
        stdin, stdout, stderr = client.exec_command(command)
        
        # We don't wait for docker compose build fully here because it's detached in background or takes a while,
        # actually wait, it's NOT detached, it will block until build finishes. 
        # I piped it to frontend_build.log, but without `nohup &`, ssh will block until it finishes.
        # Let's wait and see the exit code.
        exit_status = stdout.channel.recv_exit_status()
        print(f"Command exited with status: {exit_status}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
