import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    // Environment variable for Groq API Key
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

    // Auto-scroll to latest message
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
                            STRICT RULE: ALWAYS respond in English. Maintain a professional tone.`
                        },
                        { role: "user", content: input }
                    ],
                    temperature: 0.6
                })
            });

            if (!response.ok) throw new Error('Groq API Error');

            const result = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: result.choices[0].message.content }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection issue. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="portfolio-dashboard">
            {/* PANEL IZQUIERDO: PROFILE FIXED */}
            <aside className="fixed-sidebar">
                <div className="profile-wrapper">
                    {/* FIXED PATH: Removed dot to ensure absolute public access */}
                    <img
                        src="/profile.png"
                        alt="Luis Madrigal Lobo"
                        className="sidebar-img"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} // Fallback if image still misses
                    />
                    <h1>Luis Madrigal Lobo</h1>
                    <p className="job-title">Head of Engineering | AI & Big Data</p>
                </div>

                <nav className="sidebar-actions">
                    {/* FIXED PATHS: Absolute paths for PDF access */}
                    <a href="/CV_Luis_Madrigal.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-view-cv">
                        View Full CV
                    </a>
                    <a href="/CV_Luis_Madrigal.pdf" download="Luis_Madrigal_CV.pdf" className="btn btn-download-cv">
                        Download PDF
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <p>Costa Rica | Remote | Global</p>
                </div>
            </aside>

            {/* PANEL DERECHO: CHAT EXPANSIVE */}
            <main className="chat-canvas">
                <div className="messages-flow">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-row ${msg.role}`}>
                            <div className="bubble">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="message-row assistant"><div className="bubble">Thinking...</div></div>}
                    <div ref={chatEndRef} />
                </div>

                <footer className="input-zone">
                    <div className="input-pill">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about Luis's experience..."
                        />
                        <button onClick={handleSend} disabled={isLoading}>
                            Send
                        </button>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default ChatInterface;