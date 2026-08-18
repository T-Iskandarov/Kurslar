import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        cd /root/Kurslar
        docker compose exec -T web python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(phone='+998973173497'); user.set_password('Ferrari3377274'); user.save(); print('Password updated!')"
        """
        stdin, stdout, stderr = client.exec_command(command)
        print("STDOUT:")
        print(stdout.read().decode('utf-8'))
        
        err = stderr.read().decode('utf-8')
        if err:
            print("STDERR:")
            print(err)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
