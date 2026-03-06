import json
import sys

with open('c:/projects/gr/web/public/data/tk2025.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    if item['cbsCode'] == '1740':
        print(json.dumps(item, indent=2))
        break
