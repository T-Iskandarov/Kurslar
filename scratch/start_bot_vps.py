import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = "docker exec -d kurslarim_web python manage.py runbot"
        stdin, stdout, stderr = client.exec_command(command)
        print("STDOUT:")
        print(stdout.read().decode('utf-8'))
        print("STDERR:")
        print(stderr.read().decode('utf-8'))
        
        # Check if it started
        command = "docker exec kurslarim_web ps aux | grep runbot"
        stdin, stdout, stderr = client.exec_command(command)
        print("STDOUT (check):")
        print(stdout.read().decode('utf-8'))
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
