import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello! I am Luis's AI assistant. I can discuss his 25+ years of leadership, his Big Data expertise, or his strategic work at Publicis Groupe. How can I help?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        if (!apiKey || apiKey.includes("VITE_GROQ")) {
            setMessages(prev => [...prev,
            { role: 'user', content: input },
            { role: 'assistant', content: "Error: Groq API Key missing in environment." }
            ]);
            return;
        }

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: `You are a professional assistant for Luis Madrigal Lobo, a Software Engineering Director.
                            Context data about Luis: ${JSON.stringify(data)}
                            
                            Strict Instructions:
                            - Answer based ONLY on the provided context.
                            - Maintain an executive, professional tone.
                            - Highlight his leadership of 75+ professionals and his Master's in Big Data.
                            - Always respond in English.`
                        },
                        { role: "user", content: input }
                    ],
                    temperature: 0.5,
                    max_tokens: 500
                })
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const result = await response.json();
            const text = result.choices[0].message.content;

            setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (error) {
            console.error("Groq Fetch Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having a brief connection issue. Please try again or download Luis's CV above."
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
                        <div className="message-bubble">{msg.content}</div>
                    </div>
                ))}
                {isLoading && (
                    <div className="loading-indicator">
                        <div className="typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                        Processing expertise...
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about Luis's background..."
                />
                <button onClick={handleSend} disabled={isLoading}>
                    {isLoading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;