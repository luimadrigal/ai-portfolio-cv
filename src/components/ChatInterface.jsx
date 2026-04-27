import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import './ChatInterface.css';
import profileImg from '../assets/profile.jpg';
import AnalyticsDashboard from './AnalyticsDashboard';
import StorytellingView from './StorytellingView';
import BuildWithMe from './BuildWithMe';

const UI_STRINGS = {
    en: {
        defaultMsg: {
            general: "Hello! I am {name}'s AI assistant. I can discuss his extensive background in Engineering Leadership or AI expertise. How can I help?",
            ai: "Switching to AI & Innovation context. Ask me about {name}'s experience with LLMs, AI Agents, and technical leadership in AI!",
            leadership: "Switching to Leadership context. Ask me about how {name} manages global teams, agile practices, and scales organizations!"
        },
        connError: "Connection issue. Please try again later.",
        rateLimitError: "The AI is busy (rate limit). Please wait a moment before asking again.",
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
        modes: { general: "General", ai: "IA", leadership: "Leadership" },
        chips: {
            general: [
                "Tell me about your AI implementation experience.", 
                "How do you lead AI transformation?", 
                "What has been your career trajectory?"
            ],
            ai: [
                "Tell me about your work with AI Agents.",
                "How did you implement AI in your current role?",
                "What's your vision for AI in Engineering Leadership?"
            ],
            leadership: [
                "How do you manage distributed global teams?",
                "What metrics do you use to measure engineering success?",
                "What is your leadership philosophy?"
            ]
        },
        available: "Open to strategic challenges"
    },
    es: {
        defaultMsg: {
            general: "¡Hola! Soy el asistente de IA de {name}. Puedo hablar sobre su amplia experiencia en Liderazgo de Ingeniería o su conocimiento en IA. ¿Cómo puedo ayudarte?",
            ai: "Cambiando al modo IA e Innovación. ¡Pregúntame sobre la experiencia de {name} con LLMs, Agentes de IA y liderazgo técnico en IA!",
            leadership: "Cambiando al modo Liderazgo. ¡Pregúntame sobre cómo {name} gestiona equipos globales, prácticas ágiles y escala organizaciones!"
        },
        connError: "Problema de conexión. Por favor intenta más tarde.",
        rateLimitError: "La IA está ocupada (límite de peticiones). Por favor espera un momento antes de volver a preguntar.",
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
        modes: { general: "General", ai: "IA", leadership: "Liderazgo" },
        chips: {
            general: [
                "Háblame de tu experiencia implementando IA.", 
                "¿Cómo lideras la transformación con IA?", 
                "¿Cuál ha sido tu trayectoria?"
            ],
            ai: [
                "Háblame de tu trabajo con Agentes de IA.",
                "¿Cómo has implementado IA en tu rol actual?",
                "¿Cuál es tu visión de la IA en el liderazgo?"
            ],
            leadership: [
                "¿Cómo gestionas equipos globales distribuidos?",
                "¿Qué métricas usas para medir el éxito?",
                "¿Cuál es tu filosofía de liderazgo?"
            ]
        },
        available: "Disponible para consultoría"
    }
};

// Resilient JSON parser to handle truncated or malformed AI responses
const safeJsonParse = (str) => {
    const clean = str.trim();
    try {
        return JSON.parse(clean);
    } catch (e) {
        // Heuristic to fix missing closing brackets/braces and trailing commas
        let repaired = clean.replace(/,\s*$/, ''); // Remove trailing comma

        const openBraces = (repaired.match(/\{/g) || []).length;
        const closeBraces = (repaired.match(/\}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/\]/g) || []).length;

        // Close objects first, then arrays
        for (let i = 0; i < (openBraces - closeBraces); i++) repaired += '}';
        for (let i = 0; i < (openBrackets - closeBrackets); i++) repaired += ']';

        try {
            return JSON.parse(repaired);
        } catch (e2) {
            console.error("JSON repair failed:", e2, "Original:", clean, "Repaired:", repaired);
            throw e; // throw original error
        }
    }
};

