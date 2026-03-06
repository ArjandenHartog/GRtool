import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import type { Gemeente, Partij } from './types';

export type { Gemeente, Partij } from './types';
export { BESCHIKBARE_JAREN } from './types';
export type { Jaar } from './types';

const ROOT_DIR = path.join(process.cwd(), '..');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  maxNestedTags: 2000,
  isArray: (_name: string, _jPath: string, _isLeaf: boolean, isAttr: boolean) => {
    if (!isAttr && _name === 'Selection') return true;
    return false;
  },
} as any);

const cache = new Map<string, Gemeente[]>();

export function getAllGemeenten(jaar: string = '2022'): Gemeente[] {
  if (cache.has(jaar)) return cache.get(jaar)!;

  const dataDir = path.join(ROOT_DIR, jaar);
  const prefix = `Resultaat_GR${jaar}_`;

  let files: string[] = [];
  try {
    files = fs
      .readdirSync(dataDir)
      .filter((f: string) => f.endsWith('.xml') && f.startsWith(prefix));
  } catch (e) {
    console.error(`Kon datamap niet lezen: ${dataDir}`, e);
    return [];
  }

  const gemeenten: Gemeente[] = [];
  for (const file of files) {
    try {
      const gemeente = parseFile(path.join(dataDir, file));
      if (gemeente) gemeenten.push(gemeente);
    } catch (e) {
      console.error(`Fout bij parsen van ${file}:`, e);
    }
  }

  gemeenten.sort((a, b) => a.naam.localeCompare(b.naam, 'nl'));
  cache.set(jaar, gemeenten);
  return gemeenten;
}

function parseFile(filePath: string): Gemeente | null {
  const xml = fs.readFileSync(filePath, 'utf-8');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = parser.parse(xml);

  const election = doc?.EML?.Result?.Election;
  if (!election) return null;

  const electionId = election.ElectionIdentifier;
  const domain = electionId?.['kr:ElectionDomain'];

  const naam: string =
    typeof domain === 'object' ? String(domain['#text'] ?? '') : String(domain ?? '');
  const cbsCode: string =
    typeof domain === 'object' ? String(domain['@_Id'] ?? '') : '';

  if (!naam) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selections: any[] = election?.Contest?.Selection ?? [];
  if (!Array.isArray(selections)) return null;

  const partijen = new Map<string, Partij>();
  let currentPartijId: string | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const sel of selections as any[]) {
    if (sel.AffiliationIdentifier) {
      currentPartijId = String(sel.AffiliationIdentifier['@_Id'] ?? '');
      const partijNaam = String(sel.AffiliationIdentifier.RegisteredName ?? '');
      if (!partijen.has(currentPartijId)) {
        partijen.set(currentPartijId, {
          id: currentPartijId,
          naam: partijNaam,
          zetels: 0,
          volleZetels: 0,
          restZetels: 0,
          isMakkelijkeZetel: false,
          kandidaten: [],
        });
      }
    } else if (
      sel.Candidate &&
      sel.Elected === 'yes' &&
      currentPartijId &&
      partijen.has(currentPartijId)
    ) {
      const partij = partijen.get(currentPartijId)!;
      const personName = sel.Candidate?.CandidateFullName?.['xnl:PersonName'];

      let voornaam = '';
      let achternaam = '';
      let voorvoegsels = '';
      let initialen = '';

      if (personName) {
        voornaam = String(personName['xnl:FirstName'] ?? '');
        achternaam = String(personName['xnl:LastName'] ?? '');
        voorvoegsels = String(personName['xnl:NamePrefix'] ?? '');
        const nameLine = personName['xnl:NameLine'];
        initialen =
          nameLine && typeof nameLine === 'object'
            ? String(nameLine['#text'] ?? '')
            : String(nameLine ?? '');
      }

      const naamParts = [voornaam, voorvoegsels, achternaam].filter(Boolean);
      const volleNaam =
        naamParts.length > 0
          ? naamParts.join(' ').trim()
          : `${initialen} ${achternaam}`.trim();

      const ranking = Number(sel.Ranking) || 1;
      partij.zetels++;
      if (ranking === 1) partij.volleZetels++;
      else partij.restZetels++;

      const localityName = sel.Candidate?.QualifyingAddress?.['xal:Locality']?.['xal:LocalityName'];
      const woonplaats = localityName ? String(localityName) : undefined;

      partij.kandidaten.push({
        naam: volleNaam || achternaam || initialen,
        voornaam,
        achternaam,
        initialen,
        geslacht: String(sel.Candidate.Gender ?? '') || undefined,
        ranking,
        woonplaats,
      });
    }
  }

  for (const p of partijen.values()) {
    p.kandidaten.sort((a, b) => a.ranking - b.ranking);
    p.isMakkelijkeZetel = p.volleZetels === 0 && p.restZetels === 1;
  }

  const partijenArray = [...partijen.values()]
    .filter((p) => p.zetels > 0)
    .sort((a, b) => b.zetels - a.zetels || a.naam.localeCompare(b.naam));

  const totaalZetels = partijenArray.reduce((s, p) => s + p.zetels, 0);
  const totaalVolleZetels = partijenArray.reduce((s, p) => s + p.volleZetels, 0);
  const totaalRestZetels = partijenArray.reduce((s, p) => s + p.restZetels, 0);
  const makkelijkeZetelPartijen = partijenArray
    .filter((p) => p.isMakkelijkeZetel)
    .map((p) => p.naam);

  return {
    naam,
    cbsCode,
    cbsCodeFormatted: `GM${cbsCode.padStart(4, '0')}`,
    partijen: partijenArray,
    totaalZetels,
    totaalVolleZetels,
    totaalRestZetels,
    aantalPartijen: partijenArray.length,
    grootstePartij: partijenArray[0]?.naam ?? '',
    grootstePartijZetels: partijenArray[0]?.zetels ?? 0,
    makkelijkeZetelPartijen,
  };
}
