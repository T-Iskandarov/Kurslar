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
        sed -i 's/your_secret_key_here/{secret_key}/g' .env.production
        sed -i 's/your_secure_db_password_here/{db_password}/g' .env.production
        sed -i 's/ALLOWED_HOSTS=api.kurslarim.uz/ALLOWED_HOSTS=api.kurslarim.uz,169.58.49.5/g' .env.production
        
        cat .env.production
        
        docker-compose down
        docker-compose build
        docker-compose up -d
        """
        stdin, stdout, stderr = client.exec_command(command)
        
        # Read stdout line by line
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
