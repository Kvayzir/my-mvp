import { fetchCardData } from '@/app/lib/data';
import Card from './cards';

export default async function CardWrapper() {
  const {topics} = await fetchCardData();
  console.log('CardWrapper topics:', topics);
  return (
    <>
      <div 
        className="mt-2 rounded-xl bg-green-600 text-white p-2 shadow-sm flex justify-evenly "
      >
        <h3 className="ml-2 w-1/3 text-bold">Index</h3>
        <p className="w-1/3 text-bold">Tema</p>
        <p className="mr-2 w-1/3 text-bold text-right">Estado</p>
      </div>
      {topics.map((topic: string, index: number) => (
        <Card key={index} title={`${index + 1}`} value={topic} type={index % 3 === 0 ? 'Pendiente' : index % 3 === 1 ? 'En proceso' : 'Completado'} />
      ))}
    </>
  );
}