import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        sftp = client.open_sftp()
        sftp.get('/root/Kurslar/build.log', 'build.log')
        sftp.close()
        
        with open('build.log', 'r', encoding='utf-8', errors='ignore') as f:
            print("BUILD LOG:")
            lines = f.readlines()
            print("".join(lines[-30:]))
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
