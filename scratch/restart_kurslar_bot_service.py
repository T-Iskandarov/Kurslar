import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        # Kill the manual detached process
        client.exec_command("docker exec kurslarim_web pkill -f runbot")
        
        # Restart the systemd service
        client.exec_command("systemctl restart kurslar-bot.service")
        
        # Give it a second to start
        import time
        time.sleep(2)
        
        # Check logs
        command = "journalctl -u kurslar-bot.service -n 20 --no-pager"
        stdin, stdout, stderr = client.exec_command(command)
        out = stdout.read().decode('utf-8', errors='replace')
        print(out)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
