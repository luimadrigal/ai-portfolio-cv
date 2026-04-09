import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './ChatInterface.css';

const ChatInterface = ({ data }) => {
    // 1. Get the key from Vite environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello! I am Luis's AI assistant powered by Gemini. I can discuss his 25+ years of engineering leadership, his Master's in Big Data, or his work at Publicis Groupe. How can I help you today?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 2. Initialize the Gemini Client
    // Note: We use the "gemini-1.5-flash" model for speed and cost-efficiency
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // 3. Fail-fast if API Key is missing (prevents unnecessary 404/401 calls)
        if (!apiKey || apiKey === "" || apiKey.includes("VITE_GEMINI")) {
            setMessages(prev => [...prev,
            { role: 'user', content: input },
            {
                role: 'assistant',
                content: "System Configuration Error: Gemini API Key is missing. Please check the GitHub Secrets and Deployment environment."
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
            // 4. Construct a robust prompt including your CV context
            const prompt = `
                Role: You are the professional AI Executive Assistant for Luis Madrigal Lobo.
                Context: ${JSON.stringify(data)}
                
                Guidelines:
                - Use the context to answer questions about Luis's career, education, and skills.
                - Maintain an executive, concise, and professional tone.
                - Highlight his leadership of 75+ professionals and his expertise in AI Transformation.
                - If the information is not in the context, be polite and offer to have them contact Luis on LinkedIn.
                - Always respond in English.

                User Question: ${input}
            `;

            // 5. Execute the generation
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: text
            }]);

        } catch (error) {
            console.error("Gemini API Error:", error);

            // Handle specific status errors for cleaner UX
            let errorFeedback = "I'm currently optimizing my internal systems. Please try again or download Luis's CV above.";

            if (error.message?.includes("404")) {
                errorFeedback = "Model mapping error (404). Please ensure the Gemini API is active for this project.";
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorFeedback
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
                {isLoading && (
                    <div className="loading-indicator">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        Analyzing Luis's trajectory...
                    </div>
                )}
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
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className={isLoading ? 'loading' : ''}
                >
                    {isLoading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;