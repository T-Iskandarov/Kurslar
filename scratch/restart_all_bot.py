import paramiko
import time

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        print("Restarting web container to kill rogue runbot processes...")
        client.exec_command("docker restart kurslarim_web")
        time.sleep(10)
        
        print("Restarting systemd bot service...")
        client.exec_command("systemctl restart kurslar-bot.service")
        time.sleep(5)
        
        print("Checking logs...")
        command = "journalctl -u kurslar-bot.service -n 10 --no-pager"
        stdin, stdout, stderr = client.exec_command(command)
        out = stdout.read().decode('utf-8', errors='replace')
        print(out)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
