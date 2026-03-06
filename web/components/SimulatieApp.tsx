'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gemeente, Partij } from '@/lib/types';
import { berekenZetels } from '@/lib/zetelVerdeling';
import { getPartyColor } from '@/lib/partijKleuren';
import PartyLogo from './PartyLogo';

export default function SimulatieApp({ gemeenten }: { gemeenten: Gemeente[] }) {
  const [selectedGemeente, setSelectedGemeente] = useState<Gemeente | null>(null);
  const [stemmenInput, setStemmenInput] = useState<Record<string, number>>({});

  const handleSelect = (gemeenteNaam: string) => {
    const g = gemeenten.find((g) => g.naam === gemeenteNaam);
    if (!g) return;
    
    setSelectedGemeente(g);
    
    // Initialize with 2022 votes as fallback
    const initialStemmen: Record<string, number> = {};
    g.partijen.forEach((p) => {
      initialStemmen[p.id] = p.stemmen;
    });
    setStemmenInput(initialStemmen);
  };

  const handleChange = (id: string, value: string) => {
    const num = parseInt(value, 10);
    setStemmenInput(prev => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
  };

  // Run calculation
  let simulatieResult = null;
  if (selectedGemeente) {
    const inputPartijen = selectedGemeente.partijen.map((p) => ({
      id: p.id,
      naam: p.naam,
      stemmen: stemmenInput[p.id] || 0,
    }));
    
    // Only calculate if there are actually votes
    const totaalStemmen = inputPartijen.reduce((sum, p) => sum + p.stemmen, 0);
    if (totaalStemmen > 0) {
      simulatieResult = berekenZetels(inputPartijen, selectedGemeente.totaalZetels);
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="flex items-center gap-3 px-4 h-12 bg-[#1e3a5f] text-white flex-shrink-0">
        <Link href="/" className="hover:underline text-sm font-semibold tracking-tight whitespace-nowrap">
          &larr; Terug naar Uitslagen
        </Link>
        <div className="h-4 w-px bg-white/20 mx-2" />
        <span className="text-sm font-medium">Uitslagenavond 2026 Simulatie</span>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`
          absolute md:relative inset-y-0 left-0 z-[2000] md:z-auto
          w-80 max-w-[85vw] md:max-w-none
          flex-shrink-0 flex flex-col border-r bg-background overflow-hidden
          transition-transform duration-300
          md:!translate-x-0
          ${selectedGemeente ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        `}>
          <div className="p-4 border-b">
            <label htmlFor="search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Kies Gemeente
            </label>
            <select
              id="search"
              className="w-full mt-1.5 p-2 rounded-md border bg-background text-sm"
              value={selectedGemeente?.naam ?? ''}
              onChange={(e) => handleSelect(e.target.value)}
            >
              <option value="">-- Selecteer --</option>
              {gemeenten.map((g) => (
                <option key={g.cbsCode} value={g.naam}>{g.naam}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedGemeente ? (
              <>
                <div>
                  <h3 className="text-sm font-bold mb-1">Vul stemmen in voor 2026</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Standaard ingevuld met 2022 resultaten. Pas ze aan om de zetelverdeling direct te zien veranderen.
                  </p>
                </div>
                
                <div className="space-y-3">
                  {selectedGemeente.partijen.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <PartyLogo naam={p.naam} size={24} fallbackColor={getPartyColor(p.naam)} />
                      <div className="flex-1 min-w-0">
                         <div className="text-xs font-medium truncate" title={p.naam}>{p.naam}</div>
                         <div className="text-[10px] text-muted-foreground">({p.stemmen} in '22)</div>
                      </div>
                      <input 
                         type="number" 
                         className="flex h-8 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-right font-mono"
                         value={stemmenInput[p.id]?.toString() || ''}
                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(p.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-center text-muted-foreground mt-10">
                Selecteer een gemeente om te beginnen.
              </div>
            )}
          </div>
        </aside>

        {/* Hoofdscherm (Resultaat) */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-50/50">
          {selectedGemeente && (
            <button 
              onClick={() => setSelectedGemeente(null)}
              className="md:hidden flex items-center gap-1 text-xs font-bold text-orange-600 mb-4 bg-white px-3 py-2 rounded border shadow-sm"
            >
              &larr; Andere gemeente kiezen / Stemmen aanpassen
            </button>
          )}
          {selectedGemeente && simulatieResult ? (
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="bg-white rounded-lg border shadow-sm p-6">
                 <h2 className="text-2xl font-bold">{selectedGemeente.naam} - Uitslag 2026 Simulator</h2>
                 <p className="text-sm text-muted-foreground mt-1">
                   {simulatieResult.totaalStemmen.toLocaleString('nl-NL')} ingevulde stemmen &bull; {selectedGemeente.totaalZetels} zetels te verdelen &bull; Kiesdeler: {Math.floor(simulatieResult.kiesdeler).toLocaleString('nl-NL')}
                 </p>
              </div>

              <div className="bg-white rounded-lg border shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-[10px] md:text-xs">
                      <th className="py-2.5 px-2 md:px-4 font-semibold text-muted-foreground w-8 md:w-10">#</th>
                      <th className="py-2.5 px-2 md:px-4 font-semibold text-muted-foreground">Partij</th>
                      <th className="py-2.5 px-2 md:px-4 font-semibold text-muted-foreground text-right">Stemmen</th>
                      <th className="py-2.5 px-2 md:px-4 font-semibold text-muted-foreground text-right w-16 md:w-24">Zetels</th>
                      <th className="py-2.5 px-2 md:px-4 font-semibold text-muted-foreground text-right w-12 md:w-20">+/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulatieResult.partijen.filter(p => p.zetels > 0 || p.stemmen > 0).map((p, i) => {
                      const oldZetels = selectedGemeente.partijen.find(op => op.id === p.id)?.zetels || 0;
                      const mutatie = p.zetels - oldZetels;
                      
                      return (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="py-2.5 px-2 md:px-4 text-muted-foreground text-xs">{i + 1}</td>
                          <td className="py-2.5 px-2 md:px-4">
                             <div className="flex items-center gap-2">
                               <PartyLogo naam={p.naam} size={16} fallbackColor={getPartyColor(p.naam)} />
                               <span className="font-medium text-xs md:text-sm truncate">{p.naam}</span>
                             </div>
                          </td>
                          <td className="py-2.5 px-2 md:px-4 text-right font-mono tabular-nums text-xs md:text-sm">{p.stemmen.toLocaleString('nl-NL')}</td>
                          <td className="py-2.5 px-2 md:px-4 text-right font-semibold text-xs md:text-sm">
                            {p.zetels} <span className="text-[9px] md:text-[10px] text-muted-foreground font-normal ml-0.5 md:ml-1">({p.volleZetels}+{p.restZetels})</span>
                          </td>
                          <td className="py-2.5 px-2 md:px-4 text-right tabular-nums text-[10px] md:text-xs">
                             {mutatie > 0 ? (
                               <span className="text-green-600 font-bold">+{mutatie}</span>
                             ) : mutatie < 0 ? (
                               <span className="text-red-500 font-bold">{mutatie}</span>
                             ) : (
                               <span className="text-slate-300">-</span>
                             )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {simulatieResult.restzetelLog.length > 0 && (
                <div className="bg-white rounded-lg border shadow-sm p-6">
                  <h3 className="font-bold mb-3 text-sm">Hoe zijn de restzetels verdeeld?</h3>
                  <div className="space-y-2">
                    {simulatieResult.restzetelLog.map((log) => (
                      <div key={log.nummer} className="flex gap-4 text-sm bg-muted/20 p-2 rounded">
                         <span className="font-bold text-muted-foreground w-6 text-right">{log.nummer}.</span>
                         <span className="font-medium w-48">{log.partij}</span>
                         <span className="text-muted-foreground flex-1">
                           kreeg zetel via {log.ronde === 'overschot' ? 'grootste overschot' : 'grootste gemiddelde'} ({log.maat.toFixed(1)})
                         </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    {selectedGemeente.totaalZetels >= 19 
                      ? 'Omdat de raad 19 of meer zetels telt, wordt puur gekeken naar "grootste gemiddelden".' 
                      : 'Omdat de raad minder dan 19 zetels telt, wordt eerst gekeken naar overschotten van partijen die minimaal 75% van de kiesdeler haalden, tenzij deze op zijn.'}
                  </p>
                </div>
              )}

            </div>
          ) : (
             <div className="flex h-full items-center justify-center text-muted-foreground">
                Kies links een gemeente en voeg stemmen toe om de berekening te starten.
             </div>
          )}
        </main>
      </div>
    </div>
  );
}
