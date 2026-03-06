import { getPartyLogoIndex, TOTAL_LOGOS } from '@/lib/partyLogos';

interface Props {
  naam: string;
  size?: number;
  /** Kleur voor fallback gekleurde stip als er geen logo is */
  fallbackColor?: string;
}

export default function PartyLogo({ naam, size = 20, fallbackColor }: Props) {
  const index = getPartyLogoIndex(naam);

  if (index === null) {
    if (!fallbackColor) return null;
    return (
      <span
        className="flex-shrink-0 rounded-sm inline-block"
        style={{ width: size * 0.6, height: size * 0.6, backgroundColor: fallbackColor }}
      />
    );
  }

  return (
    <div
      className="flex-shrink-0 rounded-sm overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundImage: 'url("/parties.png")',
        backgroundSize: `${size}px ${size * TOTAL_LOGOS}px`,
        backgroundPosition: `0 ${-index * size}px`,
        backgroundRepeat: 'no-repeat',
      }}
      aria-label={naam}
    />
  );
}
