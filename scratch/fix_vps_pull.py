import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        command = "cd /root/Kurslar && rm -f ps_output.txt && git fetch && git reset --hard origin/main && docker compose restart web"
        stdin, stdout, stderr = client.exec_command(command)
        print("STDOUT:")
        print(stdout.read().decode('utf-8'))
        print("STDERR:")
        print(stderr.read().decode('utf-8'))
    except Exception as e:
        print(e)
    finally:
        client.close()

if __name__ == '__main__':
    run()
