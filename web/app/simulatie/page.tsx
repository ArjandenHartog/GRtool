import { getAllGemeenten } from '@/lib/parseXml';
import SimulatieApp from '@/components/SimulatieApp';

export default async function SimulatiePage() {
  const gemeenten2022 = getAllGemeenten('2022');
  return <SimulatieApp gemeenten={gemeenten2022} />;
}
