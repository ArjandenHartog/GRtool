import fs from 'fs';
import path from 'path';
import { Gemeente, Partij, RestZetel } from './types';

export type { Gemeente, Partij, RestZetel } from './types';
export { BESCHIKBARE_JAREN } from './types';
export type { Jaar } from './types';

const cache = new Map<string, Gemeente[]>();

export function getAllGemeenten(jaar: string = '2022'): Gemeente[] {
  if (cache.has(jaar)) return cache.get(jaar)!;

  const dataPath = path.join(process.cwd(), 'public', 'data', `${jaar}.json`);
  if (!fs.existsSync(dataPath)) {
    console.warn(`JSON data not found for year ${jaar} at ${dataPath}. Run 'npm run prebuild' first.`);
    return [];
  }

  const json = fs.readFileSync(dataPath, 'utf-8');
  const gemeenten = JSON.parse(json) as Gemeente[];
  
  cache.set(jaar, gemeenten);
  return gemeenten;
}
