import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    // 1. Fetch the key from Vite's environment
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello! I am Luis's AI assistant. I can tell you about his leadership of 75+ professionals, his Master's in Big Data, or his strategic impact at Publicis Groupe. What would you like to know?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-scroll logic
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 2. Initialize OpenAI inside the component or a dedicated handler to ensure 
    // it uses the most current environment value.
    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // 3. Fail-fast validation: Check if the API key is valid before making the POST request
        if (!apiKey || apiKey === "" || apiKey.includes("VITE_OPENAI")) {
            setMessages(prev => [...prev,
            { role: 'user', content: input },
            {
                role: 'assistant',
                content: "Configuration Error: The OpenAI API Key is missing or incorrectly configured in the environment. Please check your GitHub Secrets."
            }
            ]);
            setInput('');
            return;
        }

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are the professional AI assistant for Luis Madrigal Lobo. 
            Base your answers strictly on this data: ${JSON.stringify(data)}. 
            Be executive, concise, and highlight his global leadership and technical vision. 
            Always respond in English.`
                    },
                    ...messages,
                    userMessage
                ],
            });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.choices[0].message.content
            }]);
        } catch (error) {
            console.error("OpenAI API Error:", error);

            // Handle specific 401 errors gracefully in the UI
            const errorMessage = error.status === 401
                ? "Unauthorized: The API Key provided is invalid. Please verify the key in your deployment settings."
                : "I encountered a connection issue. Luis's 25+ years of experience are worth the wait—please try again in a moment.";

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessage
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
                        <div className="message-bubble">
                            {msg.content}
                        </div>
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
                    placeholder="Ask me about Luis's experience..."
                />
                <button onClick={handleSend} disabled={isLoading}>
                    {isLoading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;