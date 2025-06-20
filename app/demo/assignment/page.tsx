"use client";
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Chat from "@/app/ui/demo/chat";
import Notebook from "@/app/ui/demo/notebook";

export default function Page() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const { userId } = useUser();

  return (
    <main className="flex flex-col md:flex-row h-4/5">
      <Chat title={"" + topic} user_id={userId || ""} topic={topic}/>
      <Notebook />
    </main>
  );
}