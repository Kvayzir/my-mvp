'use client';

import { useUser } from '@/contexts/UserContext';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import ChatViewer from './ChatViewer';
import ChatInput from './ChatInput';
import { ChatMessage, ChatProps, JourneyState, ChatReplyRequest } from '@/app/lib/types';
import { fetchChatStart, patchChatConversation, fetchChatSimulate } from '@/app/lib/data';

const TOPIC_CONTENT_MAP = {
    "Ciudad": "city",
    "microscopio": "travel",
    "core": "mission",
    "energy": "energia",
    "sustances": "organelos",
    "citoesqueleto": "citoesqueleto",
    "nucleo": "nucleo"
}

export default function ChatContainer(props: ChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const hasInitialized = useRef(false);
    const previousLevel = useRef<string | null>(null);
    const messageIdCounter = useRef(0);
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');
    const { userId } = useUser();

    // Function to add a new message to the chat
    const addMessage = useCallback((text: string, sender: "user" | "bot" | "system", parsed: boolean = true) => {
        messageIdCounter.current += 1;
        const newMessage: ChatMessage = {
            id: messageIdCounter.current,
            user_id: userId || "anonymous", // Fallback for userId
            user_type: sender,
            text: text,
            parsed: parsed,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    }, [userId]); // Dependencies for useCallback

    const handleStateChange = useCallback((state: JourneyState) => {
        props.onSetChatState(state);
        if (state === "complete") {
            // Optionally, you can handle completion state here
            console.log('Chat completed');
        }
    }, [props]);

    // Function to update the last message (used by Message component after fetching)
    const updateLastMessage = useCallback((id: number, newText: string) => {
        setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg =>
                msg.id === id ? { ...msg, text: newText, parsed: true } : msg
            );
            return updatedMessages;
        });
    }, []); // No external dependencies

    // Effect for initial chat message when component mounts
    useEffect(() => {
        const initializeChat = async () => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;
            const request = {
                user_id: userId || "anonymous", // Ensure userId is always defined
                topic: topic || 'Introducción a la investigación' // Fallback for topic
            };
            if (props.contentList) {
                const initialMessage = await fetchChatSimulate({user_id: request.user_id, topic: request.topic, contentList: props.contentList});
                console.log('Initial simulation message:', initialMessage);
                addMessage(initialMessage.response, 'bot', true);
                return;
            }
            const initialMessages = await fetchChatStart(request);
            console.log('Initial chat messages:', initialMessages);
            if (initialMessages.messages && initialMessages.messages.length > 0) {
                initialMessages.messages.forEach((msg: {content: string, sender: "user" | "bot", timestamp: number}) => {
                    addMessage(msg.content, msg.sender, true);
                });
            } else {
                addMessage(`Welcome to the chat about ${request.topic}!`, 'bot', true); // Fallback message
            }
            // const initialPrompt = `Eres un assistente de profesor de secundaria cuyo objetivo es ayudar a los alumnos a aprender. Para ello, deberás motivarlos a que se interesen en el tema, y dejarles una pregunta al final de cada mensaje tuyo. Por ejemplo, en vez de terminar diciendo "La importancia de la investigación es ...", pregunta "¿Cuáles crees que son los beneficios de la investigación?". Sé breve, sintetiza tu respuesta en 40 palabras o menos, usa tres oraciones por respuesta: la primera para contextualizar, la segunda para motivar, y la tercera para preguntar. En esta oportunidad, introduce el tema de ${topic || 'Introducción a la investigación'}.`;
            // addMessage(initialPrompt, 'bot', false); // Mark as not parsed yet, will trigger fetch in MessageBubble
        };
        initializeChat();
    }, [topic, addMessage, userId]); // Re-run if topic changes

    // Effect for handling level changes
    useEffect(() => {
        // Skip if chat hasn't been initialized yet or if this is the initial level
        if (!hasInitialized.current) return;

        // Initialize previousLevel on first run after chat initialization
        if (previousLevel.current === null) {
            previousLevel.current = props.level;
            return;
        }
        
        // Only proceed if the level actually changed
        if (previousLevel.current !== props.level) {

            const handleLevelChange = async () => {
                const currentTopicContent = TOPIC_CONTENT_MAP[props.level as keyof typeof TOPIC_CONTENT_MAP];

                // Add system message and immediately process it to get a reply
                messageIdCounter.current += 1;
                const systemMessage: ChatMessage = {
                    id: messageIdCounter.current,
                    user_id: userId || 'anonymous',
                    user_type: 'system',
                    text: currentTopicContent,
                    parsed: true,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                
                const request: ChatReplyRequest = {
                    id: systemMessage.id,
                    user_id: userId || "anonymous",
                    topic: topic || 'Introducción a la investigación',
                    msg: currentTopicContent
                };

                // Patch conversation on the backend and get the reply from the bot
                try {
                    const reply = await patchChatConversation(request, currentTopicContent);
                    const botReplyText = reply.message;
                    
                    setMessages(prevMessages => [...prevMessages, systemMessage]);
                    addMessage(botReplyText, 'bot', true); // Add the bot's reply directly
                } catch (error) {
                    console.error("Error processing system message:", error);
                    // Add an error message to the chat if patching fails
                    setMessages(prevMessages => [...prevMessages, systemMessage]);
                    addMessage("Error processing the system message", 'system', true);
                }

                previousLevel.current = props.level;
            };
            handleLevelChange();
        }
    }, [props.level, topic, addMessage, userId]); // Dependencies for useEffect

    return (
        <div className="max-w-2xl mx-auto p-4 flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4">{props.title}</h2>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Nivel Actual: {props.level || 'No Seleccionado'}</h3>
            
            <ChatViewer 
                messages={messages} 
                onUpdateMessage={updateLastMessage} 
                onUpdateState={handleStateChange}
                onAddMessage={addMessage} 
            />
            <ChatInput onSendMessage={addMessage} />
        </div>
    );
}