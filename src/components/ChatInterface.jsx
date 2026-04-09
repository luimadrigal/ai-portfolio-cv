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
                            content: `You are the executive professional assistant for Luis Madrigal Lobo. 
                            Context Data: ${JSON.stringify(data)}.
                            STRICT RULES: ALWAYS respond in English. Be concise, executive, and professional.`
                        },
                        { role: "user", content: input }
                    ],
                    temperature: 0.6
                })
            });

            const result = await response.json();
            const text = result.choices[0].message.content;
            setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection issue. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="portfolio-dashboard">
            <aside className="sidebar">
                <div className="profile-container">
                    {/* FIXED PATH: Removed the dot to use absolute public path */}
                    <img
                        src="/profile.png"
                        alt="Luis Madrigal Lobo"
                        className="profile-image"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                    />
                    <h1>Luis Madrigal Lobo</h1>
                    <p className="job-title">Head of Engineering | Engineering Executive</p>
                    <p className="specialization">AI Transformation & Big Data</p>
                </div>

                <nav className="sidebar-actions">
                    {/* FIXED PATHS: Absolute paths for PDF access */}
                    <a href="/CV_Luis_Madrigal.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        View Full CV
                    </a>
                    <a href="/CV_Luis_Madrigal.pdf" download="Luis_Madrigal_CV.pdf" className="btn btn-secondary">
                        Download PDF
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <p>Costa Rica | Remote | Global</p>
                </div>
            </aside>

            <main className="chat-canvas">
                <div className="messages-flow">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-row ${msg.role}`}>
                            <div className="bubble">{msg.content}</div>
                        </div>
                    ))}
                    {isLoading && <div className="message-row assistant"><div className="bubble">Thinking...</div></div>}
                    <div ref={chatEndRef} />
                </div>

                <footer className="input-zone">
                    <div className="input-box">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me about Luis's career..."
                        />
                        <button onClick={handleSend} disabled={isLoading}>Send</button>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default ChatInterface;