'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Chat({title, user_id}: {title: string, user_id: string}) {
    // State to store all chat messages
    const [messages, setMessages] = useState<{ id: number; user: "user" | "bot"; text: string; timestamp: string }[]>([]);
    const hasInitialized = useRef(false);
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');
    
    // Function to add a new message
    const addMessage = (text: string, sender: "user" | "bot") => {
        const newMessage = {
            id: Date.now(), // Simple ID generation
            user: sender,
            text: text,
            timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    useEffect(() => {
        const initializeChat = async () => {
            // Check and set flag in one operation
            if (hasInitialized.current) return;
            hasInitialized.current = true;
            
            try {
                const response = await fetch('http://localhost:8000/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: `Eres un assistente de profesor de secundaria cuyo objetivo es ayudar a los alummnos a aprender. Para ello, deberás motivarlos a que se interesen en el tema, y dejarles una pregunta al final de cada mensaje tuyo. Por ejemplo, en vez de terminar dicendo "La importancia de la investigación es ...", pregunta "¿Cuáles crees que son los beneficios de la investigación?". Sé breve, sintetiza tu respuesta en 40 palabras o menos, usa tres oraciones por respuesta: la primera para contextualizar, la segunda para motivar, y la tercera para preguntar. En esta oportunidad, introduce el tema de ${topic || 'Introducción a la investigación'}.`,
                        user_id: user_id,
                        theme: topic || 'default' // Default to 'general' if no topic
                    })
                });
                
                const data = await response.json();
                addMessage(data.response, 'bot');
                console.log('Chat initialized:', data);
            } catch (error) {
                console.error('Error initializing chat:', error);
                addMessage(`Welcome to the chat about ${topic}!`, 'bot');
            }
        };

        initializeChat();
    });

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <Viewer messages={messages} />
            <Input onSendMessage={addMessage} user_id={user_id} />
        </div>
    );
}

function Viewer({messages}: { messages: { id: number; user: "user" | "bot"; text: string; timestamp: string }[] }) {
    return (
        <div className="p-4 bg-white shadow-md rounded-lg mb-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            <div className="space-y-3">
                {messages.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                        No messages yet. Start chatting!
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className="p-3 bg-gray-100 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <strong className="text-blue-600">{message.user}:</strong>
                                    <span className="ml-2 text-gray-800">{message.text}</span>
                                </div>
                                <span className="text-xs text-gray-500">{message.timestamp}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function Input({onSendMessage, user_id}: { onSendMessage: (text: string, user: "user" | "bot") => void, user_id: string }) {
    // State for the current input value
    const [inputText, setInputText] = useState('');
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');

    const handleSend = async () => {
    if (inputText.trim()) {
        // Add user message immediately
        onSendMessage(inputText, 'user');
        setInputText('');
        try {
            // Send to backend
            const response = await fetch('http://localhost:8000/chat', { //   https://my-mvp-production-4b5f.up.railway.app/chat
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputText,
                    user_id: user_id,
                    theme: topic || 'default'
                })
            });
            
            const data = await response.json();
            
            // Add bot response
            onSendMessage(data.response, 'bot');
            
        } catch (error) {
            console.error('Error:', error);
            onSendMessage('Sorry, I had trouble responding. Please try again.', 'bot');
        }
    }
};

    // Handle Enter key press
    const handleKeyPress = (e: { key: string; }) => {
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
                onChange={(e) => setInputText(e.target.value)} // This was missing!
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