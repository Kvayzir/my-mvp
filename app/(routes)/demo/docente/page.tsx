import CardWrapper from '@/app/components/ui/cards/cardWrapper';
import AddTopicButton from '../../../components/ui/buttons/add-topic-button';

export default function Page() {
  return (
    <main className="h-4/5">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Home</h1>
        <p className="text-gray-700">Administrador de tareas</p>
        <AddTopicButton />
      </div>
      <CardWrapper role="docente" />
    </main>
  );
}