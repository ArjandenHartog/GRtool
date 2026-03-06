// Sprite: /parties.png — 128×128px per logo, 24 logos gestapeld verticaal
export const TOTAL_LOGOS = 24;

// Index in de sprite (0 = bovenste logo)
const INDEX: Record<string, number> = {
  // 0 – PVV
  'PVV': 0,
  'PVV (Partij voor de Vrijheid)': 0,
  'Partij voor de Vrijheid': 0,
  // 1 – GroenLinks-PvdA
  'GroenLinks-PvdA': 1,
  // 2 – VVD
  'VVD': 2,
  'Volkspartij voor Vrijheid en Democratie': 2,
  // 3 – NSC
  'NSC': 3,
  'Nieuw Sociaal Contract': 3,
  // 4 – D66
  'D66': 4,
  'POLITIEKE PARTIJ DEMOCRATEN 66': 4,
  // 5 – BBB
  'BBB': 5,
  'BoerBurgerBeweging': 5,
  // 6 – CDA
  'CDA': 6,
  'CHRISTEN DEMOCRATISCH APPÈL (CDA)': 6,
  // 7 – SP
  'SP (Socialistische Partij)': 7,
  'Socialistische Partij': 7,
  // 8 – DENK
  'DENK': 8,
  'Politieke beweging DENK': 8,
  // 9 – Partij voor de Dieren
  'Partij voor de Dieren': 9,
  // 10 – Forum voor Democratie
  'Forum voor Democratie': 10,
  'FVD': 10,
  // 11 – SGP
  'SGP': 11,
  'Staatkundig Gereformeerde Partij (SGP)': 11,
  // 12 – ChristenUnie
  'ChristenUnie': 12,
  // 13 – Volt
  'Volt': 13,
  'Volt Nederland': 13,
  // 14 – JA21
  'JA21': 14,
  'Conservatieve Liberalen': 14,
  // 15 – Vrede voor Dieren
  'Vrede voor Dieren': 15,
  // 16 – BVNL
  'BVNL': 16,
  'Belang van Nederland': 16,
  // 17 – BIJ1
  'BIJ1': 17,
  // 18 – LP
  'LP': 18,
  'Libertaire Partij': 18,
  // 19 – 50PLUS
  '50PLUS': 19,
  // 20 – Piratenpartij
  'Piratenpartij': 20,
  // 21 – FP
  'FP': 21,
  // 22 – Vrij Verbond
  'Vrij Verbond': 22,
  // 23 – De Linie
  'De Linie': 23,
};

export function getPartyLogoIndex(naam: string): number | null {
  if (INDEX[naam] !== undefined) return INDEX[naam];
  const l = naam.toLowerCase();
  if (l.includes('pvv') || l.includes('vrijheid')) return 0;
  if (l.includes('groenlinks') && l.includes('pvda')) return 1;
  if (l.startsWith('vvd') || l.includes('volkspartij voor vrijheid')) return 2;
  if (l === 'nsc' || l.includes('nieuw sociaal contract')) return 3;
  if (l.includes('d66') || l.includes('democraten 66')) return 4;
  if (l.startsWith('bbb') || l.includes('boerburger')) return 5;
  if (l === 'cda' || l.includes('christen democratisch')) return 6;
  if (l.includes('socialistische partij') || l.startsWith('sp ') || l === 'sp') return 7;
  if (l === 'denk' || l.includes('beweging denk')) return 8;
  if (l.includes('partij voor de dieren')) return 9;
  if (l.includes('forum voor democratie') || l === 'fvd') return 10;
  if (l.includes('sgp') || l.includes('staatkundig')) return 11;
  if (l.includes('christenunie')) return 12;
  if (l.startsWith('volt')) return 13;
  if (l.includes('ja21') || l.includes('conservatieve liberalen')) return 14;
  if (l.includes('vrede voor dieren')) return 15;
  if (l.includes('bvnl') || l.includes('belang van nederland')) return 16;
  if (l === 'bij1') return 17;
  if (l === 'lp' || l.includes('libertaire partij')) return 18;
  if (l.includes('50plus') || l === '50+') return 19;
  if (l.includes('piratenpartij')) return 20;
  if (l.includes('vrij verbond')) return 22;
  if (l.includes('de linie')) return 23;
  return null;
}
