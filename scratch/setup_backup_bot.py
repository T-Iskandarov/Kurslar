import paramiko
import sys

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print("Connecting to server...")
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        script = """#!/bin/bash
# Backup script for Kurslarim
set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BOT_TOKEN="8801452757:AAH10nWXZfLWSoUJCDxUzXtTgSDQOVouCpo"
CHAT_ID="870644223"
BACKUP_DIR="/tmp/kurslarim_backups"

mkdir -p $BACKUP_DIR

# DB Backup
DB_SQL="$BACKUP_DIR/kurslarim_backup_${TIMESTAMP}.sql"
DB_TAR="$BACKUP_DIR/kurslarim_backup_${TIMESTAMP}.sql.tar.gz"

echo "Dumping database..."
# Run pg_dump inside the db container. 
docker exec kurslarim_db pg_dump -U kurslarim_user kurslarim_db > "$DB_SQL"

echo "Compressing DB..."
tar -czf "$DB_TAR" -C "$BACKUP_DIR" $(basename "$DB_SQL")

# Media Backup
MEDIA_TAR="$BACKUP_DIR/kurslarim_media_${TIMESTAMP}.tar.gz"
echo "Compressing media volume..."
docker run --rm -v kurslarim_media:/media -v $BACKUP_DIR:/backup alpine tar czf /backup/$(basename "$MEDIA_TAR") -C /media .

echo "Sending to Telegram..."
curl -s -F chat_id="$CHAT_ID" -F document=@"$DB_TAR" -F caption="Baza Zaxirasi (SQL) - $(date +"%Y-%m-%d %H:%M")" https://api.telegram.org/bot$BOT_TOKEN/sendDocument
curl -s -F chat_id="$CHAT_ID" -F document=@"$MEDIA_TAR" -F caption="Rasmlar Zaxirasi (Media) - $(date +"%Y-%m-%d %H:%M")" https://api.telegram.org/bot$BOT_TOKEN/sendDocument

echo "Cleaning up local backup files..."
rm -f "$DB_SQL" "$DB_TAR" "$MEDIA_TAR"

echo "Backup finished successfully!"
"""
        
        print("Creating backup script on server...")
        stdin, stdout, stderr = client.exec_command("cat > /root/Kurslar/backup_to_telegram.sh")
        stdin.write(script)
        stdin.channel.shutdown_write()
        
        # Wait for command to complete
        stdout.read()
        
        print("Making script executable and setting up cron...")
        command = """
        chmod +x /root/Kurslar/backup_to_telegram.sh
        
        # Remove old cronjob if exists, then add the new one (runs at 03:00 daily)
        crontab -l | grep -v 'backup_to_telegram.sh' > mycron || true
        echo "0 3 * * * /root/Kurslar/backup_to_telegram.sh >> /var/log/kurslarim_backup.log 2>&1" >> mycron
        crontab mycron
        rm mycron
        """
        stdin, stdout, stderr = client.exec_command(command)
        print("STDOUT:", stdout.read().decode('utf-8'))
        print("STDERR:", stderr.read().decode('utf-8'))
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
