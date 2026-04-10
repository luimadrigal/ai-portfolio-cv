import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I am Luis's AI assistant. I can discuss his 25+ years of leadership, his Big Data expertise, or his work at Publicis Groupe. How can I help?"
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

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true); // Starts the loading state

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
                            content: `You are the executive assistant for Luis Madrigal Lobo. 
                            Context: ${JSON.stringify(data)}.
                            STRICT RULE: ALWAYS respond in English. Be professional and concise.`
                        },
                        { role: "user", content: input }
                    ]
                })
            });

            if (!response.ok) throw new Error('API Request Failed');

            const result = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: result.choices[0].message.content }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again or download Luis's CV from the sidebar."
            }]);
        } finally {
            setIsLoading(false); // CRITICAL: This stops the "loading" state regardless of success or failure
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="profile-sidebar">
                <img src="/profile.png" alt="Luis Madrigal Lobo" className="sidebar-img" />
                <div className="sidebar-info">
                    <h1>Luis Madrigal Lobo</h1>
                    <p className="sidebar-tag">Head of Engineering | AI & Big Data</p>
                </div>

                <div className="sidebar-btns">
                    <a href="/CV_Luis_Madrigal.pdf" target="_blank" rel="noopener noreferrer" className="nav-btn primary">View CV</a>
                    <a href="/CV_Luis_Madrigal.pdf" download className="nav-btn secondary">Download PDF</a>
                </div>
            </aside>

            <main className="chat-canvas">
                <div className="chat-history">
                    {messages.map((msg, i) => (
                        <div key={i} className={`msg-row ${msg.role}`}>
                            <div className="msg-bubble">{msg.content}</div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="msg-row assistant">
                            <div className="msg-bubble loading-dots">Thinking...</div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="input-area">
                    <div className="input-pill">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about Luis's experience..."
                        />
                        <button onClick={handleSend} disabled={isLoading}>
                            {isLoading ? '...' : 'Send'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatInterface;