import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello! I am Luis's Gemini-powered assistant. I can detail his 25+ years of leadership and Big Data expertise. What would you like to explore?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize the Gemini Client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // Validation Check
        if (!apiKey || apiKey === "" || apiKey.includes("VITE_GEMINI")) {
            setMessages(prev => [...prev,
            { role: 'user', content: input },
            { role: 'assistant', content: "Configuration Error: Gemini API Key missing in environment." }
            ]);
            return;
        }

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Setup the system instructions + the CV data context
            const prompt = `
                You are the professional AI assistant for Luis Madrigal Lobo. 
                Context: ${JSON.stringify(data)}
                
                Instructions:
                - Use the provided context to answer questions about Luis.
                - Be executive, concise, and professional.
                - Highlight his leadership of 75+ professionals and his Master's in Big Data.
                - Always respond in English.
                - User Question: ${input}
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: text
            }]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm currently optimizing my systems. Please try again or download Luis's CV above."
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
                {isLoading && <div className="loading-indicator">Processing trajectory...</div>}
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