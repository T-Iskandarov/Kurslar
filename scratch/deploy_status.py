import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        cd /root/Kurslar
        docker compose ps > ps_output.txt
        docker compose logs --tail=50 >> ps_output.txt
        """
        client.exec_command(command)
        
        # Download the file
        sftp = client.open_sftp()
        sftp.get('/root/Kurslar/ps_output.txt', 'ps_output.txt')
        sftp.close()
        
        with open('ps_output.txt', 'r', encoding='utf-8', errors='ignore') as f:
            print("SERVER STATUS:")
            print(f.read())
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
