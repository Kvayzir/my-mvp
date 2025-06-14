import { fetchCardData } from '@/app/lib/data';
import Card from './cards';

export default async function CardWrapper() {
  const {topics} = await fetchCardData();
  return (
    <>
      <Card title="Tema 1" value={topics[0]} type="collected" />
      <Card title="Tema 2" value={topics[1]} type="pending" />
      <Card title="Tema 3" value={topics[2]} type="invoices" />
    </>
  );
}