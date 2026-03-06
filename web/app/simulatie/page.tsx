import { Metadata } from 'next';
import { getAllGemeenten } from '@/lib/parseXml';
import SimulatieApp from '@/components/SimulatieApp';

export const metadata: Metadata = {
  title: 'Simulator Gemeenteraadsverkiezingen 2026 - Uitslagenavond',
  description: 'Simuleer je eigen uitslag voor de gemeenteraadsverkiezingen van 2026 en zie direct hoe de zetels worden verdeeld.',
};

export default async function SimulatiePage() {
  const gemeenten2022 = getAllGemeenten('2022');
  return <SimulatieApp gemeenten={gemeenten2022} />;
}
