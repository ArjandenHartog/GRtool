import fs from 'fs';
import path from 'path';

const TK2025_CSV = 'c:/projects/gr/data/TK2025/TK2025_uitslag.csv';
const TK2023_CSV = 'c:/projects/gr/data/TK2023/TK2023_uitslag.csv';
const OUT_DIR = path.join(process.cwd(), 'public', 'data');

interface TkResult {
  naam: string;
  cbsCode: string;
  partijen: Record<string, number>;
}

function processTk(filePath: string): TkResult[] {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(';');

  const vTypeIdx = headers.indexOf('VeldType');
  const valueIdx = headers.indexOf('Waarde');
  const regioIdx = headers.indexOf('Regio');
  const regioCodeIdx = headers.indexOf('RegioCode');
  const partijIdx = headers.indexOf('LijstNaam'); // Using LijstNaam for party

  const results: Record<string, TkResult> = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(';');

    const regioCode = cols[regioCodeIdx];
    if (!regioCode?.startsWith('G')) continue; // Only municipalities

    const veldType = cols[vTypeIdx];
    if (veldType !== 'LijstAantalStemmen') continue;

    const regioNaam = cols[regioIdx];
    const partij = cols[partijIdx];
    const stemmen = parseInt(cols[valueIdx], 10);

    if (!results[regioCode]) {
      results[regioCode] = {
        naam: regioNaam,
        cbsCode: regioCode.substring(1), // Remove 'G'
        partijen: {}
      };
    }

    if (partij) {
      // Normalize party name
      const normalizedPartij = partij.split(' (')[0].trim();
      results[regioCode].partijen[normalizedPartij] = (results[regioCode].partijen[normalizedPartij] || 0) + stemmen;
    }
  }

  return Object.values(results);
}

console.log('Processing TK2025...');
const tk2025 = processTk(TK2025_CSV);
fs.writeFileSync(path.join(OUT_DIR, 'tk2025.json'), JSON.stringify(tk2025), 'utf-8');
console.log(`Saved ${tk2025.length} municipalities to tk2025.json`);

console.log('Processing TK2023...');
const tk2023 = processTk(TK2023_CSV);
fs.writeFileSync(path.join(OUT_DIR, 'tk2023.json'), JSON.stringify(tk2023), 'utf-8');
console.log(`Saved ${tk2023.length} municipalities to tk2023.json`);

console.log('Done!');
