// src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import { cvData } from '../data/cvData';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Necesario para que corra desde el navegador del cliente
});

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I am Luis\'s AI assistant. You can ask me about his experience in AI transformation, global team leadership, or specific technical projects.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const systemPrompt = `You are a professional assistant for Luis Madrigal Lobo. 
  Answer based on this data: ${JSON.stringify(cvData)}. 
  Be professional and highlight his 20+ years of experience and leadership of 75+ headcount[cite: 3, 5].`;

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: systemPrompt }, ...newMessages],
            });
            setMessages([...newMessages, response.choices[0].message]);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-box">
            <div className="messages">
                {messages.map((m, i) => <div key={i} className={m.role}>{m.content}</div>)}
            </div>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage} disabled={loading}>Ask AI</button>
        </div>
    );
};

export default ChatInterface;