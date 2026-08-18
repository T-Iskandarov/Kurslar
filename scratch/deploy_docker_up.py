import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        cat << 'EOF' > /root/Kurslar/run_docker.sh
#!/bin/bash
cd /root/Kurslar
docker rm -f kurslarim_db kurslarim_web kurslarim_nginx > /dev/null 2>&1
docker compose --env-file .env down
docker compose --env-file .env up -d > docker_up.log 2>&1
docker compose ps >> docker_up.log 2>&1
EOF
        chmod +x /root/Kurslar/run_docker.sh
        /root/Kurslar/run_docker.sh
        cat /root/Kurslar/docker_up.log
        """
        stdin, stdout, stderr = client.exec_command(command)
        
        print("STDOUT:")
        print(stdout.read().decode('utf-8', errors='ignore'))
        
        err = stderr.read().decode('utf-8', errors='ignore')
        if err:
            print("STDERR:")
            print(err)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
