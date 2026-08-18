import paramiko

def check_server():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        command = """
        cat /etc/nginx/sites-available/tuytantana
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
