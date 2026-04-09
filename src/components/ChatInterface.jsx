import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello! I am Luis's AI assistant. I can tell you about his leadership of 75+ professionals, his Master's in Big Data, or his strategic impact at Publicis Groupe. What would you like to know?`
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

        // Fail-fast validation
        if (!apiKey || apiKey === "" || apiKey.includes("VITE_GEMINI")) {
            setMessages(prev => [...prev,
            { role: 'user', content: input },
            { role: 'assistant', content: "Configuration Error: API Key missing in environment." }
            ]);
            return;
        }

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Force stable v1 and use the '-latest' suffix to resolve mapping issues
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel(
                { model: "gemini-1.5-flash" },
                { apiVersion: "v1" } // Esto obliga a usar el endpoint que sí existe
            );

            const prompt = `
                You are the professional AI assistant for Luis Madrigal Lobo. 
                Base your answers strictly on this data: ${JSON.stringify(data)}. 
                Highlight his 25+ years of experience and Master's in Big Data.
                Respond concisely in English.
                User: ${input}
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (error) {
            console.error("Gemini Critical Error:", error);

            let displayError = "I encountered a connection issue. Luis's 25+ years of experience are worth the wait—please try again!";
            if (error.message.includes("404")) {
                displayError = "Service Discovery Error (404). Please ensure the API Key is from a new project in Google AI Studio.";
            }

            setMessages(prev => [...prev, { role: 'assistant', content: displayError }]);
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
                {isLoading && <div className="loading-indicator">Analyzing trajectory...</div>}
                <div ref={chatEndRef} />
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about Luis's experience..."
                />
                <button onClick={handleSend} disabled={isLoading}>Send</button>
            </div>
        </div>
    );
};

export default ChatInterface;