import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        echo "SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')" >> /root/Kurslar/mening_loyiham/mening_loyiham/settings.py
        cd /root/Kurslar
        docker-compose up -d --build web
        curl -I https://api.kurslarim.uz/api/v1/courses/
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
