import paramiko
import sys

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print("Connecting to server...")
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        print("Executing backup script manually for testing...")
        stdin, stdout, stderr = client.exec_command("/root/Kurslar/backup_to_telegram.sh")
        
        print("STDOUT:", stdout.read().decode('utf-8'))
        print("STDERR:", stderr.read().decode('utf-8'))
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
