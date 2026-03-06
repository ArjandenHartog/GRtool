export const BESCHIKBARE_JAREN = ['2022', '2018', '2014'] as const;
export type Jaar = (typeof BESCHIKBARE_JAREN)[number];

export interface Kandidaat {
  naam: string;
  voornaam: string;
  achternaam: string;
  initialen: string;
  geslacht?: string;
  ranking: number;
  woonplaats?: string;
}

export interface Partij {
  id: string;
  naam: string;
  stemmen: number;
  zetels: number;
  volleZetels: number;
  restZetels: number;
  isMakkelijkeZetel: boolean;
  kandidaten: Kandidaat[];
}

export interface Gemeente {
  naam: string;
  cbsCode: string;
  cbsCodeFormatted: string;
  partijen: Partij[];
  kiesdeler: number;
  totaalStemmen: number;
  totaalZetels: number;
  totaalVolleZetels: number;
  totaalRestZetels: number;
  aantalPartijen: number;
  grootstePartij: string;
  grootstePartijZetels: number;
  makkelijkeZetelPartijen: string[];
}
