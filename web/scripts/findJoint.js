const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/2022.json', 'utf-8'));
for (const g of data) {
    for (const p of g.partijen) {
        if (p.naam === 'ChristenUnie-SGP') {
            console.log(g.naam);
            break;
        }
    }
}
