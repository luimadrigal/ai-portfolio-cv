import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hola, soy el asistente IA de Luis. Puedo hablarte sobre su liderazgo de más de 75 profesionales, su maestría en Big Data o su experiencia en Publicis Groupe. ¿Qué te gustaría saber?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-scroll al último mensaje
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
    });

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `Eres el asistente profesional de Luis Madrigal Lobo. 
            Responde basado en estos datos: ${JSON.stringify(data)}. 
            Sé ejecutivo, breve y destaca su liderazgo global y visión técnica.`
                    },
                    ...messages,
                    userMessage
                ],
            });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.choices[0].message.content
            }]);
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Lo siento, tuve un problema de conexión. Pero puedo confirmarte que Luis es experto en AI y Big Data."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-interface">
            <div className="messages-container">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-wrapper ${msg.role}`}>
                        <div className="message-bubble">
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="loading-indicator">Analizando trayectoria...</div>}
                <div ref={chatEndRef} />
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Pregúntame sobre la experiencia de Luis..."
                />
                <button onClick={handleSend} disabled={isLoading}>
                    {isLoading ? '...' : 'Enviar'}
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;