// Robust structural scanner to auto-detect and wrap naked JSON in markdown code blocks
const processMarkdown = (text) => {
    if (!text) return text;

    // Split by existing code blocks to avoid double-wrapping
    const parts = text.split(/(```[\s\S]*?```)/);

    return parts.map(part => {
        if (part.startsWith('```')) return part;

        let processed = part;

        // Find JSON-like structures using brace/bracket matching
        const findCandidates = (str) => {
            const results = [];
            let startIdx = -1;
            let count = 0;
            let inString = false;
            let type = null; // '{' or '['

            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                if (char === '"' && str[i - 1] !== '\\') inString = !inString;

                if (!inString) {
                    if (char === '{' || char === '[') {
                        if (count === 0) {
                            startIdx = i;
                            type = char;
                        }
                        count++;
                    } else if ((char === '}' && type === '{') || (char === ']' && type === '[')) {
                        count--;
                        if (count === 0 && startIdx !== -1) {
                            results.push({ start: startIdx, end: i + 1, content: str.slice(startIdx, i + 1) });
                            startIdx = -1;
                        }
                    }
                }
            }

            // Handle incomplete JSON at the end (for streaming)
            if (count > 0 && startIdx !== -1) {
                results.push({ start: startIdx, end: str.length, content: str.slice(startIdx) });
            }

            return results;
        };

        const candidates = findCandidates(processed);

        // Process candidates from end to beginning to maintain indices
        for (let i = candidates.length - 1; i >= 0; i--) {
            const { start, end, content } = candidates[i];
            let componentType = null;

            // Validate content looks like our specific components
            if (content.includes('"subject"') && content.includes('"A"')) {
                componentType = 'radar-chart';
            } else if (content.includes('"title"') && (content.includes('"technologies"') || content.includes('"githubLink"'))) {
                componentType = 'project-card';
            } else if (content.includes('"date"') && content.includes('"icon"')) {
                componentType = 'timeline';
            }

            if (componentType) {
                processed = processed.slice(0, start) + `\n\`\`\`${componentType}\n${content.trim()}\n\`\`\`\n` + processed.slice(end);
            }
        }

        return processed;
    }).join('');
};

