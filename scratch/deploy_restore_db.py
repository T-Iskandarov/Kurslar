import paramiko
import os

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print("Connecting to server...")
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        print("Uploading database dump...")
        sftp = client.open_sftp()
        sftp.put('scratch/lms_db_dump.sql', '/root/Kurslar/lms_db_dump.sql')
        sftp.close()
        
        print("Restoring database on server...")
        command = """
        cd /root/Kurslar
        docker compose exec -T db psql -U kurslarim_user -d kurslarim_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        cat lms_db_dump.sql | docker compose exec -T db psql -U kurslarim_user -d kurslarim_db
        """
        stdin, stdout, stderr = client.exec_command(command)
        
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        
        print("STDOUT:")
        # print first and last few lines to avoid spam
        lines = out.splitlines()
        if len(lines) > 20:
            print("\n".join(lines[:10]))
            print("...")
            print("\n".join(lines[-10:]))
        else:
            print(out)
            
        if err:
            print("STDERR:")
            print(err)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
