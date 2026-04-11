import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatInterface.css';
import profileImg from '../assets/profile.jpg';

const UI_STRINGS = {
    en: {
        defaultMsg: "Hello! I am {name}'s AI assistant. I can discuss his extensive background in Engineering Leadership or Big Data expertise. How can I help?",
        systemPrompt: "You are the professional assistant for Luis Madrigal Lobo. Answer in English only.",
        connError: "Connection issue. Please try again later.",
        voiceOn: "🔊 Voice On",
        voiceOff: "🔈 Voice Off",
        viewCV: "View Full CV",
        downloadPDF: "Download PDF",
        builtWith: "Built with React + Vite + AI",
        listening: "Listening...",
        placeholder: "Ask me about Luis's experience...",
        micError: "Microphone capture failed. Please ensure permissions are granted.",
        transcriptionError: "Sorry, there was an issue understanding the microphone audio."
    },
    es: {
        defaultMsg: "¡Hola! Soy el asistente de IA de {name}. Puedo hablar sobre su amplia experiencia en Liderazgo de Ingeniería o su conocimiento en Big Data. ¿Cómo puedo ayudarte?",
        systemPrompt: "You are the professional assistant for Luis Madrigal Lobo. Answer in Spanish only.",
        connError: "Problema de conexión. Por favor intenta más tarde.",
        voiceOn: "🔊 Voz Activada",
        voiceOff: "🔈 Voz Desact.",
        viewCV: "Ver CV Completo",
        downloadPDF: "Descargar PDF",
        builtWith: "Construido con React + Vite + AI",
        listening: "Escuchando...",
        placeholder: "Pregúntame sobre la experiencia de Luis...",
        micError: "Falló la captura del micrófono. Por favor asegura los permisos.",
        transcriptionError: "Lo siento, hubo un problema entendiendo el audio del micrófono."
    }
};

const ChatInterface = ({ data, pdfPath, lang = 'en', setLang }) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const strings = UI_STRINGS[lang] || UI_STRINGS.en;
    
    const defaultMessage = {
        role: 'assistant',
        content: strings.defaultMsg.replace('{name}', data?.personal_info?.name || "Luis")
    };
    
    const [messages, setMessages] = useState([defaultMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Audio integration states
    const [isRecording, setIsRecording] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // Reset chat when language changes
    useEffect(() => {
        setMessages([{
            role: 'assistant',
            content: strings.defaultMsg.replace('{name}', data?.personal_info?.name || "Luis")
        }]);
    }, [lang]);

    const handleSend = async (textToSend = input) => {
        const query = typeof textToSend === 'string' ? textToSend : input;
        if (!query.trim() || isLoading) return;
        
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: query }]);
        if (query === input) setInput('');

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: strings.systemPrompt },
                        { role: "user", content: query }
                    ]
                })
            });
            if (!response.ok) throw new Error("API Error");
            const result = await response.json();
            const aiText = result.choices[0].message.content;
            
            setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
            
            // Native Browser Text-to-Speech
            if (isVoiceEnabled && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                // strip markdown formatting characters for cleaner audio reading
                const cleanText = aiText.replace(/[*#`]/g, '');
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = lang === 'es' ? 'es-ES' : 'en-US';
                
                // Try to find a premium/natural expected voice if available
                const voices = window.speechSynthesis.getVoices();
                const matchedVoices = voices.filter(v => v.lang.startsWith(lang));
                if (matchedVoices.length > 0) {
                    const premiumVoice = matchedVoices.find(v => v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('siri'));
                    utterance.voice = premiumVoice || matchedVoices[0];
                }
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: strings.connError }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicClick = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                setIsRecording(false);
                setIsLoading(true);
                
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const extension = mimeType.includes('mp4') ? 'm4a' : 'webm';
                const audioFile = new File([audioBlob], `recording.${extension}`, { type: mimeType });

                const formData = new FormData();
                formData.append("file", audioFile);
                formData.append("model", "whisper-large-v3-turbo");
                formData.append("language", lang); // tell whisper which language

                let transcribedText = "";
                try {
                    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${apiKey}` },
                        body: formData
                    });
                    if (!res.ok) throw new Error("Transcription failed");
                    const data = await res.json();
                    transcribedText = data.text;
                } catch (err) {
                    console.error("Transcription error:", err);
                    alert(strings.transcriptionError);
                }

                stream.getTracks().forEach(track => track.stop());
                setIsLoading(false);

                // Auto-send transcribed text if valid
                if (transcribedText && transcribedText.trim().length > 0) {
                    handleSend(transcribedText);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Mic error:", error);
            alert(strings.micError);
        }
    };

    const handleClear = () => {
        setMessages([{
            role: 'assistant',
            content: strings.defaultMsg.replace('{name}', data?.personal_info?.name || "Luis")
        }]);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
    
    const toggleLanguage = () => {
        setLang(lang === 'en' ? 'es' : 'en');
    };

    return (
        <div className="chat-layout">
            <aside className="chat-sidebar glass">
                <div className="profile-section">
                    <img src={profileImg} alt={data?.personal_info?.name || "Luis"} className={`profile-avatar ${isLoading ? 'thinking' : ''}`} />
                    <h1>{data?.personal_info?.name || "Luis Madrigal Lobo"}</h1>
                    <h2 className="profile-role">{data?.personal_info?.title || "Engineering Director | AI & Big Data"}</h2>
                    {data?.education_certs?.[0] && (
                        <p className="profile-education">{data.education_certs[0]}</p>
                    )}
                </div>
                
                <div className="nav-actions">
                    <button onClick={toggleLanguage} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        🌐 {lang === 'en' ? 'Español' : 'English'}
                    </button>
                    <button 
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} 
                        className={`btn ${isVoiceEnabled ? 'btn-primary' : 'btn-outline'}`}
                    >
                        {isVoiceEnabled ? strings.voiceOn : strings.voiceOff}
                    </button>
                    <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        {strings.viewCV}
                    </a>
                    <a href={pdfPath} download="CV_Luis_Madrigal_Lobo.pdf" className="btn btn-outline">
                        {strings.downloadPDF}
                    </a>
                </div>
                
                <div className="sidebar-footer">
                    <p>{strings.builtWith}</p>
                </div>
            </aside>

            <main className="chat-main">
                <div className="message-list">
                    {messages.map((m, i) => (
                        <div key={i} className={`message-row ${m.role}`}>
                            <div className="message-bubble markdown-body">
                                <ReactMarkdown>{m.content}</ReactMarkdown>
                            </div>
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
                            placeholder={isRecording ? strings.listening : strings.placeholder} 
                            disabled={isRecording}
                        />
                        <button onClick={handleMicClick} disabled={isLoading && !isRecording} className={`mic-btn ${isRecording ? 'recording' : ''}`} title="Voice message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        </button>
                        <button onClick={handleClear} disabled={isLoading || isRecording} className="clear-btn" title="Clear chat">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2v6h-6"></path>
                                <path d="M3 12a9 9 0 1 0 2.63-6.37L21 8"></path>
                            </svg>
                        </button>
                        <button onClick={() => handleSend(input)} disabled={isLoading || isRecording} className="send-btn" title="Send message">
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