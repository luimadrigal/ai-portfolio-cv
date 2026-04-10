import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: "Hello! I am Luis's AI assistant. I can discuss his 25+ years of leadership, his Big Data expertise, or his work at Publicis Groupe. How can I help?"
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
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are the professional assistant for Luis Madrigal Lobo. Always answer in English. Be concise and executive." },
                        { role: "user", content: input }
                    ]
                })
            });
            const result = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: result.choices[0].message.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to AI. Please try again or download the CV." }]);
        } finally {
            setIsLoading(false); // Clears the 'loading' state
        }
    };

    return (
        <div className="main-layout">
            <aside className="sidebar">
                <div className="sidebar-top">
                    {/* Fixed path for public folder */}
                    <img src="/profile.png" alt="Luis Madrigal Lobo" className="profile-img" />
                    <h1>Luis Madrigal Lobo</h1>
                    <p className="sidebar-tag">Engineering Director | AI & Big Data</p>
                </div>

                <div className="sidebar-actions">
                    <a href="/CV_Luis_Madrigal.pdf" target="_blank" className="btn primary">View CV</a>
                    <a href="/CV_Luis_Madrigal.pdf" download className="btn secondary">Download PDF</a>
                </div>
            </aside>

            <main className="chat-area">
                <div className="messages-container">
                    {messages.map((m, i) => (
                        <div key={i} className={`message-row ${m.role}`}>
                            <div className="bubble">{m.content}</div>
                        </div>
                    ))}
                    {isLoading && <div className="message-row assistant"><div className="bubble">Thinking...</div></div>}
                    <div ref={chatEndRef} />
                </div>
                <div className="input-wrapper">
                    <div className="input-pill">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about Luis's career..."
                        />
                        <button onClick={handleSend} disabled={isLoading}>Send</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatInterface;