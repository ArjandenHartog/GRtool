export const PARTY_COLORS: Record<string, string> = {
  'VVD': '#FF7B00',
  'D66': '#00AB8E',
  'GroenLinks': '#4CAF50',
  'GROENLINKS': '#4CAF50',
  'GroenLinks-PvdA': '#3a8a44',
  'PvdA': '#E91E63',
  'Partij van de Arbeid (P.v.d.A.)': '#E91E63',
  'SP (Socialistische Partij)': '#CC0000',
  'CDA': '#84BC3C',
  'PVV (Partij voor de Vrijheid)': '#1C2A4E',
  'PVV': '#1C2A4E',
  'ChristenUnie': '#00A3E0',
  'SGP': '#F36D21',
  'Partij voor de Dieren': '#006E32',
  'DENK': '#44D4A2',
  'Forum voor Democratie': '#7B2D8B',
  'FVD': '#7B2D8B',
  'Volt': '#4B2D8B',
  'JA21': '#1A355F',
  'BIJ1': '#FFCC00',
  'BBB': '#96C11F',
  '50PLUS': '#8B0000',
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
  ['sgp', '#F36D21'],
  ['dieren', '#006E32'],
  ['denk', '#44D4A2'],
  ['forum voor democratie', '#7B2D8B'],
  ['volt', '#4B2D8B'],
  ['ja21', '#1A355F'],
  ['bij1', '#FFCC00'],
  ['bbb', '#96C11F'],
  ['50plus', '#8B0000'],
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
