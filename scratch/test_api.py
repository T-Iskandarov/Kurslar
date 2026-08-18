import urllib.request
import urllib.error

url = 'http://169.58.49.5/api/v1/courses/'
req = urllib.request.Request(url, headers={'Host': 'api.kurslarim.uz'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print("Response:", response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print(f"Error: {e}")
