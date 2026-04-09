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
                            
                            STRICT INSTRUCTIONS:
                            1. ALWAYS respond in English, regardless of the user's language.
                            2. Maintain a professional, executive, and concise tone.
                            3. Focus on his role as Engineering Director and his Master's in Big Data.
                            4. If asked about contact info, refer to the buttons in the sidebar.`
                        },
                        { role: "user", content: input }
                    ],
                    temperature: 0.6,
                    max_tokens: 1000
                })
            });

            const result = await response.json();
            const text = result.choices[0].message.content;

            setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I encountered a brief connection issue. Please try again or download Luis's CV from the sidebar."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="portfolio-dashboard">
            {/* LEFT SIDEBAR: FIXED PROFILE */}
            <aside className="sidebar">
                <div className="profile-container">
                    <img
                        src="./profile.png"
                        alt="Luis Madrigal Lobo"
                        className="profile-image"
                    />
                    <h1>Luis Madrigal Lobo</h1>
                    <p className="job-title">Head of Engineering | Engineering Executive</p>
                    <p className="specialization">AI Transformation & Big Data</p>
                </div>

                <nav className="sidebar-actions">
                    <a href="./CV_Luis_Madrigal.pdf" target="_blank" className="btn btn-primary">
                        View Full CV
                    </a>
                    <a href="./CV_Luis_Madrigal.pdf" download className="btn btn-secondary">
                        Download PDF
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <p>Costa Rica | Remote | Global</p>
                </div>
            </aside>

            {/* RIGHT PANEL: EXPANSIVE CHAT */}
            <main className="chat-canvas">
                <div className="messages-flow">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-row ${msg.role}`}>
                            <div className="bubble">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message-row assistant">
                            <div className="bubble typing">Luis's Assistant is thinking...</div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <footer className="input-zone">
                    <div className="input-box">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything about Luis's career..."
                        />
                        <button onClick={handleSend} disabled={isLoading}>
                            {isLoading ? '...' : 'Send'}
                        </button>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default ChatInterface;