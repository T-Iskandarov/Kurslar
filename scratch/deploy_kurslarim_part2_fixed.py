import paramiko
import secrets

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        secret_key = secrets.token_urlsafe(50)
        db_password = secrets.token_urlsafe(16)
        
        command = f"""
        cd /root/Kurslar
        cp .env.production.example .env.production
        sed -i 's/CHANGE_ME_TO_RANDOM_SECRET_KEY/{secret_key}/g' .env.production
        sed -i 's/CHANGE_ME_TO_STRONG_PASSWORD/{db_password}/g' .env.production
        
        # Make sure ALLOWED_HOSTS exists
        if ! grep -q "ALLOWED_HOSTS" .env.production; then
            echo "ALLOWED_HOSTS=api.kurslarim.uz,169.58.49.5" >> .env.production
        fi
        
        docker compose down
        docker compose build
        docker compose up -d
        """
        stdin, stdout, stderr = client.exec_command(command)
        
        for line in stdout:
            print(line, end='')
            
        err = stderr.read().decode('utf-8')
        if err:
            print("STDERR:")
            print(err)
            
    finally:
        client.close()

if __name__ == '__main__':
    run()
