"use client";
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ChatContainer from "@/app/components/demo/assignment/chat/ChatContainer";
import Notebook from "@/app/components/ui/notebook/notebook";
import { JourneyState } from '@/app/lib/types';

export default function Page() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const [level, setLevel] = useState('');
  const [chatState, setChatState] = useState<JourneyState>('start');

  return (
    <main className="flex flex-col md:flex-row h-4/5">
        <ChatContainer title={"" + topic} onSetChatState={setChatState} level={level} />
        <Notebook onSetLevel={setLevel} state={chatState} />
    </main>
  );
}
