'use client';

import { useEffect, useRef, Suspense } from 'react';
import ChatMessageBubble from './ChatMessageBubble';
import { MessageSkeleton } from '@/app/components/ui/skeletons'; // Assuming this path is correct
import { ChatMessage, JourneyState } from '@/app/lib/types';

interface ChatViewerProps {
    messages: ChatMessage[];
    onUpdateMessage: (id: number, newText: string) => void; // Modified to pass ID
    onUpdateState: (state: JourneyState) => void;
}

export default function ChatViewer({ messages, onUpdateMessage, onUpdateState }: ChatViewerProps) {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll to the bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    return (
        <div className="p-4 bg-white shadow-md rounded-lg mb-4 flex-1 overflow-y-auto flex flex-col">
            <div className="space-y-3 flex-grow flex flex-col justify-end"> {/* Use flex-grow and justify-end */}
                {messages.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                        No hay mensajes aún. ¡Empieza a chatear!
                    </div>
                ) : (
                    messages.map((message) => (
                        <Suspense key={message.id} fallback={<MessageSkeleton />}>
                            <ChatMessageBubble 
                                chatMessage={message} 
                                onUpdateMessage={onUpdateMessage}
                                onUpdateState={onUpdateState} 
                            />
                        </Suspense>
                    ))
                )}
                <div ref={messagesEndRef} /> {/* Scroll target */}
            </div>
        </div>
    );
}