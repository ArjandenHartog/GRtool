'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useEffect, useState, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PathOptions } from 'leaflet';
import { Gemeente } from '@/lib/types';
import { getPartyColor } from '@/lib/partijKleuren';
import type { KleurModus, Achtergrond, MapConfig } from '@/lib/mapConfig';

export type { KleurModus, Achtergrond, MapConfig } from '@/lib/mapConfig';
export { DEFAULT_MAP_CONFIG } from '@/lib/mapConfig';

interface Props {
  gemeenten: Gemeente[];
  jaar: string;
  selected: string | null;
  onSelect: (naam: string) => void;
  mapConfig: MapConfig;
  onMapConfigChange: (c: MapConfig) => void;
}

const TILE_LAYERS: Record<Achtergrond, { url: string; attribution: string } | null> = {
  'osm': {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  'carto-light': {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  'carto-dark': {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  'geen': null,
};

function zetelsKleur(zetels: number): string {
  const min = 7, max = 45;
  const t = Math.min(1, Math.max(0, (zetels - min) / (max - min)));
  const r = Math.round(219 - t * 160);
  const g = Math.round(234 - t * 180);
  const b = Math.round(255 - t * 55);
  return `rgb(${r},${g},${b})`;
}

function styleFor(g: Gemeente | undefined, isSelected: boolean, config: MapConfig): PathOptions {
  let fillColor = '#e2e8f0';
  if (g) {
    switch (config.kleurModus) {
      case 'partij': fillColor = getPartyColor(g.grootstePartij); break;
      case 'zetels': fillColor = zetelsKleur(g.totaalZetels); break;
      case 'makkelijkeZetel': fillColor = g.makkelijkeZetelPartijen.length > 0 ? '#f97316' : '#cbd5e1'; break;
    }
  }
  return {
    fillColor,
    weight: isSelected ? 2.5 : 0.4,
    color: isSelected ? '#0f172a' : '#ffffff',
    fillOpacity: isSelected ? 1 : 0.82,
  };
}

function MapConfigPanel({ config, onChange }: { config: MapConfig; onChange: (c: MapConfig) => void }) {
  return (
    <div
      className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-md p-3 text-xs min-w-[175px]"
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <p className="font-semibold text-slate-500 mb-2 uppercase tracking-wide text-[10px]">Kaartopties</p>

      <p className="text-slate-500 mb-1 font-medium">Kleur op</p>

      {(['partij', 'zetels', 'makkelijkeZetel'] as KleurModus[]).map((m) => (
        <label key={m} className="flex items-center gap-2 py-0.5 cursor-pointer hover:text-slate-900">
          <input
            type="radio"
            name="kleurModus"
            value={m}
            checked={config.kleurModus === m}
            onChange={() => onChange({ ...config, kleurModus: m })}
            className="accent-blue-600"
          />
          <span className="flex items-center gap-1">
            {m === 'partij' && 'Grootste partij'}
            {m === 'zetels' && 'Totaal zetels'}
            {m === 'makkelijkeZetel' && (
              <>
                Makkelijke zetels
                <span
                  title="Een 'makkelijke zetel' is een zetel die een partij wint via de restzetelverdeling als enige zetel — de partij had niet genoeg stemmen voor een volle zetel maar krijgt er toch één via de restzetelregel. Gemeenten oranje = minstens één partij met zo'n zetel."
                  className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-500 cursor-help text-[9px] font-bold leading-none flex-shrink-0"
                >
                  ?
                </span>
              </>
            )}
          </span>
        </label>
      ))}

      <hr className="my-2 border-slate-200" />
      <p className="text-slate-500 mb-1 font-medium">Achtergrond</p>
      {([['osm', 'OpenStreetMap'], ['carto-light', 'Licht (Carto)'], ['carto-dark', 'Donker (Carto)'], ['geen', 'Geen']] as [Achtergrond, string][]).map(([val, label]) => (
        <label key={val} className="flex items-center gap-2 py-0.5 cursor-pointer hover:text-slate-900">
          <input
            type="radio"
            name="achtergrond"
            value={val}
            checked={config.achtergrond === val}
            onChange={() => onChange({ ...config, achtergrond: val })}
            className="accent-blue-600"
          />
          {label}
        </label>
      ))}
    </div>
  );
}

export default function NlKaart({ gemeenten, jaar, selected, onSelect, mapConfig, onMapConfigChange }: Props) {
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerMap = useRef<Map<string, L.Path>>(new Map());
  const selectedRef = useRef(selected);
  const mapConfigRef = useRef(mapConfig);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { mapConfigRef.current = mapConfig; }, [mapConfig]);

  // Patch deprecated Firefox pointer properties in Leaflet
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domEvent = (L as any).DomEvent;
    if (domEvent && domEvent._normalize) {
      const orig = domEvent._normalize;
      domEvent._normalize = function (e: Event) {
        try { return orig.call(this, e); } catch { return e; }
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const byCode = useMemo(() => {
    const m = new Map<string, Gemeente>();
    for (const g of gemeenten) m.set(g.cbsCodeFormatted, g);
    return m;
  }, [gemeenten]);

  const byNaam = useMemo(() => {
    const m = new Map<string, Gemeente>();
    for (const g of gemeenten) m.set(g.naam.toLowerCase(), g);
    return m;
  }, [gemeenten]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setGeoData(null);
    layerMap.current.clear();
    fetch(`/geodata/gemeente-${jaar}.geojson`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => { setGeoData(data as GeoJSON.FeatureCollection); setLoading(false); })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, [jaar]);

  useEffect(() => {
    layerMap.current.forEach((layer, statnaam) => {
      const g = byNaam.get(statnaam.toLowerCase());
      const isSelected = selected !== null && (g?.naam === selected || statnaam === selected);
      layer.setStyle(styleFor(g, isSelected, mapConfig));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isSelected && (layer as any)._map) layer.bringToFront();
    });
  }, [selected, byNaam, mapConfig]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styleFeature = (feature: any): PathOptions => {
    const statcode: string = feature?.properties?.statcode ?? '';
    const statnaam: string = feature?.properties?.statnaam ?? '';
    const g = byCode.get(statcode) ?? byNaam.get(statnaam.toLowerCase());
    const isSelected = selected !== null && (g?.naam === selected || statnaam === selected);
    return styleFor(g, isSelected, mapConfig);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEachFeature = (feature: any, layer: any) => {
    const statnaam: string = feature?.properties?.statnaam ?? '';
    const statcode: string = feature?.properties?.statcode ?? '';
    const g = byCode.get(statcode) ?? byNaam.get(statnaam.toLowerCase());

    layerMap.current.set(statnaam, layer as L.Path);

    const tip = g
      ? `<strong>${statnaam}</strong><br/><span style="color:#666">${g.grootstePartij} &bull; ${g.grootstePartijZetels} zetels</span>`
      : `<strong>${statnaam}</strong>`;
    layer.bindTooltip(tip, { sticky: true, direction: 'top', opacity: 0.97 });

    layer.on({
      click: () => onSelect(g?.naam ?? statnaam),
      mouseover: (e: { target: L.Path }) => {
        e.target.setStyle({ fillOpacity: 1, weight: 2, color: '#334155' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e.target as any).bringToFront();
      },
      mouseout: (e: { target: L.Path }) => {
        const sel = selectedRef.current;
        const isSel = sel !== null && (g?.naam === sel || statnaam === sel);
        e.target.setStyle(styleFor(g, isSel, mapConfigRef.current));
      },
    });
  };

  const tileLayer = TILE_LAYERS[mapConfig.achtergrond];

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
          <p className="text-sm text-muted-foreground">Kaart laden…</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50 p-8">
          <p className="text-sm text-red-600 text-center">Kaart laden mislukt: {error}</p>
        </div>
      )}
      <MapConfigPanel config={mapConfig} onChange={onMapConfigChange} />
      <button
        onClick={() => mapRef.current?.setView([52.25, 5.3], 7, { animate: true })}
        className="absolute bottom-8 right-3 z-[1000] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-md px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 transition-colors flex items-center gap-1.5"
        title="Terug naar Nederland overzicht"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        NL
      </button>
      <MapContainer
        ref={mapRef}
        center={[52.25, 5.3]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl
        scrollWheelZoom
        wheelPxPerZoomLevel={200}
      >
        {tileLayer && (
          <TileLayer
            key={mapConfig.achtergrond}
            attribution={tileLayer.attribution}
            url={tileLayer.url}
            opacity={mapConfig.achtergrond === 'osm' ? 0.4 : 0.7}
          />
        )}
        {geoData && (
          <GeoJSON
            key={`${jaar}-${gemeenten.length}`}
            data={geoData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
