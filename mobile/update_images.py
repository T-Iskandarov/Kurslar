import re

with open('app/(auth)/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("image: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png'", "image: require('../../assets/images/onboarding/p1.png')")
content = content.replace("image: 'https://cdn-icons-png.flaticon.com/512/2436/2436874.png'", "image: require('../../assets/images/onboarding/p2.png')")
content = content.replace("image: 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png'", "image: require('../../assets/images/onboarding/p3.png')")

content = content.replace("source={{ uri: item.image }}", "source={item.image}")

with open('app/(auth)/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Images replaced")
