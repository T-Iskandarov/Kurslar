import paramiko
import json

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('169.58.49.5', port=22, username='root', password='Ferrari3377274', timeout=10)
        
        command = """
        curl -s https://api.kurslarim.uz/api/v1/courses/
        """
        stdin, stdout, stderr = client.exec_command(command)
        
        response = stdout.read().decode('utf-8')
        try:
            data = json.loads(response)
            print("Response is JSON!")
            if 'results' in data and len(data['results']) > 0:
                print("First item thumbnail:", data['results'][0].get('thumbnail'))
        except:
            print("Response:", response[:500])
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    run()
