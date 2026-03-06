import { getAllGemeenten, BESCHIKBARE_JAREN, type Jaar } from '@/lib/parseXml';
import GemeenteApp from '@/components/GemeenteApp';

interface Props {
  searchParams: Promise<{ jaar?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const jaar = (BESCHIKBARE_JAREN as readonly string[]).includes(params.jaar ?? '')
    ? (params.jaar as Jaar)
    : '2022';

  const gemeenten = getAllGemeenten(jaar);
  return <GemeenteApp gemeenten={gemeenten} jaar={jaar} />;
}
