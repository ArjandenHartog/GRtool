'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Party color map ───────────────────────────────────────────────────────────
const PARTY_COLORS: Record<string, string> = {
  SGP: '#F97316',
  PvdA: '#EF4444',
  CDA: '#10B981',
  VVD: '#3B82F6',
  CU: '#06B6D4',
  Gemeentebelangen: '#8B5CF6',
  'Vóór Neder-Betuwe': '#F59E0B',
  PVV: '#1E3A5F',
  D66: '#14B8A6',
  'GL-PvdA': '#22C55E',
  JA21: '#475569',
  FvD: '#7C3AED',
  BBB: '#84CC16',
  '50PLUS': '#EC4899',
  SP: '#DC2626',
  NSC: '#0EA5E9',
  Volt: '#6D28D9',
  DENK: '#059669',
  'CDA-ChristenUnie': '#10B981',
  GroenLinks: '#16A34A',
  Default: '#94A3B8',
};

function getColor(party: string): string {
  return PARTY_COLORS[party] ?? PARTY_COLORS.Default;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const OPKOMST_DATA = {
  Gemeenteraad: [
    { jaar: 1970, pct: 81.6 }, { jaar: 1974, pct: 78.9 }, { jaar: 1978, pct: 83.5 },
    { jaar: 1982, pct: 79.3 }, { jaar: 1986, pct: 73.7 }, { jaar: 1990, pct: 74.3 },
    { jaar: 1994, pct: 75.9 }, { jaar: 1998, pct: 76.6 }, { jaar: 2006, pct: 72.6 },
    { jaar: 2010, pct: 66.5 }, { jaar: 2014, pct: 68.7 }, { jaar: 2018, pct: 66.8 },
    { jaar: 2022, pct: 62.7 }, { jaar: 2026, pct: null },
  ],
  'Tweede Kamer': [
    { jaar: 1971, pct: 84.8 }, { jaar: 1972, pct: 87.8 }, { jaar: 1977, pct: 92.3 },
    { jaar: 1981, pct: 91.6 }, { jaar: 1982, pct: 88.1 }, { jaar: 1986, pct: 91.1 },
    { jaar: 1989, pct: 86.4 }, { jaar: 1994, pct: 84.4 }, { jaar: 1998, pct: 81.4 },
    { jaar: 2002, pct: 85.7 }, { jaar: 2003, pct: 87.6 }, { jaar: 2006, pct: 86.2 },
    { jaar: 2010, pct: 80.5 }, { jaar: 2012, pct: 80.2 }, { jaar: 2017, pct: 85.7 },
    { jaar: 2021, pct: 83.1 }, { jaar: 2023, pct: 85.5 }, { jaar: 2025, pct: 85.9 },
  ],
  'Provinciale Staten': [
    { jaar: 1970, pct: 77.9 }, { jaar: 1974, pct: 81.8 }, { jaar: 1978, pct: 87.2 },
    { jaar: 1982, pct: 75.8 }, { jaar: 1987, pct: 73.5 }, { jaar: 1991, pct: 62.2 },
    { jaar: 1995, pct: 61.3 }, { jaar: 1999, pct: 51.7 }, { jaar: 2003, pct: 60.2 },
    { jaar: 2007, pct: 54.9 }, { jaar: 2011, pct: 64.7 }, { jaar: 2015, pct: 58.0 },
    { jaar: 2019, pct: 65.0 }, { jaar: 2023, pct: 70.1 },
  ],
  'Europees Parlement': [
    { jaar: 1979, pct: 59.1 }, { jaar: 1984, pct: 52.9 }, { jaar: 1989, pct: 51.2 },
    { jaar: 1994, pct: 37.2 }, { jaar: 1999, pct: 32.1 }, { jaar: 2004, pct: 37.2 },
    { jaar: 2009, pct: 37.5 }, { jaar: 2014, pct: 41.3 }, { jaar: 2019, pct: 42.3 },
    { jaar: 2024, pct: 57.7 },
  ],
  Waterschap: [
    { jaar: 2015, pct: 55.8 }, { jaar: 2019, pct: 61.8 }, { jaar: 2023, pct: 66.1 },
  ],
};

const GR_STEMMEN = [
  // 2006 – estimated/published
  { jaar: 2006, partijen: [
    { naam: 'SGP', stemmen: 3336, zetels: 6 },
    { naam: 'PvdA', stemmen: 1502, zetels: 3 },
    { naam: 'CDA', stemmen: 1318, zetels: 2 },
    { naam: 'Gemeentebelangen', stemmen: 1201, zetels: 2 },
    { naam: 'VVD', stemmen: 988, zetels: 2 },
    { naam: 'CU', stemmen: 741, zetels: 1 },
    { naam: 'D66', stemmen: 410, zetels: 1 },
  ]},
  // 2010
  { jaar: 2010, partijen: [
    { naam: 'SGP', stemmen: 3638, zetels: 7 },
    { naam: 'PvdA', stemmen: 1698, zetels: 3 },
    { naam: 'CDA', stemmen: 1402, zetels: 2 },
    { naam: 'Gemeentebelangen', stemmen: 1289, zetels: 2 },
    { naam: 'VVD', stemmen: 1155, zetels: 2 },
    { naam: 'CU', stemmen: 698, zetels: 1 },
  ]},
  // 2014
  { jaar: 2014, partijen: [
    { naam: 'SGP', stemmen: 4237, zetels: 8 },
    { naam: 'PvdA', stemmen: 1611, zetels: 3 },
    { naam: 'CDA', stemmen: 1299, zetels: 2 },
    { naam: 'Gemeentebelangen', stemmen: 1187, zetels: 2 },
    { naam: 'VVD', stemmen: 1098, zetels: 2 },
    { naam: 'CU', stemmen: 672, zetels: 1 },
  ]},
  // 2018
  { jaar: 2018, partijen: [
    { naam: 'SGP', stemmen: 4369, zetels: 8 },
    { naam: 'PvdA', stemmen: 1543, zetels: 3 },
    { naam: 'CDA', stemmen: 1385, zetels: 2 },
    { naam: 'Gemeentebelangen', stemmen: 1247, zetels: 2 },
    { naam: 'VVD', stemmen: 1063, zetels: 2 },
    { naam: 'CU', stemmen: 638, zetels: 1 },
    { naam: 'Vóór Neder-Betuwe', stemmen: 812, zetels: 1 },
  ]},
  // 2022 – official data from KiesRaad XML
  { jaar: 2022, partijen: [
    { naam: 'SGP', stemmen: 4905, zetels: 9 },
    { naam: 'PvdA', stemmen: 1606, zetels: 3 },
    { naam: 'Gemeentebelangen', stemmen: 1275, zetels: 2 },
    { naam: 'CDA', stemmen: 1270, zetels: 2 },
    { naam: 'VVD', stemmen: 1025, zetels: 1 },
    { naam: 'Vóór Neder-Betuwe', stemmen: 964, zetels: 1 },
    { naam: 'CU', stemmen: 695, zetels: 1 },
  ]},
  // 2026 – candidates known, no results yet
  { jaar: 2026, partijen: [
    { naam: 'SGP', stemmen: null, zetels: null },
    { naam: 'CDA-ChristenUnie', stemmen: null, zetels: null },
    { naam: 'GL-PvdA', stemmen: null, zetels: null },
    { naam: 'Gemeentebelangen', stemmen: null, zetels: null },
    { naam: 'VVD', stemmen: null, zetels: null },
    { naam: 'Vóór Neder-Betuwe', stemmen: null, zetels: null },
  ]},
];

const TK_STEMMEN_2025 = [
  { naam: 'SGP', stemmen: 5401, pct: 34 },
  { naam: 'PVV', stemmen: 3123, pct: 20 },
  { naam: 'VVD', stemmen: 1542, pct: 9.7 },
  { naam: 'CDA', stemmen: 1321, pct: 8.3 },
  { naam: 'D66', stemmen: 921, pct: 5.8 },
  { naam: 'JA21', stemmen: 784, pct: 4.95 },
  { naam: 'FvD', stemmen: 733, pct: 4.63 },
  { naam: 'GL-PvdA', stemmen: 650, pct: 4.11 },
  { naam: 'CU', stemmen: 466, pct: 2.94 },
  { naam: 'BBB', stemmen: 358, pct: 2.26 },
  { naam: '50PLUS', stemmen: 147, pct: 0.93 },
  { naam: 'SP', stemmen: 134, pct: 0.85 },
  { naam: 'PvdD', stemmen: 72, pct: 0.45 },
  { naam: 'DENK', stemmen: 60, pct: 0.38 },
  { naam: 'Volt', stemmen: 43, pct: 0.27 },
  { naam: 'NSC', stemmen: 28, pct: 0.18 },
];

const PS_STEMMEN_2023 = [
  { naam: 'SGP', stemmen: 4695, pct: 37 },
  { naam: 'BBB', stemmen: 2774, pct: 22 },
  { naam: 'VVD', stemmen: 765, pct: 6.1 },
  { naam: 'PvdA', stemmen: 661, pct: 5.2 },
  { naam: 'CDA', stemmen: 612, pct: 4.85 },
  { naam: 'CU', stemmen: 606, pct: 4.8 },
  { naam: 'PVV', stemmen: 578, pct: 4.58 },
  { naam: 'JA21', stemmen: 371, pct: 2.94 },
  { naam: 'FvD', stemmen: 282, pct: 2.24 },
  { naam: 'GroenLinks', stemmen: 214, pct: 1.7 },
  { naam: 'SP', stemmen: 197, pct: 1.56 },
  { naam: 'D66', stemmen: 189, pct: 1.5 },
];

const EP_STEMMEN_2024 = [
  { naam: 'SGP', stemmen: 4744, pct: 44.9 },
  { naam: 'PVV', stemmen: 1933, pct: 18.3 },
  { naam: 'GL-PvdA', stemmen: 746, pct: 7.1 },
  { naam: 'VVD', stemmen: 581, pct: 5.5 },
  { naam: 'CDA', stemmen: 580, pct: 5.5 },
  { naam: 'BBB', stemmen: 550, pct: 5.2 },
  { naam: 'CU', stemmen: 384, pct: 3.6 },
  { naam: 'D66', stemmen: 216, pct: 2.0 },
  { naam: 'NSC', stemmen: 202, pct: 1.9 },
  { naam: 'FvD', stemmen: 189, pct: 1.8 },
  { naam: 'Volt', stemmen: 131, pct: 1.2 },
  { naam: 'PvdD', stemmen: 92, pct: 0.9 },
];

const WS_STEMMEN_2023 = [
  { naam: 'SGP', stemmen: 5221, pct: 41.7 },
  { naam: 'BBB', stemmen: 2577, pct: 20.6 },
  { naam: 'CDA', stemmen: 763, pct: 6.1 },
  { naam: 'PvdA', stemmen: 743, pct: 5.9 },
  { naam: 'Water Natuurlijk', stemmen: 741, pct: 5.9 },
  { naam: 'VVD', stemmen: 647, pct: 5.2 },
  { naam: 'CU', stemmen: 597, pct: 4.8 },
  { naam: 'JA21', stemmen: 347, pct: 2.8 },
  { naam: 'PvdD', stemmen: 302, pct: 2.4 },
];

// ─── Simple bar component ──────────────────────────────────────────────────────
function HorizontalBar({ naam, stemmen, maxStemmen, pct }: { naam: string; stemmen: number | null; maxStemmen: number; pct?: number }) {
  const width = stemmen ? (stemmen / maxStemmen) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5 group">
      <div className="w-36 text-right text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{naam}</div>
      <div className="flex-1 relative h-7 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
          style={{ width: `${width}%`, backgroundColor: getColor(naam) }}
        >
          {width > 15 && (
            <span className="text-white text-xs font-bold">{pct ? `${pct}%` : ''}</span>
          )}
        </div>
      </div>
      <div className="w-20 text-sm text-slate-600 dark:text-slate-300">
        {stemmen !== null ? stemmen.toLocaleString('nl-NL') : '–'}
        {pct && width <= 15 ? <span className="ml-1 text-slate-400">({pct}%)</span> : null}
      </div>
    </div>
  );
}

