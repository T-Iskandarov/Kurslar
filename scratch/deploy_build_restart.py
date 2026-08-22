import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        command = "cd /root/Kurslar && git pull origin main && docker compose up -d --build web"
        stdin, stdout, stderr = client.exec_command(command)
        for line in stdout:
            print(line.strip())
        for line in stderr:
            print(line.strip())
    except Exception as e:
        print(e)
    finally:
        client.close()

if __name__ == '__main__':
    run()
