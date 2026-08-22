import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = "docker exec kurslarim_web python manage.py runbot"
        stdin, stdout, stderr = client.exec_command(command)
        print("STDOUT:")
        # Read a bit of stdout to see if it prints "Starting bot..."
        for line in stdout:
            print(line.strip())
            break
        print("STDERR:")
        for line in stderr:
            print(line.strip())
            break
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
