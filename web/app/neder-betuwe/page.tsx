import { Metadata } from 'next';
import NederBetuweClient from './NederBetuweClient';

export const metadata: Metadata = {
  title: 'Verkiezingsanalyse Gemeente Neder-Betuwe | Historische Uitslagen 1970–2026',
  description:
    'Complete analyse van alle verkiezingsuitslagen in de gemeente Neder-Betuwe: gemeenteraad, Tweede Kamer, Provinciale Staten, Europees Parlement en Waterschap. Met interactieve grafieken en historische data.',
};

export default function NederBetuwePage() {
  return <NederBetuweClient />;
}
