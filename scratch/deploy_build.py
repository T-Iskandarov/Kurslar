import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        cd /root/Kurslar
        docker compose --env-file .env up -d --build > build.log 2>&1
        docker compose ps >> build.log 2>&1
        """
        stdin, stdout, stderr = client.exec_command(command)
        
        # Wait for the command to finish
        exit_status = stdout.channel.recv_exit_status()
        print(f"Command exited with status: {exit_status}")
        
        # Download the file
        sftp = client.open_sftp()
        sftp.get('/root/Kurslar/build.log', 'build.log')
        sftp.close()
        
        with open('build.log', 'r', encoding='utf-8', errors='ignore') as f:
            print("BUILD LOG:")
            print(f.read())
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
