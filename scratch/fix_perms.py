import paramiko

def fix_perms():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        command = """
        chmod 711 /root
        chmod -R 755 /root/tuy-tantana
        chown -R www-data:www-data /root/tuy-tantana/django_backend/staticfiles
        systemctl reload nginx
        """
        client.exec_command(command)
        print("Permissions fixed.")
    finally:
        client.close()

if __name__ == '__main__':
    fix_perms()
