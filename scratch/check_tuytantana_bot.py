import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = "systemctl status tuytantana-bot.service | head -n 5"
        stdin, stdout, stderr = client.exec_command(command)
        out = stdout.read().decode('utf-8', errors='replace')
        print(out)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
