import { Metadata } from 'next';
import { getAllGemeenten, BESCHIKBARE_JAREN, type Jaar } from '@/lib/parseXml';
import GemeenteApp from '@/components/GemeenteApp';

interface Props {
  searchParams: Promise<{ jaar?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const jaar = params.jaar || '2022';
  return {
    title: `Uitslagen Gemeenteraadsverkiezingen ${jaar} - Interactieve Kaart`,
    description: `Bekijk alle uitslagen van de gemeenteraadsverkiezingen in ${jaar} per gemeente op de interactieve kaart van Nederland.`,
  };
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const jaar = (BESCHIKBARE_JAREN as readonly string[]).includes(params.jaar ?? '')
    ? (params.jaar as Jaar)
    : '2022';

  const gemeenten = getAllGemeenten(jaar);
  return <GemeenteApp gemeenten={gemeenten} jaar={jaar} />;
}
