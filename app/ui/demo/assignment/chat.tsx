'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Suspense } from 'react';
import { fetchChatReply } from '@/app/lib/data';
import { MessageSkeleton } from '@/app/ui/demo/skeletons';

export default function Chat({title, user_id}: {title: string, user_id: string}) {
    // State to store all chat messages
    const [messages, setMessages] = useState<{ id: number; user: "user" | "bot"; text: string; parsed: boolean; timestamp: string }[]>([]);
    const hasInitialized = useRef(false);
    const messageIdCounter = useRef(0);
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');
    
    // Function to add a new message
    const addMessage = (text: string, sender: "user" | "bot", parsed: boolean = true) => {
        messageIdCounter.current += 1;
        const newMessage = {
            id: messageIdCounter.current, // Simple ID generation
            user: sender,
            text: text,
            parsed: parsed, // fetch if false
            timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const updateLastMessage = (text: string) => {
        setMessages(prevMessages => {
            if (prevMessages.length === 0) return prevMessages;
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage) {
                lastMessage.text = text;
                lastMessage.parsed = true;
            }
            return updatedMessages;
        });
    };

    useEffect(() => {
        const initializeChat = async () => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;
            const msg = `Eres un assistente de profesor de secundaria cuyo objetivo es ayudar a los alummnos a aprender. Para ello, deberás motivarlos a que se interesen en el tema, y dejarles una pregunta al final de cada mensaje tuyo. Por ejemplo, en vez de terminar dicendo "La importancia de la investigación es ...", pregunta "¿Cuáles crees que son los beneficios de la investigación?". Sé breve, sintetiza tu respuesta en 40 palabras o menos, usa tres oraciones por respuesta: la primera para contextualizar, la segunda para motivar, y la tercera para preguntar. En esta oportunidad, introduce el tema de ${topic || 'Introducción a la investigación'}.`;
            addMessage(msg, 'bot', false);      
        };
        initializeChat();
    }); // Added dependency array

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <Viewer user_id={user_id} messages={messages} onUpdateMessage={updateLastMessage} />
            <Input onSendMessage={addMessage} />
        </div>
    );
}

function Viewer({user_id, messages, onUpdateMessage}: { user_id: string, messages: { id: number; user: "user" | "bot"; parsed: boolean; text: string; timestamp: string }[], onUpdateMessage: (text: string) => void }) {
    return (
        <div className="p-4 bg-white shadow-md rounded-lg mb-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            <div className="space-y-3">
                {messages.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                        No messages yet. Start chatting!
                    </div>
                ) : (
                    messages.map((message) => (
                        <Suspense key={message.id} fallback={<MessageSkeleton />}>
                            <Message 
                                text={message.text} 
                                user={message.user} 
                                user_id={user_id} 
                                parsed={message.parsed} 
                                timestamp={message.timestamp} 
                                onUpdateMessage={onUpdateMessage} 
                            />
                        </Suspense>
                    ))
                )}
            </div>
        </div>
    );
}

function Message({text, user, user_id, parsed, timestamp, onUpdateMessage}: {text: string, user: "user" | "bot", user_id: string, parsed: boolean, timestamp: string, onUpdateMessage: (text: string) => void}) {
    const [isLoading, setIsLoading] = useState(!parsed);
    const [content, setContent] = useState(parsed ? text : '');
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');

    useEffect(() => {
        const fetchReply = async () => {
            if (!parsed && user === 'bot') {
                setIsLoading(true);
                try {
                    const reply = await fetchChatReply({ user_id, topic, msg: text });
                    setContent(reply);
                    onUpdateMessage(reply);
                    console.log('Updated message:', reply);
                } catch (error) {
                    console.error('Error fetching reply:', error);
                    setContent('Error loading message...');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchReply();
    }, [parsed, user, text, user_id, topic, onUpdateMessage]);

    if (isLoading) {
        return <MessageSkeleton />;
    }

    return (
        <div className="p-3 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-start">
                <div>
                    <strong className="text-blue-600">{user}:</strong>
                    <span className="ml-2 text-gray-800">{content || text}</span>
                </div>
                <span className="text-xs text-gray-500">{timestamp}</span>
            </div>
        </div>
    );
}

function Input({onSendMessage}: { onSendMessage: (text: string, user: "user" | "bot", parsed: boolean) => void}) {
    const [inputText, setInputText] = useState('');

    const handleSend = async () => {
        if (inputText.trim()) {
            const userMessage = inputText.trim();
            // Add user message immediately
            onSendMessage(userMessage, 'user', true);
            setInputText('');
            // Add bot reply placeholder that will be fetched
            onSendMessage(userMessage, 'bot', false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="flex gap-2">
            <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <button 
                type="button" 
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" 
                onClick={handleSend}
                disabled={!inputText.trim()}
            >
                Send
            </button>
        </div>
    );
}