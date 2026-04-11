import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import './ChatInterface.css';
import profileImg from '../assets/profile.jpg';
import AnalyticsDashboard from './AnalyticsDashboard';

const UI_STRINGS = {
    en: {
        defaultMsg: "Hello! I am {name}'s AI assistant. I can discuss his extensive background in Engineering Leadership or Big Data expertise. How can I help?",
        connError: "Connection issue. Please try again later.",
        voiceOn: "🔊 Voice On",
        voiceOff: "🔈 Voice Off",
        viewCV: "View Full CV",
        downloadPDF: "Download PDF",
        viewAnalytics: "📊 View Analytics",
        builtWith: "Built with React + Vite + AI",
        listening: "Listening...",
        placeholder: "Ask me about Luis's experience...",
        micError: "Microphone capture failed. Please ensure permissions are granted.",
        transcriptionError: "Sorry, there was an issue understanding the microphone audio.",
        modes: { general: "General", bigdata: "Big Data", leadership: "Leadership" },
        chips: [
            "How do you apply Big Data to business optimization?", 
            "Tell me about your role leading AI transformation.", 
            "What has been your career trajectory?"
        ],
        available: "Open to strategic challenges"
    },
    es: {
        defaultMsg: "¡Hola! Soy el asistente de IA de {name}. Puedo hablar sobre su amplia experiencia en Liderazgo de Ingeniería o su conocimiento en Big Data. ¿Cómo puedo ayudarte?",
        connError: "Problema de conexión. Por favor intenta más tarde.",
        voiceOn: "🔊 Voz Activada",
        voiceOff: "🔈 Voz Desact.",
        viewCV: "Ver CV Completo",
        downloadPDF: "Descargar PDF",
        viewAnalytics: "📊 Ver Analíticas",
        builtWith: "Construido con React + Vite + AI",
        listening: "Escuchando...",
        placeholder: "Pregúntame sobre la experiencia de Luis...",
        micError: "Falló la captura del micrófono. Por favor asegura los permisos.",
        transcriptionError: "Lo siento, hubo un problema entendiendo el audio del micrófono.",
        modes: { general: "General", bigdata: "Big Data", leadership: "Liderazgo" },
        chips: [
            "¿Cómo aplicas Big Data para optimizar negocios?", 
            "Háblame de tu rol liderando transformación IA.", 
            "¿Cuál ha sido tu trayectoria?"
        ],
        available: "Disponible para consultoría"
    }
};

