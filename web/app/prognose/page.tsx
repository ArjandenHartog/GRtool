import { getAllGemeenten } from '@/lib/parseXml';
import PrognoseApp from '@/components/PrognoseApp';

export default function PrognosePage() {
  const gemeenten = getAllGemeenten('2022');
  
  return <PrognoseApp gemeenten={gemeenten} />;
}
