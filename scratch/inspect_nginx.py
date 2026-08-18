import paramiko
import sys

def run_ssh_command(host, port, user, password, command):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=password, timeout=10)
        print(f"Connected to {host}")
        stdin, stdout, stderr = client.exec_command(command)
        output = stdout.read().decode('utf-8')
        err = stderr.read().decode('utf-8')
        
        if output:
            print("STDOUT:")
            print(output)
        if err:
            print("STDERR:")
            print(err)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    host = '169.58.49.5'
    user = 'root'
    password = 'Ferrari3377274#'
    command = "cat /root/tuy-tantana/docker-compose.yml; cat /root/tuy-tantana/nginx/nginx.conf
    run_ssh_command(host, 22, user, password, command)
