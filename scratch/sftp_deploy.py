import os
import paramiko

def upload_dir(sftp, local_dir, remote_dir):
    try:
        sftp.mkdir(remote_dir)
    except IOError:
        pass
        
    for item in os.listdir(local_dir):
        # Exclude directories
        if item in ['.git', 'frontend', 'venv', '__pycache__', '.env', 'scratch', 'kurslarim.zip', '.gemini', '.pytest_cache']:
            continue
            
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if os.path.isfile(local_path):
            print(f"Uploading {local_path} to {remote_path}")
            sftp.put(local_path, remote_path)
        elif os.path.isdir(local_path):
            if "__pycache__" not in local_path:
                upload_dir(sftp, local_path, remote_path)

def deploy(host, port, user, password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=password, timeout=10)
        print(f"Connected to {host}")
        
        # Clean remote dir
        client.exec_command("rm -rf /var/www/kurslarim; mkdir -p /var/www/kurslarim")
        
        print("Uploading files via SFTP...")
        sftp = client.open_sftp()
        upload_dir(sftp, "C:\\Users\\CUBO\\Desktop\\Vazifa", "/var/www/kurslarim")
        sftp.close()
        print("Upload complete.")
        
        # Base command for writing .env.production
        env_content = """
SECRET_KEY=django-insecure-prod-key-for-kurslarim
DEBUG=False
ALLOWED_HOSTS=169.58.49.5,api.kurslarim.uz,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://169.58.49.5,https://kurslarim.uz,http://kurslarim.uz,http://localhost:3000
DB_NAME=kurslarim_db
DB_USER=kurslarim_user
DB_PASSWORD=supersecurepassword123
DB_HOST=db
DB_PORT=5432
"""
        
        commands = [
            f"cat << 'EOF' > /var/www/kurslarim/.env.production\n{env_content.strip()}\nEOF",
            "cd /var/www/kurslarim && docker compose up -d --build",
            "cd /var/www/kurslarim && docker compose exec -T api python manage.py migrate",
            "cd /var/www/kurslarim && docker compose exec -T api python manage.py collectstatic --noinput"
        ]
        
        for cmd in commands:
            print(f"\n[RUNNING] {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd)
            exit_status = stdout.channel.recv_exit_status()
            out = stdout.read().decode('utf-8')
            err = stderr.read().decode('utf-8')
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
    deploy(host, 22, user, password)
