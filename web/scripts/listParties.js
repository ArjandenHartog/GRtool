const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/2022.json', 'utf-8'));
const variations = new Set();
for (const g of data) {
    for (const p of g.partijen) {
        if (p.naam.toLowerCase().includes('sgp') || p.naam.toLowerCase().includes('christenunie')) {
            variations.add(p.naam);
        }
    }
}
console.log(Array.from(variations).sort());
