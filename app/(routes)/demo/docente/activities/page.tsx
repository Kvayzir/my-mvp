import CardWrapper from '@/app/components/ui/cards-teachers/cardWrapper';
import AddTopicButton from '@/app/components/ui/buttons/add-topic-button';

export default function Page() {
  return (
    <main className="h-4/5">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Actividades</h1>
        <AddTopicButton />
      </div>
      <CardWrapper />
    </main>
  );
}