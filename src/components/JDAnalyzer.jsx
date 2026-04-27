import React, { useState } from 'react';
import './JDAnalyzer.css';

const JDAnalyzer = ({ data, providers, lang, onClose }) => {
    const [jdText, setJdText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const strings = {
        title: lang === 'es' ? 'Analizador de Match IA' : 'AI Match Analyzer',
        subtitle: lang === 'es' ? 'Pega la descripción del puesto para evaluar la compatibilidad de Luis.' : 'Paste the job description to evaluate Luis\'s compatibility.',
        placeholder: lang === 'es' ? 'Pega aquí la descripción del puesto (Job Description)...' : 'Paste the Job Description here...',
        analyzeBtn: lang === 'es' ? 'Analizar Compatibilidad' : 'Analyze Compatibility',
        analyzing: lang === 'es' ? 'Analizando con IA...' : 'Analyzing with AI...',
        matchScore: lang === 'es' ? 'Puntaje de Match' : 'Match Score',
        strengths: lang === 'es' ? 'Fortalezas Clave' : 'Key Strengths',
        gaps: lang === 'es' ? 'Áreas a Enfatizar' : 'Areas to Emphasize',
        recommendation: lang === 'es' ? 'Recomendación Estratégica' : 'Strategic Recommendation',
        back: lang === 'es' ? 'Volver' : 'Back',
        newAnalysis: lang === 'es' ? 'Nuevo Análisis' : 'New Analysis'
    };

    const handleAnalyze = async () => {
        if (!jdText.trim() || isAnalyzing) return;
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        const provider = providers[0]; // Use primary provider
        const systemPrompt = `You are an expert technical recruiter. Analyze the Job Description (JD) and compare it with Luis Madrigal's CV.
        Luis's CV Data: ${JSON.stringify(data)}
        
        Return ONLY a JSON object (no markdown, no text) with this structure:
        {
            "matchPercentage": number (0-100),
            "fitSummary": "concise summary in ${lang === 'es' ? 'Spanish' : 'English'}",
            "topStrengths": ["strength 1", "strength 2", "strength 3"],
            "missingOrGaps": ["gap 1", "gap 2"],
            "recommendation": "strategic pitch in ${lang === 'es' ? 'Spanish' : 'English'}"
        }`;

        try {
            const response = await fetch(provider.endpoint, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${provider.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: provider.model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Here is the Job Description to analyze: \n\n${jdText}` }
                    ],
                    temperature: 0.3
                })
            });

            if (!response.ok) throw new Error("API Error");

            const resultData = await response.json();
            const content = resultData.choices[0]?.message?.content;
            
            // Clean content from potential markdown markers
            const cleanContent = content.replace(/```json|```/g, '').trim();
            setResult(JSON.parse(cleanContent));
        } catch (err) {
            console.error("Analysis failed:", err);
            setError(lang === 'es' ? 'Error al analizar. Intenta de nuevo.' : 'Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="jd-overlay">
            <div className="jd-modal glass">
                <button className="close-jd" onClick={onClose}>×</button>
                
                {!result ? (
                    <div className="jd-input-view">
                        <div className="jd-header">
                            <div className="ai-icon-pulse">✨</div>
                            <h2>{strings.title}</h2>
                            <p>{strings.subtitle}</p>
                        </div>

                        <textarea 
                            className="jd-textarea"
                            placeholder={strings.placeholder}
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                        />

                        {error && <p className="jd-error">{error}</p>}

                        <button 
                            className={`btn btn-primary analyze-btn ${isAnalyzing ? 'loading' : ''}`}
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !jdText.trim()}
                        >
                            {isAnalyzing ? strings.analyzing : strings.analyzeBtn}
                        </button>
                    </div>
                ) : (
                    <div className="jd-result-view animate-fade-in">
                        <div className="result-header">
                            <div className="match-circle">
                                <svg viewBox="0 0 36 36" className="circular-chart">
                                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="circle" 
                                        strokeDasharray={`${result.matchPercentage}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                    />
                                    <text x="18" y="20.35" className="percentage">{result.matchPercentage}%</text>
                                </svg>
                                <span>{strings.matchScore}</span>
                            </div>
                            <div className="fit-summary">
                                <h3>{lang === 'es' ? 'Resumen de Ajuste' : 'Fit Summary'}</h3>
                                <p>{result.fitSummary}</p>
                            </div>
                        </div>

                        <div className="result-grid">
                            <div className="result-section">
                                <h4>💎 {strings.strengths}</h4>
                                <ul>
                                    {result.topStrengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div className="result-section">
                                <h4>🎯 {strings.gaps}</h4>
                                <ul>
                                    {result.missingOrGaps.map((g, i) => <li key={i}>{g}</li>)}
                                </ul>
                            </div>
                        </div>

                        <div className="recommendation-box">
                            <h4>🚀 {strings.recommendation}</h4>
                            <p>{result.recommendation}</p>
                        </div>

                        <div className="result-actions">
                            <button className="btn btn-outline" onClick={() => setResult(null)}>
                                {strings.newAnalysis}
                            </button>
                            <button className="btn btn-primary" onClick={onClose}>
                                {strings.back}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JDAnalyzer;
