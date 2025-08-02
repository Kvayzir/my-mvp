'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { fetchChatReply } from '@/app/lib/data'; // Ensure these are client-callable
import { MessageSkeleton } from '@/app/components/ui/skeletons';
import { ChatMessage, ChatReplyRequest, JourneyState } from '@/app/lib/types';

interface ChatMessageBubbleProps {
    chatMessage: ChatMessage;
    onUpdateMessage: (id: number, newText: string) => void; // Modified to pass ID
    onUpdateState: (state: JourneyState) => void;
    onAddMessage: (text: string, sender: "user" | "bot" | "system", parsed?: boolean) => void;
}

export default function ChatMessageBubble({ chatMessage, onUpdateMessage, onUpdateState, onAddMessage }: ChatMessageBubbleProps) {
    // isLoading is true if message is not parsed yet, meaning it needs fetching
    const [isLoading, setIsLoading] = useState(!chatMessage.parsed);
    const [content, setContent] = useState(chatMessage.parsed ? chatMessage.text : '');
    
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');
    const { userId } = useUser();

    useEffect(() => {
        const fetchAndProcessReply = async () => {
            // If message is already parsed or it's a user message, no fetch needed here
            if (chatMessage.parsed || chatMessage.user_type !== 'bot') {
                setIsLoading(false); // Ensure loading is false if no fetch is needed
                return;
            }

            setIsLoading(true);
            try {
                const request: ChatReplyRequest = {
                    id: chatMessage.id, 
                    user_id: userId || "anonymous", // Ensure userId is always defined
                    topic: topic || 'Introducción a la investigación', // Fallback for topic
                    msg: chatMessage.text // This is the prompt for the bot
                };

                const response = await fetchChatReply(request);
                const replyText = response.reply;
                if (response.complete) {
                    onUpdateState('end'); // Update journey state if conversation is complete
                }
                
                // Update the message in the parent state
                onUpdateMessage(chatMessage.id, replyText);
                // Update local state to display the fetched content
                setContent(replyText);

            } catch (error) {
                console.error("Error fetching or processing message:", error);
                setContent('Error cargando mensaje...');
                // Consider updating the parent message state with an error message too
                onUpdateMessage(chatMessage.id, 'Error cargando mensaje.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndProcessReply();
    }, [chatMessage.id, chatMessage.parsed, chatMessage.user_type, chatMessage.text, topic, userId, onUpdateMessage, onUpdateState, onAddMessage]); // Dependencies

    if (isLoading) {
        return <MessageSkeleton />;
    }

    // Determine message bubble styling based on sender
    const isUser = chatMessage.user_type === 'user';
    const isSystem = chatMessage.user_type === 'system';

    const messageClasses = `p-3 rounded-xl shadow-sm max-w-[80%] ${
        isUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'
    }`;
    const containerClasses = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

    if (isSystem) {
        return (
            <div className="flex justify-center w-full">
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded-lg shadow-sm max-w-[90%] text-center italic text-sm">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className={messageClasses}>
                <div className="flex flex-col"> {/* Changed to flex-col for better layout */}
                    <strong className="text-sm font-semibold capitalize">{isUser ? userId : "Bot"}:</strong>
                    <span className="mt-1 text-base">{content}</span> {/* Added margin-top */}
                </div>
                <div className="text-right text-xs mt-1 opacity-75">
                    {chatMessage.timestamp}
                </div>
            </div>
        </div>
    );
}