// Custom Markdown components for dynamic RAG elements
const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        if (!inline && match && match[1] === 'radar-chart') {
            try {
                const data = JSON.parse(String(children).trim());
                return (
                    <div style={{ width: '100%', height: 300, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)' }} />
                                <Radar name="Skills" dataKey="A" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                );
            } catch (e) {
                return <div>Invalid Chart Data</div>;
            }
        }
        if (!inline && match && match[1] === 'project-card') {
            try {
                const project = JSON.parse(String(children).trim());
                const techBadges = Array.isArray(project.technologies) ? project.technologies : [];
                return (
                    <div className="portfolio-card">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className="tech-badges">
                            {techBadges.map((tech, i) => <span key={i} className="tech-badge">{tech}</span>)}
                        </div>
                        <div className="card-actions">
                            <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '8px 12px', fontSize: '0.8rem'}}>Repo</a>
                            <a href={project.demoLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{padding: '8px 12px', fontSize: '0.8rem'}}>Demo</a>
                        </div>
                    </div>
                );
            } catch (e) {
                return <div>Invalid Project Data</div>;
            }
        }
        if (!inline && match && match[1] === 'timeline') {
            try {
                const timelineData = JSON.parse(String(children).trim());
                const iconMap = { 'rocket': '🚀', 'people': '👥', 'brain': '🧠', 'default': '💠' };
                return (
                    <div className="hybrid-timeline">
                        {Array.isArray(timelineData) && timelineData.map((item, i) => (
                            <div key={i} className="timeline-item">
                                <div className="timeline-icon">
                                    {iconMap[item.icon] || iconMap.default}
                                </div>
                                <div className="timeline-content">
                                    <span className="timeline-date">{item.date}</span>
                                    <h4>{item.title}</h4>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            } catch (e) {
                return <div>Invalid Timeline Data</div>;
            }
        }
        return <code className={className} {...props}>{children}</code>;
    }
};

const ChatInterface = ({ data, pdfPath, lang = 'en', setLang }) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const strings = UI_STRINGS[lang] || UI_STRINGS.en;
    
    const [chatMode, setChatMode] = useState('general');
    const [showAnalytics, setShowAnalytics] = useState(false);

    const defaultMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: strings.defaultMsg.replace('{name}', data?.personal_info?.name || "Luis"),
        rating: null
    };
    
    const [messages, setMessages] = useState([defaultMessage]);
    const [input, setInput] = useState('');
    
    // Status metrics
    const [isLoading, setIsLoading] = useState(false); // Request in flight, before stream starts
    const [isStreaming, setIsStreaming] = useState(false); // During stream chunk parsing
    
    const [isRecording, setIsRecording] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: strings.defaultMsg.replace('{name}', data?.personal_info?.name || "Luis"),
            rating: null
        }]);
    }, [lang]);

    const getSystemPrompt = () => {
        const base = lang === 'en' 
            ? "You are the professional AI assistant for Luis Madrigal Lobo. Answer in English only." 
            : "You are the professional AI assistant for Luis Madrigal Lobo. Answer in Spanish only.";
        
        const modeInstruction = chatMode === 'bigdata' 
            ? " Focus heavily on technical architectures, Big Data, Spark, Azure, AWS and software patterns." 
            : chatMode === 'leadership' 
                ? " Focus heavily on team management, agile practices, organizational scale, and leadership style." 
                : "";
        
        const formatInstructions = `
If the user asks for a visual representation of skills, respond using ONLY a Markdown radar-chart code block containing a JSON array with 'subject' and 'A' (value 1-100). Example:
\`\`\`radar-chart
[{"subject":"React", "A":90},{"subject":"SQL", "A":95}]
\`\`\`

If asked about specific projects from the CV, present each one using a Markdown project-card code block containing a JSON object. Example:
\`\`\`project-card
{"title":"My Project", "description":"...", "technologies":["React", "Node"], "githubLink":"#", "demoLink":"#"}
\`\`\`

If asked about your career trajectory or timeline, respond with a short introduction (e.g. "I've gone from a technical maker to leading global teams. Here are the key milestones:") followed by ONLY a Markdown timeline code block containing a JSON array with 'date', 'title', 'description', and an 'icon' (choose from: "rocket" for launches/new roles, "people" for leadership, "brain" for AI/data). Example:
\`\`\`timeline
[{"date":"2020 - Present", "title":"Engineering Director", "description":"Leading AI efforts.", "icon":"people"}]
\`\`\`
`.trim();

        const contextStr = JSON.stringify(data);
        return `${base}${modeInstruction}\n\n${formatInstructions}\n\nHere is the CV context:\n${contextStr}`;
    };

    const handleSend = async (textToSend = input) => {
        const query = typeof textToSend === 'string' ? textToSend : input;
        if (!query.trim() || isLoading || isStreaming) return;
        
        setIsLoading(true);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: query }]);
        if (query === input) setInput('');

        try {
            const contextMessages = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    stream: true, // Enable Streaming
                    messages: [
                        { role: "system", content: getSystemPrompt() },
                        ...contextMessages,
                        { role: "user", content: query }
                    ]
                })
            });
            
            if (!response.ok) throw new Error("API Error");

            setIsLoading(false);
            setIsStreaming(true);

            // Create placeholder text
            const messageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: messageId, role: 'assistant', content: '', rating: null }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let fullAiText = "";

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const dataObj = JSON.parse(line.slice(6));
                                if (dataObj.choices[0].delta.content) {
                                    fullAiText += dataObj.choices[0].delta.content;
                                    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: fullAiText } : m));
                                }
                            } catch (e) {
                                // Ignore unparseable chunks
                            }
                        }
                    }
                }
            }
            
            // TTS handling at the end of the stream
            if (isVoiceEnabled && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const cleanText = fullAiText.replace(/[*#`]/g, '').replace(/project-card|radar-chart|timeline/g, '');
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = lang === 'es' ? 'es-ES' : 'en-US';
                const voices = window.speechSynthesis.getVoices();
                const matchedVoices = voices.filter(v => v.lang.startsWith(lang));
                if (matchedVoices.length > 0) {
                    const premiumVoice = matchedVoices.find(v => v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('google'));
                    utterance.voice = premiumVoice || matchedVoices[0];
                }
                window.speechSynthesis.speak(utterance);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: strings.connError, rating: null }]);
            setIsLoading(false);
        } finally {
            setIsStreaming(false);
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
                formData.append("language", lang);

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
            id: Date.now().toString(),
            role: 'assistant',
            content: strings.defaultMsg.replace('{name}', data?.personal_info?.name || "Luis"),
            rating: null
        }]);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
    
    const toggleLanguage = () => {
        setLang(lang === 'en' ? 'es' : 'en');
    };

    const handleRate = (id, ratingType) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, rating: ratingType } : m));
    };

    return (
        <div className="chat-layout">
            <aside className="chat-sidebar glass">
                <div className="profile-section">
                    {/* The thinking glow applies ONLY while streaming now, conveying the 'AI working' effect */}
                    <img src={profileImg} alt={data?.personal_info?.name || "Luis"} className={`profile-avatar ${isStreaming ? 'thinking' : ''}`} />
                    <h1>{data?.personal_info?.name || "Luis Madrigal Lobo"}</h1>
                    
                    <div className="status-badge">
                        <div className="status-dot"></div>
                        <span>{strings.available}</span>
                    </div>

                    <h2 className="profile-role">{data?.personal_info?.title || "Engineering Director | AI & Big Data"}</h2>
                    {data?.education_certs?.[0] && (
                        <p className="profile-education">{data.education_certs[0]}</p>
                    )}
                </div>
                
                <div className="nav-actions">
                    <button onClick={toggleLanguage} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        🌐 {lang === 'en' ? 'Español' : 'English'}
                    </button>
                    <button onClick={() => setShowAnalytics(true)} className="btn btn-outline">
                        {strings.viewAnalytics}
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
                <div className="chat-header">
                    <div className="modes-tabs">
                        <button className={`mode-tab ${chatMode === 'general' ? 'active' : ''}`} onClick={() => setChatMode('general')}>
                           {strings.modes.general}
                        </button>
                        <button className={`mode-tab ${chatMode === 'bigdata' ? 'active' : ''}`} onClick={() => setChatMode('bigdata')}>
                           🚀 {strings.modes.bigdata}
                        </button>
                        <button className={`mode-tab ${chatMode === 'leadership' ? 'active' : ''}`} onClick={() => setChatMode('leadership')}>
                           👥 {strings.modes.leadership}
                        </button>
                    </div>
                </div>

                <div className="message-list">
                    {messages.map((m) => (
                        <div key={m.id} className={`message-row ${m.role}`}>
                            <div className="message-container">
                                <div className="message-bubble markdown-body">
                                    <ReactMarkdown components={markdownComponents}>{m.content}</ReactMarkdown>
                                </div>
                                {m.role === 'assistant' && (
                                    <div className="rating-actions">
                                        <button onClick={() => handleRate(m.id, 'up')} className={`rate-btn ${m.rating === 'up' ? 'active' : ''}`} title="Helpful">👍</button>
                                        <button onClick={() => handleRate(m.id, 'down')} className={`rate-btn ${m.rating === 'down' ? 'active' : ''}`} title="Not helpful">👎</button>
                                    </div>
                                )}
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
                    {messages.length === 1 && (
                        <div className="suggestion-chips">
                            {strings.chips.map((chip, idx) => (
                                <button key={idx} className="chip-btn" onClick={() => handleSend(chip)}>
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="input-pill">
                        <input 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSend()} 
                            placeholder={isRecording ? strings.listening : strings.placeholder} 
                            disabled={isRecording || isLoading || isStreaming}
                        />
                        <button onClick={handleMicClick} disabled={(isLoading || isStreaming) && !isRecording} className={`mic-btn ${isRecording ? 'recording' : ''}`} title="Voice message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        </button>
                        <button onClick={handleClear} disabled={isLoading || isStreaming || isRecording} className="clear-btn" title="Clear chat">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2v6h-6"></path>
                                <path d="M3 12a9 9 0 1 0 2.63-6.37L21 8"></path>
                            </svg>
                        </button>
                        <button onClick={() => handleSend(input)} disabled={isLoading || isStreaming || isRecording} className="send-btn" title="Send message">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </main>
            
            {showAnalytics && <AnalyticsDashboard lang={lang} onClose={() => setShowAnalytics(false)} />}
        </div>
    );
};

export default ChatInterface;