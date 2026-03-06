'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Gemeente, Partij } from '@/lib/types';
import { berekenZetels } from '@/lib/zetelVerdeling';
import { getPartyColor } from '@/lib/partijKleuren';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from '@/components/ui/command';
import PartyLogo from './PartyLogo';

interface TkResult {
  naam: string;
  cbsCode: string;
  partijen: Record<string, number>;
}

function PrognoseContent({ gemeenten }: { gemeenten: Gemeente[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [selectedGemeente, setSelectedGemeente] = useState<Gemeente | null>(null);
  const [tk2023, setTk2023] = useState<TkResult[]>([]);
  const [tk2025, setTk2025] = useState<TkResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Initial load and URL sync
  useEffect(() => {
    Promise.all([
      fetch('/data/tk2023.json').then(res => res.json()),
      fetch('/data/tk2025.json').then(res => res.json())
    ]).then(([d23, d25]) => {
      setTk2023(d23);
      setTk2025(d25);
      
      const gParam = searchParams.get('g');
      if (gParam) {
        const found = gemeenten.find(g => g.naam.toLowerCase() === gParam.toLowerCase());
        if (found) {
          setSelectedGemeente(found);
          document.title = `${found.naam} - Prognose GR 2026`;
        }
      }
      
      setLoading(false);
    });
  }, [gemeenten, searchParams]);

  const handleSelect = (gemeenteNaam: string) => {
    const g = gemeenten.find((g) => g.naam === gemeenteNaam) || null;
    setSelectedGemeente(g);
    if (g) {
      document.title = `${g.naam} - Prognose GR 2026`;
    } else {
      document.title = 'Prognose Gemeenteraadsverkiezingen 2026 - Uitslagenavond';
    }
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (g) {
      params.set('g', g.naam);
    } else {
      params.delete('g');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const getSwingResult = () => {
    if (!selectedGemeente || !tk2023.length || !tk2025.length) return null;

    const g23 = tk2023.find(t => t.cbsCode === selectedGemeente.cbsCode);
    const g25 = tk2025.find(t => t.cbsCode === selectedGemeente.cbsCode);

    if (!g23 || !g25) return null;

    // Party matching helper
    const matches = (pName: string, tkPartij: string) => {
      const n = pName.toLowerCase();
      const t = tkPartij.toLowerCase();
      if (n === t) return true;
      if (t.includes('pvv') && (n.includes('partij voor de vrijheid') || n === 'pvv')) return true;
      if (t === 'vvd' && n === 'vvd') return true;
      if (t === 'd66' && n === 'd66') return true;
      if (t === 'cda' && n === 'cda') return true;
      if (t === 'sp' && (n.includes('socialistische partij') || n === 'sp')) return true;
      if (t === 'partij voor de dieren' && n === 'partij voor de dieren') return true;
      if (t === 'forum voor democratie' && n === 'forum voor democratie') return true;
      if (t === 'christenunie' && n === 'christenunie') return true;
      if (t === 'sgp' && (n.includes('staatkundig gereformeerde') || n === 'sgp')) return true;
      if (t.includes('staatkundig gereformeerde partij') && (n.includes('staatkundig gereformeerde') || n === 'sgp')) return true;
      if (t === 'denk' && n === 'denk') return true;
      if (t === '50plus' && n === '50plus') return true;
      if (t === 'volt' && n === 'volt') return true;
      if (t === 'ja21' && n === 'ja21') return true;
      if (t === 'bbb' && n === 'bbb') return true;
      if (t === 'nieuw sociaal contract' && (n === 'nsc' || n.includes('sociaal contract'))) return true;
      if (t === 'nsc' && (n === 'nsc' || n.includes('sociaal contract'))) return true;
      if (t === 'groenlinks / partij van de arbeid' && (n === 'groenlinks' || n.includes('partij van de arbeid') || n === 'pvda' || n.includes('gl-pvda'))) return true;
      return false;
    };

    const forecastedPartijen = selectedGemeente.partijen.map(p => {
      // Find matching national party in TK
      const tk23Votes = Object.entries(g23.partijen).find(([name]) => matches(p.naam, name))?.[1] || 0;
      const tk25Votes = Object.entries(g25.partijen).find(([name]) => matches(p.naam, name))?.[1] || 0;

      let swing = 1.0;
      if (tk23Votes > 0) {
        swing = tk25Votes / tk23Votes;
      }

      // Special case for GL-PvdA if separate in 2022
      if (p.naam === 'GROENLINKS' || p.naam.includes('Partij van de Arbeid')) {
         const jointTk23 = g23.partijen['GROENLINKS / Partij van de Arbeid'] || 0;
         const jointTk25 = g25.partijen['GROENLINKS / Partij van de Arbeid'] || 0;
         if (jointTk23 > 0) swing = jointTk25 / jointTk23;
      }

      return {
        id: p.id,
        naam: p.naam,
        stemmen: Math.round(p.stemmen * swing),
        originalStemmen: p.stemmen,
        tk23Votes,
        tk25Votes,
        swing
      };
    });

    const result = berekenZetels(forecastedPartijen, selectedGemeente.totaalZetels);
    return { ...result, forecastedPartijen };
  };

  const prognose = getSwingResult();

  if (loading) return <div className="p-10 text-center">Data laden...</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="flex items-center gap-3 px-4 h-14 bg-gradient-to-r from-slate-900 to-blue-900 text-white flex-shrink-0 shadow-lg z-10">
        <Link href="/" className="hover:bg-white/10 p-2 rounded-lg transition-colors text-sm font-semibold tracking-tight whitespace-nowrap flex items-center gap-2">
          &larr; <span className="hidden sm:inline">Terug naar Uitslagen</span>
        </Link>
        <div className="h-6 w-px bg-white/10 mx-1" />
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight leading-none uppercase text-blue-200">Prognose GR 2026</span>
          <span className="text-[10px] text-white/60 font-medium">Data: TK2025 vs TK2023 Swing</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <aside className={`
          absolute md:relative inset-y-0 left-0 z-[2000] md:z-auto
          w-80 max-w-[85vw] md:max-w-none
          flex-shrink-0 flex flex-col border-r bg-background overflow-hidden
          transition-transform duration-300
          md:!translate-x-0
          ${selectedGemeente ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        `}>
          <div className="p-4 border-b">
            <label className="text-sm font-medium leading-none mb-2 block">
              Gemeente zoeken
            </label>
            <Command className="rounded-md border shadow-sm">
              <CommandInput 
                placeholder="Typ gemeentenaam..." 
                value={query}
                onValueChange={setQuery}
                className="h-9"
              />
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandGroup>
                  {gemeenten
                    .filter(g => g.naam.toLowerCase().includes(query.toLowerCase()))
                    .map((g) => (
                      <CommandItem
                        key={g.cbsCode}
                        value={g.naam}
                        onSelect={() => handleSelect(g.naam)}
                        className="cursor-pointer"
                      >
                        {g.naam}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
             {selectedGemeente ? (
               <div className="text-xs space-y-4">
                 <div>
                   <h3 className="font-bold mb-2 uppercase text-[10px] text-muted-foreground mr-2">Methodiek</h3>
                   <p className="leading-relaxed">
                     Deze prognose kijkt naar de lokale uitslag in <strong>{selectedGemeente.naam}</strong> tijdens de Tweede Kamerverkiezingen van 2023 en 2025. 
                     De verhouding tussen deze twee (de swing) passen we toe op de raadsverkiezingen van 2022.
                   </p>
                 </div>
                 <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-900">
                    <strong>Uitleg:</strong> Als een partij in deze gemeente bij de TK25 20% meer stemmen kreeg dan bij de TK23, gaan we er in deze prognose van uit dat zij ook bij de raadsverkiezingen 20% groeien t.o.v. 2022.
                 </div>
               </div>
             ) : (
               <div className="text-sm text-center text-muted-foreground mt-10">
                 Kies een gemeente voor een gedetailleerde prognose.
               </div>
             )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-50/50">
          {selectedGemeente && (
            <button 
              onClick={() => setSelectedGemeente(null)}
              className="md:hidden flex items-center gap-1 text-xs font-bold text-blue-600 mb-4 bg-white px-3 py-2 rounded border shadow-sm"
            >
              &larr; Andere gemeente kiezen
            </button>
          )}
          {selectedGemeente && prognose ? (
            <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-4 md:p-6">
                 <h2 className="text-xl md:text-2xl font-bold leading-tight">{selectedGemeente.naam} - Prognose GR 2026</h2>
                 <p className="text-xs md:text-sm text-muted-foreground mt-1">
                   Data: TK2025 vs TK2023 Swing
                 </p>
              </div>

              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm min-w-[600px] md:min-w-0">
                     <thead className="bg-slate-50 border-b">
                       <tr>
                          <th className="py-3 px-2 md:px-4 font-bold text-slate-500 uppercase tracking-tighter text-[10px] w-8">#</th>
                          <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-tighter text-[10px]">Partij</th>
                          <th className="py-3 px-2 md:px-4 font-bold text-blue-600 uppercase tracking-tighter text-[10px] text-right bg-blue-50/30">GR 2022</th>
                          <th className="py-3 px-2 md:px-4 font-bold text-slate-500 uppercase tracking-tighter text-[10px] text-right hidden sm:table-cell">TK 2023</th>
                          <th className="py-3 px-2 md:px-4 font-bold text-slate-500 uppercase tracking-tighter text-[10px] text-right border-r hidden sm:table-cell">TK 2025</th>
                          <th className="py-3 px-2 md:px-4 font-bold text-blue-600 uppercase tracking-tighter text-[10px] text-right bg-blue-50/30">Prog. 2026</th>
                          <th className="py-3 px-2 md:px-4 font-bold text-slate-500 uppercase tracking-tighter text-[10px] text-right w-16 md:w-24">Zetels</th>
                          <th className="py-3 px-2 md:px-4 font-bold text-slate-500 uppercase tracking-tighter text-[10px] text-right w-12 md:w-16">+/-</th>
                       </tr>
                     </thead>
                     <tbody>
                       {prognose.partijen.map((p, i) => {
                         const original = selectedGemeente.partijen.find(op => op.id === p.id);
                         const originalZetels = original?.zetels || 0;
                         const diff = p.zetels - originalZetels;
                         const fp = (prognose as any).forecastedPartijen.find((fpAny: any) => fpAny.id === p.id);
                         const swing = fp?.swing ?? 1.0;

                         return (
                           <tr key={p.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                             <td className="py-3 px-2 md:px-4 text-muted-foreground font-mono text-[10px]">{i + 1}</td>
                             <td className="py-3 px-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                   <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6">
                                     <PartyLogo naam={p.naam} size={20} fallbackColor={getPartyColor(p.naam)} />
                                   </div>
                                   <div className="flex flex-col min-w-0">
                                      <span className="font-bold text-slate-900 leading-tight truncate">{p.naam}</span>
                                      <span className="text-[9px] md:text-[10px] text-muted-foreground">Huidig: {originalZetels}</span>
                                   </div>
                                 </div>
                             </td>
                             <td className="py-3 px-2 md:px-4 text-right tabular-nums bg-blue-50/10 text-xs md:text-sm">
                                <div className="font-medium text-slate-900">{original?.stemmen.toLocaleString('nl-NL')}</div>
                             </td>
                             <td className="py-3 px-2 md:px-4 text-right tabular-nums text-slate-500 text-xs hidden sm:table-cell">
                                {fp?.tk23Votes > 0 ? fp.tk23Votes.toLocaleString('nl-NL') : '-'}
                             </td>
                             <td className="py-3 px-2 md:px-4 text-right tabular-nums border-r text-xs hidden sm:table-cell">
                                <div className="font-medium text-slate-900">{fp?.tk25Votes > 0 ? fp.tk25Votes.toLocaleString('nl-NL') : '-'}</div>
                                {swing !== 1.0 && (
                                  <div className={`text-[8px] md:text-[9px] font-bold ${swing > 1 ? 'text-green-600' : 'text-red-500'}`}>
                                    {swing > 1 ? '▲' : '▼'} {Math.abs((swing - 1) * 100).toFixed(1)}%
                                  </div>
                                )}
                             </td>
                             <td className="py-3 px-2 md:px-4 text-right tabular-nums bg-blue-50/20 text-xs md:text-sm">
                                <div className="font-bold text-blue-700">{p.stemmen.toLocaleString('nl-NL')}</div>
                                <div className="sm:hidden block">
                                   {swing !== 1.0 && (
                                    <span className={`text-[8px] font-bold ${swing > 1 ? 'text-green-600' : 'text-red-500'}`}>
                                      {swing > 1 ? '+' : ''}{((swing - 1) * 100).toFixed(0)}%
                                    </span>
                                  )}
                                </div>
                             </td>
                             <td className="py-3 px-2 md:px-4 text-right">
                                <div className="text-sm md:text-base font-black text-slate-900 leading-none">{p.zetels}</div>
                                <div className="text-[8px] md:text-[9px] font-medium text-muted-foreground mt-1">({p.volleZetels}+{p.restZetels})</div>
                             </td>
                             <td className="py-3 px-2 md:px-4 text-right">
                                {diff > 0 ? (
                                  <div className="inline-flex items-center justify-center bg-green-500 text-white text-[9px] md:text-[10px] font-bold px-1 md:px-1.5 py-0.5 rounded min-w-[20px] md:min-w-[24px]">+{diff}</div>
                                ) : diff < 0 ? (
                                  <div className="inline-flex items-center justify-center bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-1 md:px-1.5 py-0.5 rounded min-w-[20px] md:min-w-[24px]">{diff}</div>
                                ) : (
                                  <span className="text-slate-300 font-bold text-xs">-</span>
                                )}
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white rounded-lg border shadow-sm p-4">
                    <h3 className="font-bold text-sm mb-3">Zetelverdeling (Prognose)</h3>
                    <div className="flex flex-wrap gap-1">
                       {prognose.partijen.flatMap(p => 
                         Array.from({ length: p.zetels }).map((_, i) => (
                           <div 
                             key={`${p.id}-${i}`} 
                             className="w-4 h-4 rounded-sm" 
                             style={{ backgroundColor: getPartyColor(p.naam) }}
                             title={p.naam}
                           />
                         ))
                       )}
                    </div>
                 </div>

                 {prognose.restzetelLog.length > 0 && (
                    <div className="bg-white rounded-lg border shadow-sm p-4">
                       <h3 className="font-bold text-sm mb-3">Restzetels</h3>
                       <div className="space-y-1.5 text-xs">
                         {prognose.restzetelLog.map(log => (
                           <div key={log.nummer} className="flex items-center gap-2">
                              <span className="w-4 text-muted-foreground font-mono">{log.nummer}.</span>
                              <span className="flex-1 font-medium">{log.partij}</span>
                              <span className="text-muted-foreground">{log.ronde === 'gemiddelden' ? 'gemiddelde' : 'overschot'}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                 )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
               Selecteer links een gemeente om de prognose te bekijken.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function PrognoseApp({ gemeenten }: { gemeenten: Gemeente[] }) {
  return (
    <Suspense fallback={<div className="p-10 text-center">Laden...</div>}>
      <PrognoseContent gemeenten={gemeenten} />
    </Suspense>
  );
}
