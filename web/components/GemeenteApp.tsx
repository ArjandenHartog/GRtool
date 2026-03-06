'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Gemeente, Jaar, BESCHIKBARE_JAREN } from '@/lib/types';
import { getPartyColor } from '@/lib/partijKleuren';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import GemeentePanel from './GemeentePanel';

const NlKaart = dynamic(() => import('./NlKaart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-50">
      <span className="text-sm text-muted-foreground">Kaart laden…</span>
    </div>
  ),
});

const LEGEND = [
  { naam: 'VVD', kleur: '#FF7B00' },
  { naam: 'D66', kleur: '#00AB8E' },
  { naam: 'GroenLinks', kleur: '#4CAF50' },
  { naam: 'PvdA', kleur: '#E91E63' },
  { naam: 'CDA', kleur: '#84BC3C' },
  { naam: 'SP', kleur: '#CC0000' },
  { naam: 'CU', kleur: '#00A3E0' },
  { naam: 'SGP', kleur: '#F36D21' },
  { naam: 'PVV', kleur: '#1C2A4E' },
  { naam: 'FVD', kleur: '#7B2D8B' },
];

const JAAR_DATUM: Record<string, string> = {
  '2022': '16 mrt 2022',
  '2018': '21 mrt 2018',
  '2014': '19 mrt 2014',
};

interface Props {
  gemeenten: Gemeente[];
  jaar: Jaar;
}

export default function GemeenteApp({ gemeenten, jaar }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Gemeente | null>(null);
  const [query, setQuery] = useState('');

  const filtered = query.trim().length > 0
    ? gemeenten.filter((g) => g.naam.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 12)
    : [];

  const isSearching = query.trim().length > 0;

  function handleSelect(naam: string) {
    const g = gemeenten.find((g) => g.naam === naam) ?? null;
    setSelected(g);
    setQuery('');
  }

  function handleClear() {
    setSelected(null);
  }

  function handleJaarChange(nieuwJaar: string) {
    setSelected(null);
    setQuery('');
    router.push(`/?jaar=${nieuwJaar}`);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">

      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-12 bg-[#1e3a5f] text-white flex-shrink-0">
        <span className="text-sm font-semibold tracking-tight whitespace-nowrap hidden sm:block flex-shrink-0">
          Gemeenteraadsverkiezingen
        </span>

        <div className="flex items-center gap-1 flex-shrink-0">
          {BESCHIKBARE_JAREN.map((j) => (
            <button
              key={j}
              onClick={() => handleJaarChange(j)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                j === jaar
                  ? 'bg-white text-[#1e3a5f]'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {j}
            </button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-4 bg-white/20 flex-shrink-0" />

        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal bg-white/10 text-blue-100 border-0 flex-shrink-0">
          {gemeenten.length}
        </Badge>
        <span className="text-[11px] text-blue-300 flex-shrink-0">{JAAR_DATUM[jaar]}</span>

        <div className="flex items-center gap-3 overflow-x-auto flex-1 min-w-0 ml-1">
          {LEGEND.map((item) => (
            <span key={item.naam} className="flex items-center gap-1 text-[11px] text-blue-100 whitespace-nowrap">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: item.kleur }} />
              {item.naam}
            </span>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 flex flex-col border-r bg-background overflow-hidden">

          {/* Zoekbalk */}
          <Command shouldFilter={false} className="rounded-none border-0 shadow-none flex-shrink-0 h-auto">
            <CommandInput
              placeholder="Zoek gemeente…"
              value={query}
              onValueChange={setQuery}
              className="h-11"
            />
            {isSearching && (
              <CommandList className="border-t max-h-72 overflow-y-auto">
                <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                  Geen gemeenten gevonden voor &ldquo;{query}&rdquo;
                </CommandEmpty>
                {filtered.length > 0 && (
                  <CommandGroup heading={`${filtered.length} resultaten`}>
                    {filtered.map((g) => {
                      const color = getPartyColor(g.grootstePartij);
                      return (
                        <CommandItem
                          key={g.cbsCodeFormatted}
                          value={g.naam}
                          onSelect={() => handleSelect(g.naam)}
                          className="flex items-center justify-between gap-2 cursor-pointer py-2.5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-sm font-medium truncate">{g.naam}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-muted-foreground max-w-[80px] truncate">{g.grootstePartij}</span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{g.totaalZetels}z</Badge>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            )}
          </Command>

          <Separator />

          {/* Detail of lege staat */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {selected ? (
              <div className="flex-1 overflow-y-auto h-full">
                <GemeentePanel gemeente={selected} jaar={jaar} onClear={handleClear} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
                <svg className="w-14 h-14 text-muted-foreground/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Selecteer een gemeente</p>
                  <p className="text-xs text-muted-foreground/60">Typ hierboven of klik op de kaart</p>
                </div>
              </div>
            )}
          </div>

          <Separator />
          <div className="px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground flex-shrink-0">
            <span><span className="text-orange-400">oranje</span> = restzetel &bull; roze/blauw = vrouw/man</span>
            {selected && (
              <button onClick={handleClear} className="hover:text-foreground transition-colors hover:underline underline-offset-2">
                wis selectie
              </button>
            )}
          </div>
        </aside>

        {/* Kaart */}
        <main className="flex-1 min-w-0 min-h-0">
          <NlKaart
            key={jaar}
            gemeenten={gemeenten}
            selected={selected?.naam ?? null}
            onSelect={handleSelect}
          />
        </main>
      </div>
    </div>
  );
}
