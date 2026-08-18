import paramiko

def check_server():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        command = """
        echo "=== NGINX CONFIG ==="
        cat /etc/nginx/sites-enabled/api.tuytantana.uz
        
        echo "=== COLLECT STATIC ==="
        docker exec -i tuytantana_api python manage.py collectstatic --noinput
        
        echo "=== CHECK STATIC DIR ==="
        ls -la /root/tuy-tantana/django_backend/staticfiles
        """
        stdin, stdout, stderr = client.exec_command(command)
        print("STDOUT:")
        print(stdout.read().decode('utf-8'))
        err = stderr.read().decode('utf-8')
        if err:
            print("STDERR:")
            print(err)
            
    finally:
        client.close()

if __name__ == '__main__':
    check_server()
