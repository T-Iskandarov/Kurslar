import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        service_file = """[Unit]
Description=Kurslar Telegram Bot
After=network.target

[Service]
User=root
WorkingDirectory=/root/Kurslar
EnvironmentFile=/root/Kurslar/.env.production
ExecStart=/usr/bin/docker exec kurslarim_web python manage.py runbot
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
"""
        # Create service file
        stdin, stdout, stderr = client.exec_command("cat > /etc/systemd/system/kurslar-bot.service")
        stdin.write(service_file)
        stdin.channel.shutdown_write()
        stdout.read()
        
        # Reload daemon and start
        client.exec_command("systemctl daemon-reload")
        client.exec_command("systemctl enable kurslar-bot.service")
        client.exec_command("systemctl restart kurslar-bot.service")
        
        print("Service created and started!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
