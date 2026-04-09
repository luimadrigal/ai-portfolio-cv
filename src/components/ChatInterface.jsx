import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello! I am Luis's AI assistant. I'm ready to discuss his 25+ years of engineering leadership. How can I assist you?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Use the explicit v1 endpoint to prevent 404 routing errors
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
        { model: "gemini-1.5-flash" },
        { apiVersion: "v1" } // This is the crucial line
    );

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        if (!apiKey || apiKey === "" || apiKey.includes("VITE_GEMINI")) {
            setMessages(prev => [...prev,
            { role: 'user', content: input },
            { role: 'assistant', content: "Configuration Error: API Key missing." }
            ]);
            return;
        }

        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setInput('');
        setIsLoading(true);

        try {
            const prompt = `You are a professional assistant for Luis Madrigal Lobo, an Engineering Director. 
            Respond concisely based on this data: ${JSON.stringify(data)}. 
            Question: ${input}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (error) {
            console.error("Gemini Error:", error);

            // LOGIC FOR 404/NOT FOUND
            let errorMsg = "I'm having trouble connecting to the brain. Please check back soon or view Luis's CV!";
            if (error.message.includes("404")) {
                errorMsg = "Technical Note: The API endpoint returned a 404. Luis is likely updating the cloud permissions.";
            }

            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
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
                {isLoading && <div className="loading-indicator">Consulting the expert...</div>}
                <div ref={chatEndRef} />
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about Luis..."
                />
                <button onClick={handleSend} disabled={isLoading}>{isLoading ? '...' : 'Send'}</button>
            </div>
        </div>
    );
};

export default ChatInterface;