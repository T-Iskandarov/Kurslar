import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        sed -i 's/proxy_pass http:\\/\\/127.0.0.1:8000;/proxy_pass http:\\/\\/127.0.0.1:8080;/' /etc/nginx/sites-available/api.kurslarim.uz
        systemctl reload nginx
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
