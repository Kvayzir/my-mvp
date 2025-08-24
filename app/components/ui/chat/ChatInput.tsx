'use client';

import { useState, useCallback } from 'react';
import React from 'react'; // Import React for React.KeyboardEvent

interface ChatInputProps {
    onSendMessage: (text: string, sender: "user" | "bot" | "system", parsed: boolean) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
    const [inputText, setInputText] = useState('');

    const handleSend = useCallback(() => {
        if (inputText.trim()) {
            const userMessage = inputText.trim();
            // Add user message immediately
            onSendMessage(userMessage, 'user', true);
            setInputText('');
            // Add bot reply placeholder that will trigger fetch in ChatMessageBubble
            onSendMessage(userMessage, 'bot', false);
        }
    }, [inputText, onSendMessage]); // Dependencies for useCallback

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for new lines
            e.preventDefault(); // Prevent default Enter behavior (e.g., new line in textarea)
            handleSend();
        }
    }, [handleSend]); // Dependencies for useCallback

    return (
        <div className="flex gap-2 mt-4"> {/* Added margin-top */}
            <input
                type="text"
                placeholder="Escribe tu mensaje..."
                className="flex-1 p-3 text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <button 
                type="button" 
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors" 
                onClick={handleSend}
                disabled={!inputText.trim()}
            >
                Enviar
            </button>
        </div>
    );
}