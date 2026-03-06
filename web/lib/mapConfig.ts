export type KleurModus = 'partij' | 'zetels' | 'makkelijkeZetel';
export type Achtergrond = 'osm' | 'carto-light' | 'carto-dark' | 'geen';

export interface MapConfig {
  kleurModus: KleurModus;
  achtergrond: Achtergrond;
}

export const DEFAULT_MAP_CONFIG: MapConfig = {
  kleurModus: 'partij',
  achtergrond: 'carto-light',
};
