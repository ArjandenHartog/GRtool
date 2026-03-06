import { Metadata } from 'next';
import { getAllGemeenten } from '@/lib/parseXml';
import PrognoseApp from '@/components/PrognoseApp';

export const metadata: Metadata = {
  title: 'Prognose Gemeenteraadsverkiezingen 2026 - Uitslagenavond',
  description: 'Bereken de prognose voor de gemeenteraadsverkiezingen van 2026 op basis van de Tweede Kamer uitslagen van 2023 en 2025.',
};

export default function PrognosePage() {
  const gemeenten = getAllGemeenten('2022');
  
  return <PrognoseApp gemeenten={gemeenten} />;
}
