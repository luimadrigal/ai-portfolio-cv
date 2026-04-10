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
        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setInput('');

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are the professional assistant for Luis Madrigal Lobo. Answer in English. Be executive." },
                        { role: "user", content: input }
                    ]
                })
            });
            const result = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: result.choices[0].message.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="platform-shell">
            <aside className="platform-sidebar">
                <div className="sidebar-identity">
                    <img src="/profile.png" alt="Luis" className="avatar-main" />
                    <h1>Luis Madrigal Lobo</h1>
                    <p>Engineering Director | AI & Big Data</p>
                </div>

                <div className="sidebar-nav">
                    <a href="/CV_Luis_Madrigal.pdf" target="_blank" className="nav-item highlight">View CV</a>
                    <a href="/CV_Luis_Madrigal.pdf" download className="nav-item">Download PDF</a>
                </div>
            </aside>

            <main className="platform-chat">
                <div className="chat-window-flow">
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-line ${m.role}`}>
                            <div className="chat-bubble">{m.content}</div>
                        </div>
                    ))}
                    {isLoading && <div className="chat-line assistant"><div className="chat-bubble">Typing...</div></div>}
                    <div ref={chatEndRef} />
                </div>
                <div className="chat-input-container">
                    <div className="chat-input-pill">
                        <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask me about Luis's experience..." />
                        <button onClick={handleSend} disabled={isLoading}>Send</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatInterface;