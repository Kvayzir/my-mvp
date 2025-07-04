"use client";
import { useSearchParams } from 'next/navigation';
import Chat from "@/app/components/demo/assignment/chat";
import Notebook from "@/app/components/ui/notebook/notebook";

export default function Page() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  return (
    <main className="flex flex-col md:flex-row h-4/5">
        <Chat title={"" + topic} />
      <Notebook />
    </main>
  );
}