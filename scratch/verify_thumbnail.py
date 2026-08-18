import requests

try:
    response = requests.get('https://api.kurslarim.uz/api/v1/courses/', verify=False)
    print("Status:", response.status_code)
    print("Text:", response.text[:200])
except Exception as e:
    print(e)
