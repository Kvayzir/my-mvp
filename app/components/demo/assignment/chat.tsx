'use client';
import { useUser } from '@/contexts/UserContext';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Suspense } from 'react';
import { fetchChatReply } from '@/app/lib/data';
import { MessageSkeleton } from '@/app/components/ui/skeletons';
import { ChatMessage, ChatProps, ChatReplyRequest } from '@/app/lib/types';

const CONTENT = {
    "Ciudad": "Imagina una ciudad en miniatura: hay una planta eléctrica (mitocondria), una oficina de correos (aparato de Golgi), fábricas (ribosomas), centros de reciclaje (lisosomas), calles (citoplasma) y, por supuesto, un ayuntamiento con los planos de construcción: el núcleo.",
    "Secret": "Imaginen que están diseñando una base secreta en un videojuego. Necesitan un lugar donde se tomen decisiones (núcleo), máquinas que fabriquen cosas (ribosomas, RER), almacenes (vacuolas) y generadores de energía (mitocondrias). ¿Qué tan eficiente sería tu base? Vamos a descubrir cómo lo hace la naturaleza.",
    "microscopio": "Hoy haremos un viaje microscópico dentro de una célula. Prepárate para flotar por el citoplasma, explorar estructuras llenas de energía y llegar al lugar más protegido de todos: el núcleo, donde se guardan los secretos de la vida.",
    "core": "Cuando se mira una imagen de la célula, el núcleo es una de las partes más evidentes. Está en el centro de la célula, y contiene todos los cromosomas de la misma, los cuales codifican el material genético. Es, por lo tanto, una parte a proteger, es realmente importante para la célula. El núcleo tiene una membrana que lo rodea y que mantiene todos los cromosomas en el interior; y separa los cromosomas del interior del núcleo y el resto de los orgánulos y componentes de la célula que se quedan fuera. Algunas cosas, como el ARN, necesitan circular entre el núcleo y el citoplasma. Para ello, hay poros en esta envoltura nuclear que permiten que las moléculas entren y salgan del núcleo. Antes se pensaba que la membrana nuclear sólo permitía la salida de las moléculas, pero ahora se sabe que también hay un proceso activo para introducir moléculas en el núcleo",
    "energy": "Aquí hablamos de mitocondrias, cloroplastos, lisosomas, y vacuolas",
    "sustances": "Ribosomas, RER, REL, aparato de Golgi",
    "citoesqueleto": "Citoesqueleto: microfilamentos, filamentos intermedios y microtúbulos. Estos son los componentes que dan forma a la célula, como si fueran los huesos y músculos de un cuerpo.",
    "nucleo": "Forma, adn, genes, partes..."
}

