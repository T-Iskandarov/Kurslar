import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        ls /etc/systemd/system/ | grep bot
        ls -la /etc/systemd/system/kurslar*
        cat /etc/systemd/system/kurslarim-bot.service
        """
        stdin, stdout, stderr = client.exec_command(command)
        print("STDOUT:")
        print(stdout.read().decode('utf-8'))
        
        err = stderr.read().decode('utf-8')
        if err:
            print("STDERR:")
            print(err)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
