'use client';

import { useState } from 'react';

export default function Chat({title}: {title: string}) {
    // State to store all chat messages
    const [messages, setMessages] = useState<{ id: number; user: "user" | "bot"; text: string; timestamp: string }[]>([]);
    
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

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <Viewer messages={messages} />
            <Input onSendMessage={addMessage} />
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

function Input({onSendMessage}: { onSendMessage: (text: string, user: "user" | "bot") => void }) {
    // State for the current input value
    const [inputText, setInputText] = useState('');

    const handleSend = async () => {
    if (inputText.trim()) {
        // Add user message immediately
        onSendMessage(inputText, 'user');
        
        try {
            // Send to backend
            const response = await fetch('https://my-mvp-production.up.railway.app/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputText,
                    user_id: 'user123' // optional
                })
            });
            
            const data = await response.json();
            
            // Add bot response
            onSendMessage(data.response, 'bot');
            
        } catch (error) {
            console.error('Error:', error);
            onSendMessage('Sorry, I had trouble responding. Please try again.', 'bot');
        }
        
        setInputText('');
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