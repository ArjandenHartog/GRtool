import { Partij, RestZetel } from './types';

export function berekenZetels(
  partijen: { id: string; naam: string; stemmen: number }[],
  totaalZetelsOorspronkelijk: number
): {
  partijen: (Partij & { _zetelsCalculated?: number; _restGemiddelden?: boolean })[];
  kiesdeler: number;
  totaalStemmen: number;
  restzetelLog: RestZetel[];
} {
  const actief = partijen.map(p => ({
    ...p,
    zetels: 0,
    volleZetels: 0,
    restZetels: 0,
    isMakkelijkeZetel: false,
    kandidaten: [],
  })) as any[];

  const totaalStemmen = actief.reduce((sum, p) => sum + p.stemmen, 0);
  let kiesdeler = 0;
  const restzetelLog: RestZetel[] = [];

  if (totaalZetelsOorspronkelijk > 0 && totaalStemmen > 0) {
    kiesdeler = totaalStemmen / totaalZetelsOorspronkelijk;
    let restant = totaalZetelsOorspronkelijk;

    // Stap 1: Volle zetels
    for (const p of actief) {
      p.volleZetels = Math.floor(p.stemmen / kiesdeler);
      p.restZetels = 0;
      p._zetelsCalculated = p.volleZetels;
      p._restGemiddelden = false;
      restant -= p.volleZetels;
    }

    // Stap 2: Restzetels verdelen
    if (restant > 0) {
      if (totaalZetelsOorspronkelijk >= 19) {
        for (let i = 0; i < restant; i++) {
          let maxAvg = -1;
          let bestP: any = null;
          for (const p of actief) {
            const avg = p.stemmen / (p._zetelsCalculated + 1);
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
        const cands = actief
          .filter(p => p.stemmen >= 0.75 * kiesdeler)
          .map(p => ({ p, overschot: p.stemmen - (p.volleZetels * kiesdeler) }))
          .sort((a, b) => b.overschot - a.overschot);
        let toesgewezen = 0;

        for (const c of cands) {
          if (toesgewezen >= restant) break;
          c.p._zetelsCalculated++;
          c.p.restZetels++;
          toesgewezen++;
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
          for (const p of actief) {
            if (p._restGemiddelden) continue;
            const avg = p.stemmen / (p._zetelsCalculated + 1);
            if (avg > maxAvg) { maxAvg = avg; bestP = p; }
          }
          if (bestP) {
            bestP._zetelsCalculated++;
            bestP.restZetels++;
            bestP._restGemiddelden = true;
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

  for (const p of actief) {
    p.zetels = p.volleZetels + p.restZetels;
    p.isMakkelijkeZetel = p.volleZetels === 0 && p.restZetels === 1;
  }

  actief.sort((a, b) => b.zetels - a.zetels || b.stemmen - a.stemmen || a.naam.localeCompare(b.naam));

  return {
    partijen: actief,
    kiesdeler,
    totaalStemmen,
    restzetelLog,
  };
}