export default function Chat(props: ChatProps) {
    // State to store all chat messages
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const hasInitialized = useRef(false);
    const previousLevel = useRef<string | null>(null);
    const messageIdCounter = useRef(0);
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');
    const { userId } = useUser();
    
    // Function to add a new message
    const addMessage = (text: string, sender: "user" | "bot" | "system", parsed: boolean = true) => {
        messageIdCounter.current += 1;
        const newMessage = {
            id: messageIdCounter.current, // Simple ID generation
            user_id: userId || "", // Ensure userId is always defined
            user_type: sender,
            text: text,
            parsed: parsed, // fetch if false
            timestamp: new Date().toLocaleTimeString()
        };
        if (text ==='continue') {
            alert('Progression made');
            props.onSetChatState('in progress');
        }
        if (text ==='end') {
            alert('Goal on sight made');
            props.onSetChatState('end');
        }
        if (text ==='start') {
            alert('Initialization made');
            props.onSetChatState('start');
        }
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const updateLastMessage = async (text: string) => {
        setMessages(prevMessages => {
            if (prevMessages.length === 0) return prevMessages;
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage) {
                lastMessage.parsed = true;
                lastMessage.text = text;
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
    }, []);

    useEffect(() => {
        // Skip if chat hasn't been initialized yet or if this is the initial level
        if (!hasInitialized.current) return;

        if (previousLevel.current === null) {
            previousLevel.current = props.level;
            return;
        }
        
        // Only proceed if the level actually changed
        if (previousLevel.current !== props.level) {
            const handleLevelChange = async () => {
                addMessage(`Contenido:\n ${CONTENT[props.level as keyof typeof CONTENT]}`, 'system', true);
                const msg = `Ahora vamos a cambiar el nivel de dificultad a ${props.level}. Ajusta tu siguiente respuesta al nivel ${props.level} y continúa motivando al estudiante. Haz una pregunta apropiada para este nuevo nivel sobre el tema ${topic || 'Introducción a la investigación'}.`;
                addMessage(msg, 'bot', false);
            };
            
            handleLevelChange();
            previousLevel.current = props.level; // Update the previous level
        }
    }, [props.level]);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-semibold mb-4">{props.title}</h2>
            <h3 className="text-xl font-semibold mb-4">{props.level}</h3>
            <Viewer messages={messages} onUpdateMessage={updateLastMessage} />
            <Input onSendMessage={addMessage} />
        </div>
    );
}

function Viewer({messages, onUpdateMessage}: { messages: ChatMessage[], onUpdateMessage: (text: string) => void }) {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll to the bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    return (
        <div className="p-4 bg-white shadow-md rounded-lg mb-4 h-[500px] overflow-y-auto">
            <div className="space-y-3">
                {messages.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                        No messages yet. Start chatting!
                    </div>
                ) : (
                    messages.map((message) => (
                        <Suspense key={message.id} fallback={<MessageSkeleton />}>
                            <Message 
                                chatMessage={message} 
                                onUpdateMessage={onUpdateMessage} 
                            />
                        </Suspense>
                    ))
                )}
                <div ref={messagesEndRef} /> {/* Scroll target */}
            </div>
        </div>
    );
}

function Message({chatMessage, onUpdateMessage}: {chatMessage: ChatMessage, onUpdateMessage: (text: string) => void}) {
    const [isLoading, setIsLoading] = useState(!chatMessage.parsed);
    const [counter, setCounter] = useState(0);
    const [content, setContent] = useState(chatMessage.parsed ? chatMessage.text : '');
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');
    const { userId } = useUser();

    useEffect(() => {
        const fetchReply = async () => {
            if (chatMessage.user_type === 'system'){
                console.log('System message, skipping reply fetch');
                return;
            }
            if (chatMessage.parsed || chatMessage.user_type !== 'bot') {
                return;
            }
            setIsLoading(true);
            try {
                const request = {
                    id: chatMessage.id, 
                    user_id: userId, 
                    topic, 
                    msg: chatMessage.text 
                } as ChatReplyRequest;
                const reply = await fetchChatReply(request);
                setCounter(prev => prev + 1);
                onUpdateMessage(reply);
                setContent(reply);
            } catch (error) {
                setContent('Error loading message...'+error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReply();
    }, [chatMessage, topic, onUpdateMessage, userId]);

    if (isLoading) {
        return <MessageSkeleton />;
    }
    // Determine message bubble styling based on sender
    const createMessageBubble = () => {
        if (chatMessage.user_type === 'system') {
            return (
                <div className="p-1 bg-yellow-100 text-yellow-800 rounded-lg shadow-sm">
                    <p className="ml-2 text-center italic">{content}</p>
                </div>
            );
        }
        const isUser = chatMessage.user_type === 'user';
        const messageClasses = `p-3 rounded-xl shadow-sm max-w-[80%] ${
            isUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'
        }`;
        const containerClasses = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
        return (
            <div className={containerClasses}>
            <div className={messageClasses}>
                <div className="flex justify-between items-start">
                    <div>
                        <strong className="text-sm font-semibold capitalize">{isUser ? userId : "Bot"}:</strong>
                        <span className="ml-2 text-base">{content}</span>
                    </div>
                </div>
                <div className="text-right text-xs mt-1 opacity-75">
                    {chatMessage.timestamp}
                    <span className="ml-2 text-base">{counter}</span>
                </div>
            </div>
        </div>
        );
    }
    

    return (
        <>
            {createMessageBubble()}
        </>
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