// Custom Markdown components for dynamic RAG elements
const markdownComponents = {
    pre({ node, children, ...props }) {
        let isCustom = false;
        if (node?.children?.[0]?.tagName === 'code') {
            const className = node.children[0].properties?.className || [];
            if (Array.isArray(className) && className.some(c => String(c).includes('timeline') || String(c).includes('radar-chart') || String(c).includes('project-card'))) {
                isCustom = true;
            }
        }
        if (isCustom) return <>{children}</>;
        return <pre {...props}>{children}</pre>;
    },
    code({ node, inline, className, children, ...props }) {
        const match = /language-([\w-]+)/.exec(className || '');
        if (!inline && match && match[1] === 'radar-chart') {
            try {
                const data = safeJsonParse(String(children).trim());
                return (
                    <div className="radar-chart-wrapper" style={{ width: '100%', minHeight: '300px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px', marginTop: '12px', display: 'block', position: 'relative', overflow: 'hidden' }}>
                        <ResponsiveContainer width="99%" height={300}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
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
                const project = safeJsonParse(String(children).trim());
                const techBadges = Array.isArray(project.technologies) ? project.technologies : [];
                return (
                    <div className="portfolio-card">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className="tech-badges">
                            {techBadges.map((tech, i) => <span key={i} className="tech-badge">{tech}</span>)}
                        </div>
                        <div className="card-actions">
                            <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Repo</a>
                            <a href={project.demoLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Demo</a>
                        </div>
                    </div>
                );
            } catch (e) {
                return <div>Invalid Project Data</div>;
            }
        }
        if (!inline && match && match[1] === 'timeline') {
            try {
                const timelineData = safeJsonParse(String(children).trim());
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
                console.error("Timeline JSON parsing failed:", e, String(children));
                return <div style={{ color: 'red', padding: '10px' }}>Invalid Timeline Data (check console)</div>;
            }
        }
        return <code className={className} {...props}>{children}</code>;
    }
};

const ChatInterface = ({ data, pdfPath, lang = 'en', setLang, theme, toggleTheme }) => {
    const PROVIDERS = [
        {
            name: 'Groq',
            apiKey: import.meta.env.VITE_GROQ_API_KEY,
            endpoint: "https://api.groq.com/openai/v1/chat/completions",
            model: "llama-3.3-70b-versatile",
            type: 'openai'
        },
        {
            name: 'Gemini',
            apiKey: import.meta.env.VITE_GEMINI_API_KEY,
            endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent",
            model: "gemini-1.5-flash",
            type: 'gemini'
        },
        {
            name: 'OpenRouter',
            apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
            endpoint: "https://openrouter.ai/api/v1/chat/completions",
            model: "google/gemini-2.0-flash-lite-preview-02-05:free",
            type: 'openai'
        }
    ].filter(p => p.apiKey);


    const strings = UI_STRINGS[lang] || UI_STRINGS.en;

    const [chatMode, setChatMode] = useState('general');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showStory, setShowStory] = useState(false);
    const [showBuild, setShowBuild] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);

    const defaultMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: strings.defaultMsg[chatMode].replace('{name}', data?.personal_info?.name || "Luis"),
        rating: null
    };

    const [messages, setMessages] = useState([defaultMessage]);
    const [input, setInput] = useState('');

    // Typing detection for avatar life
    useEffect(() => {
        if (input.trim().length > 0) {
            setIsUserTyping(true);
            const timeout = setTimeout(() => setIsUserTyping(false), 1000);
            return () => clearTimeout(timeout);
        } else {
            setIsUserTyping(false);
        }
    }, [input]);

    // Status metrics
    const [isLoading, setIsLoading] = useState(false); // Request in flight, before stream starts
    const [isStreaming, setIsStreaming] = useState(false); // During stream chunk parsing

    const [isRecording, setIsRecording] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const chatEndRef = useRef(null);
    const messageListRef = useRef(null);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: strings.defaultMsg[chatMode].replace('{name}', data?.personal_info?.name || "Luis"),
            rating: null
        }]);
    }, [lang, chatMode]);

    const getSystemPrompt = () => {
        const base = lang === 'en'
            ? "You are the professional AI assistant for Luis Madrigal Lobo. Answer in English only."
            : "You are the professional AI assistant for Luis Madrigal Lobo. Answer in Spanish only.";

        const modeInstruction = chatMode === 'ai'
            ? " Focus heavily on AI, LLMs, AI Agents, innovation and technical leadership. CRITICAL: Mention that professional AI expertise comes primarily from the 'Engineering Director' role (2022-Present). Clarify that while Luis is studying Big Data, his current professional expertise is in IA and Leadership."
            : chatMode === 'leadership'
                ? " Focus heavily on team management, agile practices, organizational scale, and leadership style."
                : "";

        const formatInstructions = `
If asked about technical skills, expertise, or a visual summary of capabilities, respond using a Markdown radar-chart code block. Focus on AI and Leadership skills.
Example:
\`\`\`radar-chart
[{"subject":"AI/ML", "A":95}, {"subject":"AI Agents", "A":90}, {"subject":"Leadership", "A":95}, {"subject":"Innovation", "A":90}, {"subject":"Architecture", "A":85}]
\`\`\`

If asked about specific achievements, roles, or impact (like AI transformation or agent implementation), present the most relevant project using a Markdown project-card code block. Highlight the impact during the Engineering Director tenure.
Example:
\`\`\`project-card
{"title":"AI Transformation Leader", "description":"Led AI implementation reducing operational overhead by 20% through custom agents...", "technologies":["LLMs", "Python", "LangChain"], "githubLink":"#", "demoLink":"#"}
\`\`\`

ONLY if asked about career history, trajectory, milestones, or a chronological overview, use the Markdown timeline code block. Avoid using the timeline for technical or topical questions.
Example:
\`\`\`timeline
[{"date":"2022 - Present", "title":"Engineering Director", "description":"...", "icon":"rocket"}]
\`\`\`

Select the SINGLE most appropriate component for the user's specific request. Be concise in your introductory text.
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

        const contextMessages = messages.map(m => ({ role: m.role, content: m.content }));
        
        // Fallback loop
        for (let i = 0; i < PROVIDERS.length; i++) {
            const provider = PROVIDERS[i];
            console.log(`Attempting with provider: ${provider.name}`);

            try {
                let response;
                if (provider.type === 'openai') {
                    const headers = { 
                        "Authorization": `Bearer ${provider.apiKey}`, 
                        "Content-Type": "application/json" 
                    };
                    
                    if (provider.name === 'OpenRouter') {
                        headers["HTTP-Referer"] = window.location.origin;
                        headers["X-Title"] = "AI Portfolio CV";
                    }

                    response = await fetch(provider.endpoint, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify({
                            model: provider.model,
                            stream: true,
                            messages: [
                                { role: "system", content: getSystemPrompt() },
                                ...contextMessages,
                                { role: "user", content: query }
                            ]
                        })
                    });
                } else if (provider.type === 'gemini') {
                    const contents = contextMessages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }));
                    contents.push({ role: 'user', parts: [{ text: query }] });

                    response = await fetch(`${provider.endpoint}?key=${provider.apiKey}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: contents,
                            systemInstruction: { parts: [{ text: getSystemPrompt() }] }
                        })
                    });
                }

                if (response.status === 429) {
                    console.warn(`${provider.name} rate limited. Trying next...`);
                    if (i < PROVIDERS.length - 1) continue;
                    throw new Error("Rate Limit");
                }
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error(`${provider.name} error:`, errorData);
                    if (i < PROVIDERS.length - 1) continue;
                    throw new Error("API Error");
                }

                setIsLoading(false);
                setIsStreaming(true);

                const messageId = (Date.now() + 1).toString();
                setMessages(prev => [...prev, { id: messageId, role: 'assistant', content: '', rating: null }]);

                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let done = false;
                let fullAiText = "";
                let buffer = "";

                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) {
                        buffer += decoder.decode(value, { stream: true });
                        
                        if (provider.type === 'openai') {
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || ""; // Keep partial line in buffer
                            
                            for (const line of lines) {
                                const cleanLine = line.trim();
                                if (cleanLine.startsWith('data: ') && cleanLine !== 'data: [DONE]') {
                                    try {
                                        const dataObj = JSON.parse(cleanLine.slice(6));
                                        const content = dataObj.choices[0]?.delta?.content;
                                        if (content) {
                                            fullAiText += content;
                                            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: fullAiText } : m));
                                        }
                                    } catch (e) {
                                        console.debug("JSON parse error in stream chunk:", e);
                                    }
                                }
                            }
                        } else if (provider.type === 'gemini') {
                            const parts = buffer.split('}\n{');
                            buffer = parts.pop() || ""; // Keep partial JSON in buffer
                            
                            for (let j = 0; j < parts.length; j++) {
                                let part = parts[j];
                                if (j === 0 && !part.startsWith('{')) {
                                    // Handle start of array if it's the very first part
                                    part = part.replace(/^\[/, '');
                                }
                                if (!part.startsWith('{')) part = '{' + part;
                                if (!part.endsWith('}')) part = part + '}';
                                
                                try {
                                    const dataObj = JSON.parse(part);
                                    const content = dataObj.candidates?.[0]?.content?.parts?.[0]?.text;
                                    if (content) {
                                        fullAiText += content;
                                        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: fullAiText } : m));
                                    }
                                } catch (e) {
                                    // If parsing fails, put it back in buffer and wait for more data
                                    buffer = part + (buffer ? '\n' + buffer : '');
                                    break; 
                                }
                            }
                        }
                    }
                }

                // Final check for empty response
                if (!fullAiText.trim()) {
                    throw new Error("Empty Response");
                }
                
                setIsStreaming(false);

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

                return; 

            } catch (error) {
                console.error(`Failure with ${provider.name}:`, error);
                if (i === PROVIDERS.length - 1) {
                    const errorMsg = error.message === "Rate Limit" ? strings.rateLimitError : strings.connError;
                    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: errorMsg, rating: null }]);
                    setIsLoading(false);
                }
            }
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
                    const transcribeProvider = PROVIDERS.find(p => p.name === 'Groq') || PROVIDERS[0];
                    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${transcribeProvider.apiKey}` },
                        body: formData
                    });
                    if (res.status === 429) {
                        alert(strings.rateLimitError);
                        setIsLoading(false);
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }
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
            content: strings.defaultMsg[chatMode].replace('{name}', data?.personal_info?.name || "Luis"),
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
                    {/* Reactive Avatar: 'thinking' when AI streams, 'active' when user types */}
                    <img
                        src={profileImg}
                        alt={data?.personal_info?.name || "Luis"}
                        className={`profile-avatar ${isStreaming ? 'thinking' : ''} ${isUserTyping ? 'active' : ''}`}
                    />
                    <h1>{data?.personal_info?.name || "Luis Madrigal Lobo"}</h1>

                    <div className="status-badge">
                        <div className="status-dot"></div>
                        <span>{strings.available}</span>
                    </div>

                    <h2 className="profile-role">{data?.personal_info?.title || "Engineering Director | AI & Technical Innovation"}</h2>
                    {data?.education_certs?.[0] && (
                        <p className="profile-education">{data.education_certs[0]}</p>
                    )}
                </div>

                <div className="nav-actions">
                    <button onClick={toggleTheme} className="btn btn-outline theme-toggle" title="Toggle Theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button onClick={() => setShowStory(true)} className="btn btn-primary story-btn">
                        📖 {lang === 'en' ? 'Story Mode' : 'Modo Historia'}
                    </button>
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
                    <button className="build-link-btn" onClick={() => setShowBuild(true)}>
                        {strings.builtWith}
                    </button>
                </div>
            </aside>

            <main className="chat-main">
                <div className="chat-header">
                    <div className="modes-tabs">
                        <button className={`mode-tab ${chatMode === 'general' ? 'active' : ''}`} onClick={() => setChatMode('general')}>
                            {strings.modes.general}
                        </button>
                        <button className={`mode-tab ${chatMode === 'ai' ? 'active' : ''}`} onClick={() => setChatMode('ai')}>
                            🧠 {strings.modes.ai}
                        </button>
                        <button className={`mode-tab ${chatMode === 'leadership' ? 'active' : ''}`} onClick={() => setChatMode('leadership')}>
                            👥 {strings.modes.leadership}
                        </button>
                    </div>
                </div>

                <div className="message-list" ref={messageListRef}>
                    {messages.map((m) => (
                        <div key={m.id} className={`message-row ${m.role}`}>
                            <div className="message-container">
                                <div className="message-bubble markdown-body">
                                    <ReactMarkdown components={markdownComponents}>{processMarkdown(m.content)}</ReactMarkdown>
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
                            {strings.chips[chatMode].map((chip, idx) => (
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
            {showStory && <StorytellingView data={data} lang={lang} onClose={() => setShowStory(false)} />}
            {showBuild && <BuildWithMe lang={lang} onClose={() => setShowBuild(false)} />}
        </div>
    );
};

export default ChatInterface;