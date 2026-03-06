'use client';

import { Gemeente, Partij } from '@/lib/types';
import { getPartyColor } from '@/lib/partijKleuren';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
  gemeente: Gemeente;
  onClear: () => void;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-center">
      <div className="text-lg font-bold leading-tight tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/60">{sub}</div>}
    </div>
  );
}

export default function GemeentePanel({ gemeente, onClear }: Props) {
  const aantalVrouwen = gemeente.partijen
    .flatMap((p) => p.kandidaten)
    .filter((k) => k.geslacht === 'female').length;
  const aantalMannen = gemeente.partijen
    .flatMap((p) => p.kandidaten)
    .filter((k) => k.geslacht === 'male').length;

  return (
    <div className="p-4 space-y-5">

      {/* ── Gemeente header ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold leading-tight">{gemeente.naam}</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            CBS {gemeente.cbsCodeFormatted} &bull; 16 maart 2022
          </p>
        </div>
        <button
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5 p-0.5 rounded hover:bg-muted"
          title="Sluiten"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="raadszetels" value={gemeente.totaalZetels} />
        <StatCard label="partijen" value={gemeente.aantalPartijen} />
        <StatCard label="volle zetels" value={gemeente.totaalVolleZetels} sub={`${gemeente.totaalRestZetels} restzetels`} />
      </div>

      {/* Geslachtsverhouding */}
      <div className="rounded-lg border bg-muted/30 px-3 py-2">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Geslacht raadsleden</span>
          <span className="text-[10px] text-muted-foreground">
            {aantalVrouwen} vrouw / {aantalMannen} man
          </span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-400"
            style={{ width: `${(aantalVrouwen / gemeente.totaalZetels) * 100}%` }}
          />
          <div
            className="h-full bg-blue-400"
            style={{ width: `${(aantalMannen / gemeente.totaalZetels) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>{Math.round((aantalVrouwen / gemeente.totaalZetels) * 100)}% vrouw</span>
          <span>{Math.round((aantalMannen / gemeente.totaalZetels) * 100)}% man</span>
        </div>
      </div>

      <Separator />

      {/* ── Zetelverdeling ──────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Zetelverdeling
        </p>

        {gemeente.partijen.map((p: Partij) => {
          const color = getPartyColor(p.naam);
          const vollePct = (p.volleZetels / gemeente.totaalZetels) * 100;
          const restPct = (p.restZetels / gemeente.totaalZetels) * 100;

          return (
            <div key={p.id} className="space-y-1">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs font-medium truncate" title={p.naam}>{p.naam}</span>
                  {p.isMakkelijkeZetel && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-orange-300 text-orange-500 bg-orange-50 flex-shrink-0">
                      makkelijk
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 text-[11px] tabular-nums">
                  {p.volleZetels > 0 && (
                    <span className="text-foreground font-semibold">{p.volleZetels}v</span>
                  )}
                  {p.restZetels > 0 && (
                    <span className="text-orange-500">{p.restZetels}r</span>
                  )}
                  <span className="text-muted-foreground ml-0.5">= {p.zetels}</span>
                </div>
              </div>
              {/* Gestapelde balk: volle (vol) + rest (gestreept) */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                {p.volleZetels > 0 && (
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${vollePct}%`, backgroundColor: color }}
                  />
                )}
                {p.restZetels > 0 && (
                  <div
                    className="h-full transition-all duration-300 opacity-50"
                    style={{ width: `${restPct}%`, backgroundColor: color }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Legenda balk */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-sm bg-slate-400 inline-block" />
            vol = volle zetel
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-sm bg-slate-400/50 inline-block" />
            r = restzetel
          </span>
        </div>
      </div>

      {/* ── Makkelijke zetels ───────────────────────────────── */}
      {gemeente.makkelijkeZetelPartijen.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Makkelijke zetels
              <span className="ml-1 normal-case font-normal">(enkel 1 restzetel)</span>
            </p>
            <div className="space-y-1">
              {gemeente.makkelijkeZetelPartijen.map((naam) => {
                const partij = gemeente.partijen.find((p) => p.naam === naam)!;
                const color = getPartyColor(naam);
                const kandidaat = partij.kandidaten[0];
                return (
                  <div key={naam} className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1.5">
                    <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs font-medium flex-1 truncate">{naam}</span>
                    {kandidaat && (
                      <span className="text-[11px] text-muted-foreground truncate max-w-[100px]">
                        {kandidaat.naam}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* ── Gekozen raadsleden ──────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Gekozen raadsleden
        </p>
        <div className="space-y-1.5">
          {gemeente.partijen.map((p: Partij) => {
            const color = getPartyColor(p.naam);
            return (
              <details key={p.id} className="group">
                <summary className="flex items-center gap-2 cursor-pointer list-none select-none rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors -mx-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs font-medium flex-1 truncate" title={p.naam}>{p.naam}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {p.volleZetels > 0 && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 font-normal">
                        {p.volleZetels}v
                      </Badge>
                    )}
                    {p.restZetels > 0 && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-normal border-orange-300 text-orange-500">
                        {p.restZetels}r
                      </Badge>
                    )}
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 -rotate-90 group-open:rotate-0 transition-transform duration-150"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <ul className="mt-1 space-y-0.5 ml-4.5">
                  {p.kandidaten.map((k, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px] py-0.5">
                      <span className="w-4 text-center text-[10px] text-muted-foreground flex-shrink-0">
                        {i + 1}.
                      </span>
                      <span className={k.ranking === 2 ? 'text-orange-600 font-medium' : 'text-foreground'}>
                        {k.naam}
                      </span>
                      {k.geslacht === 'female' && <span className="text-pink-400 text-[10px]">v</span>}
                      {k.geslacht === 'male' && <span className="text-blue-400 text-[10px]">m</span>}
                      {k.ranking === 2 && (
                        <span className="ml-auto text-[9px] text-orange-400 font-medium flex-shrink-0">rest</span>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
