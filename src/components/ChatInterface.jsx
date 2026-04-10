import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import profileImg from '../assets/profile.jpg';

const ChatInterface = ({ data, pdfPath }) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: `Hello! I am ${data?.personal_info?.name || "Luis"}'s AI assistant. I can discuss his extensive background in Engineering Leadership or Big Data expertise. How can I help?`
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
                        { role: "system", content: "You are the professional assistant for Luis Madrigal Lobo. Answer in English only." },
                        { role: "user", content: input }
                    ]
                })
            });
            if (!response.ok) throw new Error("API Error");
            const result = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: result.choices[0].message.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection issue. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-layout">
            <aside className="chat-sidebar glass">
                <div className="profile-section">
                    <img src={profileImg} alt={data?.personal_info?.name || "Luis"} className="profile-avatar" />
                    <h1>{data?.personal_info?.name || "Luis Madrigal Lobo"}</h1>
                    <h2 className="profile-role">{data?.personal_info?.title || "Engineering Director | AI & Big Data"}</h2>
                    {data?.education_certs?.[0] && (
                        <p className="profile-education">{data.education_certs[0]}</p>
                    )}
                </div>
                
                <div className="nav-actions">
                    <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        View Full CV
                    </a>
                    <a href={pdfPath} download="CV_Luis_Madrigal_Lobo.pdf" className="btn btn-outline">
                        Download PDF
                    </a>
                </div>
                
                <div className="sidebar-footer">
                    <p>Built with React + Vite + AI</p>
                </div>
            </aside>

            <main className="chat-main">
                <div className="message-list">
                    {messages.map((m, i) => (
                        <div key={i} className={`message-row ${m.role}`}>
                            <div className="message-bubble">{m.content}</div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message-row assistant">
                            <div className="message-bubble typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                
                <div className="input-area glass">
                    <div className="input-pill">
                        <input 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSend()} 
                            placeholder="Ask me about Luis's experience..." 
                        />
                        <button onClick={handleSend} disabled={isLoading} className="send-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatInterface;