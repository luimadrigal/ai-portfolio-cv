import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: "Hello! I am Luis's executive AI assistant. How can I help you today?"
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are the professional assistant for Luis Madrigal Lobo. Answer in English only." },
                        { role: "user", content: input }
                    ]
                })
            });

            if (!response.ok) throw new Error("API_ERROR");

            const result = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: result.choices[0].message.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please try again later." }]);
        } finally {
            // Este bloque asegura que el looping se detenga siempre
            setIsLoading(false);
        }
    };

    return (
        <div className="main-viewport">
            <aside className="side-panel">
                <div className="id-card">
                    <img src="/profile.png" alt="Luis" className="pfp" />
                    <h1>Luis Madrigal Lobo</h1>
                    <p>Engineering Director | AI & Big Data</p>
                </div>
                <div className="nav-stack">
                    <a href="/CV_Luis_Madrigal.pdf" target="_blank" className="nav-link primary">View CV</a>
                    <a href="/CV_Luis_Madrigal.pdf" download className="nav-link secondary">Download PDF</a>
                </div>
            </aside>

            <main className="chat-canvas">
                <div className="chat-stream">
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-row ${m.role}`}>
                            <div className="bubble">{m.content}</div>
                        </div>
                    ))}
                    {isLoading && <div className="chat-row assistant"><div className="bubble">Thinking...</div></div>}
                    <div ref={chatEndRef} />
                </div>
                <div className="input-footer">
                    <div className="input-bar">
                        <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask me anything..." />
                        <button onClick={handleSend} disabled={isLoading}>Send</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatInterface;