import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import { Gemeente, Partij, RestZetel } from './types';

export type { Gemeente, Partij, RestZetel } from './types';
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
          stemmen: 0,
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

  let totaalStemmen = 0;
  let kiesdeler = 0;
  const restzetelLog: RestZetel[] = [];

  try {
    const fsHidden = eval('require("fs")');
    const parsedPath = path.parse(filePath);
    const parts = parsedPath.base.split('_');
    parts[0] = 'Telling';
    const tellingPath = parsedPath.dir + path.sep + parts.join('_');
    if (fsHidden.existsSync(tellingPath)) {
      const tellingXml = fsHidden.readFileSync(tellingPath, 'utf-8');
      const tellingDoc: any = parser.parse(tellingXml);
      const totalVotesObj = tellingDoc?.EML?.Count?.Election?.Contests?.Contest?.TotalVotes;
      if (totalVotesObj) {
        totaalStemmen = Number(totalVotesObj.TotalCounted) || 0;
        const selections = Array.isArray(totalVotesObj.Selection) 
          ? totalVotesObj.Selection 
          : totalVotesObj.Selection ? [totalVotesObj.Selection] : [];
        for (const sel of selections) {
          if (sel.AffiliationIdentifier) {
            const pid = String(sel.AffiliationIdentifier['@_Id'] ?? '');
            if (partijen.has(pid)) {
              partijen.get(pid)!.stemmen = Number(sel.ValidVotes) || 0;
            } else {
              // Ook partijen die niet verkozen zijn maar wel stemmen kregen meenemen
              partijen.set(pid, {
                id: pid,
                naam: String(sel.AffiliationIdentifier.RegisteredName ?? ''),
                stemmen: Number(sel.ValidVotes) || 0,
                zetels: 0,
                volleZetels: 0,
                restZetels: 0,
                isMakkelijkeZetel: false,
                kandidaten: [],
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(`Fout bij parsen Telling voor ${naam}:`, e);
  }

  const actuelePartijen = [...partijen.values()].filter(p => p.stemmen > 0 || p.zetels > 0);
  const totaalZetelsOorspronkelijk = actuelePartijen.reduce((s, p) => s + p.zetels, 0);

  if (totaalZetelsOorspronkelijk > 0 && totaalStemmen > 0) {
    kiesdeler = totaalStemmen / totaalZetelsOorspronkelijk;
    let restant = totaalZetelsOorspronkelijk;
    
    // Stap 1: Volle zetels
    for (const p of actuelePartijen) {
      p.volleZetels = Math.floor(p.stemmen / kiesdeler);
      p.restZetels = 0;
      (p as any)._zetelsCalculated = p.volleZetels;
      (p as any)._restGemiddelden = false;
      restant -= p.volleZetels;
    }

    // Stap 2: Restzetels verdelen
    if (restant > 0) {
      if (totaalZetelsOorspronkelijk >= 19) {
        for (let i = 0; i < restant; i++) {
          let maxAvg = -1;
          let bestP: any = null;
          for (const p of actuelePartijen) {
            const avg = p.stemmen / ((p as any)._zetelsCalculated + 1);
            if (avg > maxAvg) { maxAvg = avg; bestP = p; }
          }
          if (bestP) {
            bestP._zetelsCalculated++;
            bestP.restZetels++;
            restzetelLog.push({
              nummer: restzetelLog.length + 1,
              ronde: 'gemiddelden',
              partij: bestP.naam,
              maat: maxAvg,
            });
          }
        }
      } else {
        const cands = actuelePartijen
          .filter(p => p.stemmen >= 0.75 * kiesdeler)
          .map(p => ({ p, overschot: p.stemmen - (p.volleZetels * kiesdeler) }))
          .sort((a, b) => b.overschot - a.overschot);
        let toesgewezen = 0;
        const metRest = new Set<string>();
        
        for (const c of cands) {
          if (toesgewezen >= restant) break;
          (c.p as any)._zetelsCalculated++;
          c.p.restZetels++;
          toesgewezen++;
          metRest.add(c.p.id);
          restzetelLog.push({
            nummer: restzetelLog.length + 1,
            ronde: 'overschot',
            partij: c.p.naam,
            maat: c.overschot,
          });
        }
        
        const nogTeVerdelen = restant - toesgewezen;
        for (let i = 0; i < nogTeVerdelen; i++) {
          let maxAvg = -1;
          let bestP: any = null;
          for (const p of actuelePartijen) {
            if ((p as any)._restGemiddelden) continue;
            const avg = p.stemmen / ((p as any)._zetelsCalculated + 1);
            if (avg > maxAvg) { maxAvg = avg; bestP = p; }
          }
          if (bestP) {
            bestP._zetelsCalculated++;
            bestP.restZetels++;
            bestP._restGemiddelden = true;
            metRest.add(bestP.id);
            restzetelLog.push({
              nummer: restzetelLog.length + 1,
              ronde: 'gemiddelden',
              partij: bestP.naam,
              maat: maxAvg,
            });
          }
        }
      }
    }
  }

  for (const p of partijen.values()) {
    p.kandidaten.sort((a, b) => a.ranking - b.ranking);
    p.isMakkelijkeZetel = p.volleZetels === 0 && p.restZetels === 1;
    delete (p as any)._zetelsCalculated;
    delete (p as any)._restGemiddelden;
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
    kiesdeler,
    totaalStemmen,
    totaalZetels,
    totaalVolleZetels,
    totaalRestZetels,
    aantalPartijen: partijenArray.length,
    grootstePartij: partijenArray[0]?.naam ?? '',
    grootstePartijZetels: partijenArray[0]?.zetels ?? 0,
    makkelijkeZetelPartijen,
    restzetelLog,
  };
}
