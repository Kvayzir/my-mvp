"use client";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Chat from "@/app/ui/demo/chat";
import Notebook from "@/app/ui/demo/notebook";

export default function Page() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  function makeid(length: number): string {
    let result = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
  const [user_id] = useState(makeid(8)); // Example user ID, replace with actual logic if needed
  console.log("User ID:", user_id);
  return (
    <main className="flex flex-col md:flex-row h-screen">
      <Chat title="Test" user_id={user_id} topic={topic}/>
      <Notebook />
    </main>
  );
}