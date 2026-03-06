export const PARTY_COLORS: Record<string, string> = {
  // VVD
  'VVD': '#FF7B00',
  'Volkspartij voor Vrijheid en Democratie': '#FF7B00',
  // D66
  'D66': '#00AB8E',
  'POLITIEKE PARTIJ DEMOCRATEN 66': '#00AB8E',
  // GroenLinks
  'GroenLinks': '#4CAF50',
  'GROENLINKS': '#4CAF50',
  'GroenLinks-PvdA': '#3a8a44',
  // PvdA
  'PvdA': '#E91E63',
  'Partij van de Arbeid': '#E91E63',
  'Partij van de Arbeid (P.v.d.A.)': '#E91E63',
  // SP
  'SP (Socialistische Partij)': '#CC0000',
  'Socialistische Partij': '#CC0000',
  // CDA
  'CDA': '#84BC3C',
  'CHRISTEN DEMOCRATISCH APPÈL (CDA)': '#84BC3C',
  // PVV
  'PVV (Partij voor de Vrijheid)': '#1C2A4E',
  'PVV': '#1C2A4E',
  'Partij voor de Vrijheid': '#1C2A4E',
  // ChristenUnie
  'ChristenUnie': '#00A3E0',
  // SGP
  'SGP': '#E95E10',
  'Staatkundig Gereformeerde Partij (SGP)': '#E95E10',
  // Partij voor de Dieren
  'Partij voor de Dieren': '#006E32',
  // DENK
  'DENK': '#44D4A2',
  'Politieke beweging DENK': '#44D4A2',
  // Forum voor Democratie
  'Forum voor Democratie': '#7B2D8B',
  'FVD': '#7B2D8B',
  // Volt
  'Volt': '#4B2D8B',
  'Volt Nederland': '#4B2D8B',
  // JA21
  'JA21': '#1A355F',
  'Conservatieve Liberalen': '#1A355F',
  // BIJ1
  'BIJ1': '#FFCC00',
  // BBB
  'BBB': '#96C11F',
  'BoerBurgerBeweging': '#96C11F',
  // 50PLUS
  '50PLUS': '#8B0000',
  // BVNL
  'BVNL': '#D4420E',
  'Belang van Nederland': '#D4420E',
  // NSC
  'NSC': '#003082',
  'Nieuw Sociaal Contract': '#003082',
};

const FUZZY_MAP: [string, string][] = [
  ['groenlinks', '#4CAF50'],
  ['pvda', '#E91E63'],
  ['partij van de arbeid', '#E91E63'],
  ['vvd', '#FF7B00'],
  ['d66', '#00AB8E'],
  ['cda', '#84BC3C'],
  ['pvv', '#1C2A4E'],
  ['socialistische partij', '#CC0000'],
  ['christenunie', '#00A3E0'],
  ['sgp', '#E95E10'],
  ['staatkundig', '#E95E10'],
  ['dieren', '#006E32'],
  ['denk', '#44D4A2'],
  ['forum voor democratie', '#7B2D8B'],
  ['volt', '#4B2D8B'],
  ['ja21', '#1A355F'],
  ['bij1', '#FFCC00'],
  ['bbb', '#96C11F'],
  ['boerburger', '#96C11F'],
  ['50plus', '#8B0000'],
  ['bvnl', '#D4420E'],
  ['belang van nederland', '#D4420E'],
  ['nsc', '#003082'],
  ['nieuw sociaal contract', '#003082'],
];

export function getPartyColor(partijNaam: string): string {
  if (PARTY_COLORS[partijNaam]) return PARTY_COLORS[partijNaam];
  const lower = partijNaam.toLowerCase();
  for (const [key, color] of FUZZY_MAP) {
    if (lower.includes(key)) return color;
  }
  // Deterministische fallback kleur voor lokale partijen
  let hash = 0;
  for (let i = 0; i < partijNaam.length; i++) {
    hash = partijNaam.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 45%)`;
}
