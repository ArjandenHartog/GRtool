import json
with open('c:/projects/gr/web/public/data/2022.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
for g in data:
    if g['naam'] == 'Rotterdam':
        print(json.dumps(g, indent=2))
        break
