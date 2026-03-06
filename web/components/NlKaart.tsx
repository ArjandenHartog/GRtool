'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useEffect, useState, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PathOptions } from 'leaflet';
import { Gemeente } from '@/lib/types';
import { getPartyColor } from '@/lib/partijKleuren';

interface Props {
  gemeenten: Gemeente[];
  selected: string | null;
  onSelect: (naam: string) => void;
}

const PDOK_URL =
  'https://service.pdok.nl/cbs/gebiedsindelingen/2022/wfs/v1_0' +
  '?service=WFS&version=1.1.0&request=GetFeature' +
  '&typeName=gebiedsindelingen:gemeente_gegeneraliseerd' +
  '&outputFormat=application/json&srsName=EPSG:4326';

function styleFor(g: Gemeente | undefined, isSelected: boolean): PathOptions {
  return {
    fillColor: g ? getPartyColor(g.grootstePartij) : '#e2e8f0',
    weight: isSelected ? 2.5 : 0.4,
    color: isSelected ? '#0f172a' : '#ffffff',
    fillOpacity: isSelected ? 1 : 0.82,
  };
}

export default function NlKaart({ gemeenten, selected, onSelect }: Props) {
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  // layerMap: statnaam → leaflet layer
  const layerMap = useRef<Map<string, L.Path>>(new Map());

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
    fetch(PDOK_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setGeoData(data as GeoJSON.FeatureCollection);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  // Update layer styles when selected changes — no remount needed
  useEffect(() => {
    layerMap.current.forEach((layer, statnaam) => {
      const g = byNaam.get(statnaam.toLowerCase());
      const isSelected = selected !== null && (g?.naam === selected || statnaam === selected);
      layer.setStyle(styleFor(g, isSelected));
      if (isSelected) layer.bringToFront();
    });
  }, [selected, byNaam]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styleFeature = (feature: any): PathOptions => {
    const statcode: string = feature?.properties?.statcode ?? '';
    const statnaam: string = feature?.properties?.statnaam ?? '';
    const g = byCode.get(statcode) ?? byNaam.get(statnaam.toLowerCase());
    const isSelected = selected !== null && (g?.naam === selected || statnaam === selected);
    return styleFor(g, isSelected);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEachFeature = (feature: any, layer: any) => {
    const statnaam: string = feature?.properties?.statnaam ?? '';
    const statcode: string = feature?.properties?.statcode ?? '';
    const g = byCode.get(statcode) ?? byNaam.get(statnaam.toLowerCase());

    // Register layer for imperative style updates
    layerMap.current.set(statnaam, layer as L.Path);

    const tip = g
      ? `<strong>${statnaam}</strong><br/><span style="color:#666">${g.grootstePartij} &bull; ${g.grootstePartijZetels} zetels</span>`
      : `<strong>${statnaam}</strong>`;
    layer.bindTooltip(tip, { sticky: true, direction: 'top', opacity: 0.97 });

    layer.on({
      click: () => onSelect(g?.naam ?? statnaam),
      mouseover: (e: { target: L.Path }) => {
        e.target.setStyle({ fillOpacity: 1, weight: 2, color: '#334155' });
        (e.target as any).bringToFront();
      },
      mouseout: (e: { target: L.Path }) => {
        const isSel = selected !== null && (g?.naam === selected || statnaam === selected);
        e.target.setStyle(styleFor(g, isSel));
      },
    });
  };

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
          <p className="text-sm text-muted-foreground">Kaart van Nederland laden…</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50 p-8">
          <p className="text-sm text-red-600 text-center">Kaart laden mislukt: {error}</p>
        </div>
      )}
      <MapContainer
        ref={mapRef}
        center={[52.25, 5.3]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.4}
        />
        {geoData && (
          <GeoJSON
            key={gemeenten.length}
            data={geoData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