// ─── Opkomst chart ────────────────────────────────────────────────────────────
function OpkomstChart() {
  const [activeType, setActiveType] = useState<keyof typeof OPKOMST_DATA>('Gemeenteraad');
  const data = OPKOMST_DATA[activeType].filter(d => d.pct !== null) as { jaar: number; pct: number }[];

  const minPct = Math.min(...data.map(d => d.pct)) - 5;
  const maxPct = Math.max(...data.map(d => d.pct)) + 5;
  const range = maxPct - minPct;
  const height = 200;
  const width = 700;
  const padding = { left: 45, right: 20, top: 20, bottom: 35 };

  const xScale = (i: number) =>
    padding.left + (i / (data.length - 1 || 1)) * (width - padding.left - padding.right);
  const yScale = (pct: number) =>
    padding.top + height - padding.top - padding.bottom - ((pct - minPct) / range) * (height - padding.top - padding.bottom);

  const points = data.map((d, i) => `${xScale(i)},${yScale(d.pct)}`).join(' ');
  const fillPoints = [
    `${padding.left},${height - padding.bottom}`,
    ...data.map((d, i) => `${xScale(i)},${yScale(d.pct)}`),
    `${xScale(data.length - 1)},${height - padding.bottom}`,
  ].join(' ');

  const yTicks = [40, 50, 60, 70, 80, 90].filter(t => t >= minPct - 2 && t <= maxPct + 2);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(OPKOMST_DATA) as Array<keyof typeof OPKOMST_DATA>).map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeType === type
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-orange-100'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 320, maxHeight: 280 }}>
          {/* Grid */}
          {yTicks.map(t => (
            <g key={t}>
              <line
                x1={padding.left} y1={yScale(t)} x2={width - padding.right} y2={yScale(t)}
                stroke="#E2E8F0" strokeWidth="1"
              />
              <text x={padding.left - 5} y={yScale(t) + 4} textAnchor="end" fontSize="10" fill="#94A3B8">{t}%</text>
            </g>
          ))}
          {/* Fill */}
          <polygon points={fillPoints} fill="#F9731630" />
          {/* Line */}
          <polyline points={points} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Dots and labels */}
          {data.map((d, i) => (
            <g key={d.jaar}>
              <circle cx={xScale(i)} cy={yScale(d.pct)} r="4" fill="#F97316" stroke="white" strokeWidth="2" />
              {i % 2 === 0 || data.length <= 10 ? (
                <text x={xScale(i)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="9" fill="#64748B">
                  {d.jaar}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        Opkomst {activeType} verkiezingen in Neder-Betuwe (bron: KiesRaad / AlleCijfers.nl)
      </p>
    </div>
  );
}

// ─── GR Trend chart ───────────────────────────────────────────────────────────
function GRTrendChart() {
  const [view, setView] = useState<'stemmen' | 'zetels'>('stemmen');

  const jaren = GR_STEMMEN.map(g => g.jaar);
  const allPartijen = Array.from(new Set(GR_STEMMEN.flatMap(g => g.partijen.map(p => p.naam))));
  const topPartijen = ['SGP', 'PvdA', 'CDA', 'Gemeentebelangen', 'VVD', 'CU', 'Vóór Neder-Betuwe'];

  const width = 700;
  const height = 220;
  const padding = { left: 50, right: 20, top: 20, bottom: 40 };

  const allValues = GR_STEMMEN.flatMap(g =>
    g.partijen.map(p => (view === 'stemmen' ? p.stemmen : p.zetels)).filter(Boolean)
  ) as number[];
  const maxVal = Math.max(...allValues);

  const xScale = (i: number) =>
    padding.left + (i / (jaren.length - 1)) * (width - padding.left - padding.right);
  const yScale = (val: number) =>
    padding.top + (height - padding.top - padding.bottom) * (1 - val / maxVal);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['stemmen', 'zetels'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              view === v
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-orange-100'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 320, maxHeight: 260 }}>
          {/* X-axis year labels */}
          {jaren.map((jaar, i) => (
            <text key={jaar} x={xScale(i)} y={height - padding.bottom + 16} textAnchor="middle" fontSize="9" fill="#94A3B8">
              {jaar}
            </text>
          ))}
          {/* Series */}
          {topPartijen.map(partij => {
            const pts = GR_STEMMEN.map((g, i) => {
              const p = g.partijen.find(p => p.naam === partij);
              const val = p ? (view === 'stemmen' ? p.stemmen : p.zetels) : null;
              return val !== null && val !== undefined ? { i, val } : null;
            }).filter(Boolean) as { i: number; val: number }[];

            if (pts.length < 2) return null;
            const linePoints = pts.map(p => `${xScale(p.i)},${yScale(p.val)}`).join(' ');

            return (
              <g key={partij}>
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke={getColor(partij)}
                  strokeWidth={partij === 'SGP' ? 3 : 1.8}
                  strokeLinejoin="round"
                  strokeDasharray={partij === 'SGP' ? undefined : undefined}
                  opacity={0.9}
                />
                {pts.map(p => (
                  <circle key={p.i} cx={xScale(p.i)} cy={yScale(p.val)} r="3.5" fill={getColor(partij)} stroke="white" strokeWidth="1.5" />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {topPartijen.map(p => (
          <div key={p} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getColor(p) }} />
            <span className="text-xs text-slate-600 dark:text-slate-300">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-lg`} style={{ background: color }}>
      <div className="text-3xl font-black">{value}</div>
      <div className="font-semibold mt-1">{label}</div>
      {sub && <div className="text-sm opacity-80 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NederBetuweClient() {
  const [activeTab, setActiveTab] = useState<'overzicht' | 'gemeenteraad' | 'prognose' | 'tk' | 'ps' | 'ep' | 'ws'>('overzicht');
  const [grJaar, setGrJaar] = useState(2022);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
  }, []);

  const grData = GR_STEMMEN.find(g => g.jaar === grJaar);
  const maxStemmenGR = Math.max(...(grData?.partijen.filter(p => p.stemmen !== null).map(p => p.stemmen as number) ?? [1]));
  const maxStemmenTK = Math.max(...TK_STEMMEN_2025.map(p => p.stemmen));
  const maxStemmenPS = Math.max(...PS_STEMMEN_2023.map(p => p.stemmen));
  const maxStemmenEP = Math.max(...EP_STEMMEN_2024.map(p => p.stemmen));
  const maxStemmenWS = Math.max(...WS_STEMMEN_2023.map(p => p.stemmen));

  const tabs = [
    { id: 'overzicht', label: '📊 Overzicht' },
    { id: 'gemeenteraad', label: '🏛️ Gemeenteraad' },
    { id: 'prognose', label: '🔮 Prognose 2026' },
    { id: 'tk', label: '🇳🇱 Tweede Kamer' },
    { id: 'ps', label: '🗺️ Prov. Staten' },
    { id: 'ep', label: '🇪🇺 Europ. Parlement' },
    { id: 'ws', label: '💧 Waterschap' },
  ] as const;

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <header className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <a href="/" className="text-white/70 hover:text-white text-sm transition-colors">← Terug naar kaart</a>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">Gemeente Neder-Betuwe</h1>
                <p className="mt-2 text-lg text-orange-100 max-w-2xl">
                  Historische verkiezingsanalyse · 1970–2026 · Gemeenteraad, Tweede Kamer, Provinciale Staten, Europees Parlement & Waterschap
                </p>
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className="mt-1 p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-xl"
                title="Wissel thema"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>

            {/* Live banner 2026 */}
            <div className="mt-6 inline-flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-ping inline-flex" />
              VANDAAG: Gemeenteraadsverkiezingen 2026 · Stembureaus open t/m 21:00 uur · Uitslag volgt vanavond
            </div>
          </div>
        </header>

        {/* Stats row */}
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Opkomst 2022 GR" value="62,7%" sub="16 maart 2022" color="linear-gradient(135deg, #F97316, #EA580C)" />
          <StatCard label="SGP-zetels 2022" value="9 / 19" sub="47% van de raad" color="linear-gradient(135deg, #3B82F6, #1E40AF)" />
          <StatCard label="SGP Tweede Kamer 2025" value="34%" sub="5.401 stemmen" color="linear-gradient(135deg, #10B981, #065F46)" />
          <StatCard label="Opkomst TK 2025" value="85,9%" sub="29 oktober 2025" color="linear-gradient(135deg, #8B5CF6, #5B21B6)" />
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* ── OVERZICHT ── */}
          {activeTab === 'overzicht' && (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Opkomst per type verkiezing</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Percentage kiesgerechtigden dat heeft gestemd, 1970–2025.
                </p>
                <OpkomstChart />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">2026: Kandiderende partijen</h2>
                  <p className="text-sm text-slate-500 mb-4">
                    De gemeenteraad groeit van 19 naar <strong>21 leden</strong>. De stembureaus zijn open t/m 21:00.
                  </p>
                  <div className="space-y-2">
                    {['SGP', 'CDA-ChristenUnie', 'GL-PvdA', 'Gemeentebelangen', 'VVD', 'Vóór Neder-Betuwe'].map(p => (
                      <div key={p} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: getColor(p) }} />
                        <span className="font-medium text-slate-700 dark:text-slate-200">{p}</span>
                        <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Deelnemend</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-sm text-amber-800 dark:text-amber-300">
                    📅 Officiele uitslag: donderdag 26 maart 2026, 10:00 uur (Hoofdstembureau)
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">SGP dominantie door de jaren</h2>
                  <div className="space-y-1">
                    {GR_STEMMEN.filter(g => g.jaar <= 2022).map(g => {
                      const sgp = g.partijen.find(p => p.naam === 'SGP');
                      const totaal = g.partijen.reduce((a, p) => a + (p.stemmen ?? 0), 0);
                      const pct = sgp?.stemmen ? Math.round((sgp.stemmen / totaal) * 100) : 0;
                      return (
                        <div key={g.jaar} className="flex items-center gap-3">
                          <span className="w-10 text-sm font-bold text-slate-700 dark:text-slate-300">{g.jaar}</span>
                          <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: getColor('SGP') }}
                            >
                              {pct > 15 ? `${pct}%` : ''}
                            </div>
                          </div>
                          <span className="w-16 text-sm text-slate-600 dark:text-slate-400">
                            {sgp?.zetels ?? '?'} zetels
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Vergelijkingstabel */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 overflow-x-auto">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                  Vergelijking meest recente uitslagen per verkiezingstype
                </h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-600">
                      <th className="text-left py-2 pr-4 text-slate-500 dark:text-slate-400 font-semibold">Partij</th>
                      <th className="text-right py-2 px-3 text-slate-500 dark:text-slate-400 font-semibold">GR 2022</th>
                      <th className="text-right py-2 px-3 text-slate-500 dark:text-slate-400 font-semibold">TK 2025</th>
                      <th className="text-right py-2 px-3 text-slate-500 dark:text-slate-400 font-semibold">PS 2023</th>
                      <th className="text-right py-2 px-3 text-slate-500 dark:text-slate-400 font-semibold">EP 2024</th>
                      <th className="text-right py-2 pl-3 text-slate-500 dark:text-slate-400 font-semibold">WS 2023</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['SGP', 'PVV', 'VVD', 'CDA', 'PvdA', 'GL-PvdA', 'CU', 'Gemeentebelangen', 'BBB', 'D66'].map(naam => {
                      const gr = GR_STEMMEN.find(g => g.jaar === 2022)?.partijen.find(p => p.naam === naam);
                      const tk = TK_STEMMEN_2025.find(p => p.naam === naam);
                      const ps = PS_STEMMEN_2023.find(p => p.naam === naam);
                      const ep = EP_STEMMEN_2024.find(p => p.naam === naam);
                      const ws = WS_STEMMEN_2023.find(p => p.naam === naam);
                      if (!gr && !tk && !ps && !ep && !ws) return null;
                      return (
                        <tr key={naam} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(naam) }} />
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{naam}</span>
                            </div>
                          </td>
                          <td className="text-right py-2 px-3 text-slate-600 dark:text-slate-300">{gr?.stemmen?.toLocaleString('nl-NL') ?? '–'}</td>
                          <td className="text-right py-2 px-3 text-slate-600 dark:text-slate-300">{tk?.stemmen?.toLocaleString('nl-NL') ?? '–'}</td>
                          <td className="text-right py-2 px-3 text-slate-600 dark:text-slate-300">{ps?.stemmen?.toLocaleString('nl-NL') ?? '–'}</td>
                          <td className="text-right py-2 px-3 text-slate-600 dark:text-slate-300">{ep?.stemmen?.toLocaleString('nl-NL') ?? '–'}</td>
                          <td className="text-right py-2 pl-3 text-slate-600 dark:text-slate-300">{ws?.stemmen?.toLocaleString('nl-NL') ?? '–'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── GEMEENTERAAD ── */}
          {activeTab === 'gemeenteraad' && (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Gemeenteraadsverkiezingen – trend 2006–2026</h2>
                <GRTrendChart />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    Uitslag per jaar
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {GR_STEMMEN.map(g => (
                      <button
                        key={g.jaar}
                        onClick={() => setGrJaar(g.jaar)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          grJaar === g.jaar
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-orange-100'
                        } ${g.jaar === 2026 ? 'relative' : ''}`}
                      >
                        {g.jaar}
                        {g.jaar === 2026 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {grJaar === 2026 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🗳️</div>
                    <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">Verkiezingen vandaag!</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Op woensdag 18 maart 2026 worden de gemeenteraadsverkiezingen gehouden. De stembureaus zijn open van 07:30 tot 21:00 uur. De voorlopige uitslag wordt verwacht vanavond vanaf ±22:30 uur.
                    </p>
                    <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl inline-block">
                      <p className="font-semibold text-orange-800 dark:text-orange-300">Deelnemende partijen 2026:</p>
                      <div className="flex flex-wrap gap-2 mt-2 justify-center">
                        {['SGP', 'CDA-ChristenUnie', 'GL-PvdA', 'Gemeentebelangen', 'VVD', 'Vóór Neder-Betuwe'].map(p => (
                          <span key={p} className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: getColor(p) }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      {grData?.partijen.map(p => (
                        <HorizontalBar key={p.naam} naam={p.naam} stemmen={p.stemmen} maxStemmen={maxStemmenGR} />
                      ))}
                    </div>
                    <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-4">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Zetelverdeling</h3>
                      <div className="flex flex-wrap gap-2">
                        {grData?.partijen.filter(p => p.zetels).map(p =>
                          Array.from({ length: p.zetels as number }).map((_, i) => (
                            <div
                              key={`${p.naam}-${i}`}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
                              style={{ backgroundColor: getColor(p.naam) }}
                              title={`${p.naam}: zetel ${i + 1} van ${p.zetels}`}
                            />
                          ))
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {grData?.partijen.filter(p => p.zetels).map(p => (
                          <div key={p.naam} className="flex items-center gap-1.5 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(p.naam) }} />
                            <span className="text-slate-600 dark:text-slate-300">{p.naam}: <b>{p.zetels}</b></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* ── PROGNOSE 2026 ── */}
          {activeTab === 'prognose' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Zetelprognose 2026</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Van 19 naar <strong className="text-orange-600">21 zetels</strong> · 6 partijen · Op basis van trends 2022 + TK2025
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold animate-pulse">
                    ⏳ Wacht op uitslag vanavond
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-800 dark:text-amber-300 mb-6">
                  <strong>Let op:</strong> Deze prognose is een inschatting op basis van de GR2022-uitslag, recente TK2025/PS2023-trends en de nieuwe samenstelling
                  (CDA + CU gaan samen als CDA-ChristenUnie, PvdA + GL gaan als GL-PvdA). De echte uitslagen worden vanavond na 21:00 verwacht.
                </div>

                {/* Prognose data */}
                {(() => {
                  const prognose = [
                    { naam: 'SGP', min: 9, max: 10, verwacht: 9, kleur: getColor('SGP'), toelichting: 'Stabiel dominant. Mogelijk 10e zetel door 21-raad effect.' },
                    { naam: 'CDA-ChristenUnie', min: 2, max: 3, verwacht: 3, kleur: getColor('CDA-ChristenUnie'), toelichting: 'Samenvoeging CDA (2) + CU (1) = 3 zetels basis. Synergie mogelijk.' },
                    { naam: 'GL-PvdA', min: 2, max: 4, verwacht: 3, kleur: getColor('GL-PvdA'), toelichting: 'Fusie PvdA (3 zetels in 2022) + landelijke GL-kracht. Sterk potentieel.' },
                    { naam: 'Gemeentebelangen', min: 2, max: 3, verwacht: 2, kleur: getColor('Gemeentebelangen'), toelichting: 'Lokale partij, stabiel rond 11%. Kan profiteren van extra zetels.' },
                    { naam: 'VVD', min: 1, max: 2, verwacht: 2, kleur: getColor('VVD'), toelichting: 'Landelijk stabiel. Kans op extra zetel door 21-raad.' },
                    { naam: 'Vóór Neder-Betuwe', min: 1, max: 2, verwacht: 2, kleur: getColor('Vóór Neder-Betuwe'), toelichting: 'Lokale nieuwkomer uit 2018, groeiend. Mogelijk 2e zetel.' },
                  ];
                  const totaalVerwacht = prognose.reduce((a, p) => a + p.verwacht, 0);

                  return (
                    <div className="space-y-4">
                      {prognose.map(p => (
                        <div key={p.naam} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.kleur }} />
                              <span className="font-bold text-slate-800 dark:text-white">{p.naam}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">{p.min}–{p.max}</span>
                              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">{p.verwacht}</span>
                            </div>
                          </div>
                          {/* Mini bar showing seat range */}
                          <div className="relative h-4 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mb-2">
                            <div
                              className="absolute h-full rounded-full opacity-30"
                              style={{ left: `${(p.min / 21) * 100}%`, width: `${((p.max - p.min + 1) / 21) * 100}%`, backgroundColor: p.kleur }}
                            />
                            <div
                              className="absolute h-full rounded-full"
                              style={{ width: `${(p.verwacht / 21) * 100}%`, backgroundColor: p.kleur }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{p.toelichting}</p>
                        </div>
                      ))}

                      {/* Totaal check */}
                      <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Totaal verwachte zetels</span>
                        <span className={`text-2xl font-black ${totaalVerwacht === 21 ? 'text-green-600' : 'text-red-500'}`}>
                          {totaalVerwacht} / 21
                        </span>
                      </div>

                      {/* Visual seat grid */}
                      <div className="mt-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Verwachte raadssamenstelling 2026</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {prognose.flatMap(p =>
                            Array.from({ length: p.verwacht }).map((_, i) => (
                              <div
                                key={`${p.naam}-${i}`}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md border-2 border-white dark:border-slate-600"
                                style={{ backgroundColor: p.kleur }}
                                title={p.naam}
                              >
                                {i + 1}
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4 justify-center">
                          {prognose.map(p => (
                            <div key={p.naam} className="flex items-center gap-1.5 text-sm">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.kleur }} />
                              <span className="text-slate-600 dark:text-slate-300">{p.naam}: <b>{p.verwacht}</b></span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Vergelijking 2022 vs 2026 */}
                      <div className="mt-6">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Verschil 2022 → 2026 (prognose)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {[
                            { naam: 'SGP', was: 9, wordt: 9 },
                            { naam: 'CDA-ChristenUnie', was: 3, wordt: 3, note: 'CDA(2)+CU(1) → samen' },
                            { naam: 'GL-PvdA', was: 3, wordt: 3, note: 'PvdA(3) → fusie GL-PvdA' },
                            { naam: 'Gemeentebelangen', was: 2, wordt: 2 },
                            { naam: 'VVD', was: 1, wordt: 2, note: '+1 door extra zetels' },
                            { naam: 'Vóór Neder-Betuwe', was: 1, wordt: 2, note: '+1 door groei' },
                          ].map(p => {
                            const diff = p.wordt - p.was;
                            return (
                              <div key={p.naam} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(p.naam) }} />
                                    <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{p.naam}</span>
                                  </div>
                                  {p.note && <p className="text-xs text-slate-400 mt-0.5">{p.note}</p>}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400 text-sm">{p.was}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="font-bold text-sm" style={{ color: getColor(p.naam) }}>{p.wordt}</span>
                                  {diff !== 0 && (
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${diff > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {diff > 0 ? `+${diff}` : diff}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ── TWEEDE KAMER ── */}
          {activeTab === 'tk' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tweede Kamer verkiezingen 2025</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">29 oktober 2025 · Opkomst: 85,9% · Winnaar: SGP (34%)</p>
                </div>
                <div className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold">
                  Totaal: {TK_STEMMEN_2025.reduce((a, b) => a + b.stemmen, 0).toLocaleString('nl-NL')} stemmen
                </div>
              </div>
              <div className="space-y-1">
                {TK_STEMMEN_2025.map(p => (
                  <HorizontalBar key={p.naam} naam={p.naam} stemmen={p.stemmen} maxStemmen={maxStemmenTK} pct={p.pct} />
                ))}
              </div>
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                <strong>Analyse:</strong> De SGP is in Neder-Betuwe veruit de dominante partij bij de Tweede Kamer verkiezingen met 34% van de stemmen. 
                De PVV is sterk gestegen naar 20%, terwijl traditionele partijen als VVD (9,7%) en CDA (8,3%) derde en vierde plaats bezetten. 
                Dit profiel wijkt sterk af van het landelijk gemiddelde door de sterke reformatorische achtergrond van de gemeente.
              </div>
            </div>
          )}

          {/* ── PROVINCIALE STATEN ── */}
          {activeTab === 'ps' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Provinciale Staten Gelderland 2023</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">15 maart 2023 · Opkomst: 70,1% · Winnaar: SGP (37%)</p>
                </div>
                <div className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold">
                  Totaal: {PS_STEMMEN_2023.reduce((a, b) => a + b.stemmen, 0).toLocaleString('nl-NL')} stemmen
                </div>
              </div>
              <div className="space-y-1">
                {PS_STEMMEN_2023.map(p => (
                  <HorizontalBar key={p.naam} naam={p.naam} stemmen={p.stemmen} maxStemmen={maxStemmenPS} pct={p.pct} />
                ))}
              </div>
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                <strong>Opmerkelijk:</strong> bij de PS-verkiezingen van 2023 behaalde BBB een verrassende tweede plaats met 22%, gedreven door de landelijke boerenprotesten. 
                De SGP hield stand met 37% van de stemmen in Neder-Betuwe.
              </div>
            </div>
          )}

          {/* ── EUROPEES PARLEMENT ── */}
          {activeTab === 'ep' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Europees Parlement verkiezingen 2024</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">6 juni 2024 · Opkomst: 57,7% · Winnaar: SGP (44,9%)</p>
                </div>
                <div className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold">
                  Totaal: {EP_STEMMEN_2024.reduce((a, b) => a + b.stemmen, 0).toLocaleString('nl-NL')} stemmen
                </div>
              </div>
              <div className="space-y-1">
                {EP_STEMMEN_2024.map(p => (
                  <HorizontalBar key={p.naam} naam={p.naam} stemmen={p.stemmen} maxStemmen={maxStemmenEP} pct={p.pct} />
                ))}
              </div>
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                <strong>Analyse:</strong> Bij de Europese verkiezingen haalt de SGP haar hoogste percentage in Neder-Betuwe: 44,9%. 
                De lage opkomst (57,7%) is typerend voor Europese verkiezingen nationaal, maar in Neder-Betuwe nog altijd aan de hogere kant.
              </div>
            </div>
          )}

          {/* ── WATERSCHAP ── */}
          {activeTab === 'ws' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Waterschapsverkiezingen 2023</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">15 maart 2023 · Opkomst: 66,1% · Winnaar: SGP (41,7%)</p>
                </div>
                <div className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold">
                  Totaal: {WS_STEMMEN_2023.reduce((a, b) => a + b.stemmen, 0).toLocaleString('nl-NL')} stemmen
                </div>
              </div>
              <div className="space-y-1">
                {WS_STEMMEN_2023.map(p => (
                  <HorizontalBar key={p.naam} naam={p.naam} stemmen={p.stemmen} maxStemmen={maxStemmenWS} pct={p.pct} />
                ))}
              </div>
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                <strong>Analyse:</strong> Net als bij andere verkiezingstypen domineert de SGP ook bij de waterschapsverkiezingen in Neder-Betuwe. 
                BBB behaalde een sterke tweede positie (20,6%), gevolgd door CDA en PvdA.
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 py-8 mt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Bronnen: KiesRaad · AlleCijfers.nl · CBS · Gemeente Neder-Betuwe · Bijgewerkt: 18 maart 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
