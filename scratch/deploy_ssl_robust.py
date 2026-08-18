import paramiko
import sys

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print("Connecting to server...")
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=30)
        print("Connected.")
        
        command = """
        certbot --nginx -d api.kurslarim.uz --non-interactive --agree-tos -m tursunpulatiskandarov@gmail.com
        """
        print("Executing certbot...")
        stdin, stdout, stderr = client.exec_command(command)
        
        exit_status = stdout.channel.recv_exit_status()
        
        print("RESULT:")
        print(stdout.read().decode('utf-8', errors='replace'))
        print("ERRORS:")
        print(stderr.read().decode('utf-8', errors='replace'))
        print(f"Exit status: {exit_status}")
        
    except Exception as e:
        print(f"Exception occurred: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
