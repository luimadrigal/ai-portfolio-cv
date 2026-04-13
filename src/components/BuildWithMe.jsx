import React from 'react';
import './BuildWithMe.css';

const BuildWithMe = ({ onClose, lang }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="build-modal" onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose}>×</button>
                
                <header className="build-header">
                    <div className="icon-badge">🏗️</div>
                    <h2>{lang === 'es' ? 'Cómo se construyó este Portfolio' : 'How this Portfolio was Built'}</h2>
                    <p>{lang === 'es' ? 'Ingeniería moderna impulsada por IA' : 'Modern Engineering driven by AI'}</p>
                </header>

                <div className="build-grid">
                    <div className="build-card">
                        <h3>⚡ React 19 + Vite</h3>
                        <p>{lang === 'es' 
                            ? 'Usando las últimas capacidades de React para un rendimiento óptimo y una experiencia de usuario fluida.' 
                            : 'Using the latest React capabilities for optimal performance and a smooth developer experience.'}</p>
                    </div>
                    <div className="build-card">
                        <h3>🤖 AI-First Architecture</h3>
                        <p>{lang === 'es' 
                            ? 'Integración dinámica con Groq (Llama 3) para respuestas instantáneas y streaming de texto real.' 
                            : 'Dynamic integration with Groq (Llama 3) for instant responses and real-time text streaming.'}</p>
                    </div>
                    <div className="build-card">
                        <h3>🎨 Modern CSS</h3>
                        <p>{lang === 'es' 
                            ? 'Variables CSS, Glassmorphism y animaciones nativas sin dependencias pesadas.' 
                            : 'CSS Variables, Glassmorphism, and native animations without heavy dependencies.'}</p>
                    </div>
                    <div className="build-card">
                        <h3>📈 Data Driven</h3>
                        <p>{lang === 'es' 
                            ? 'Visualizaciones interactivas con Recharts para demostrar habilidades de forma analítica.' 
                            : 'Interactive visualizations with Recharts to demonstrate skills analytically.'}</p>
                    </div>
                </div>

                <div className="build-philosophy">
                    <h4>{lang === 'es' ? 'La Filosofía del Engineering Leader' : 'The Engineering Leader Philosophy'}</h4>
                    <p>
                        {lang === 'es' 
                            ? 'Como líder, mi objetivo es demostrar que la IA no reemplaza al desarrollador, sino que actúa como un multiplicador de fuerza. Este proyecto fue concebido, diseñado y pulido en colaboración con agentes de IA, demostrando agilidad técnica y visión estratégica.' 
                            : 'As a leader, my goal is to demonstrate that AI doesn\'t replace the developer, but acts as a force multiplier. This project was conceived, designed, and polished in collaboration with AI agents, showcasing technical agility and strategic vision.'}
                    </p>
                </div>

                <div className="build-actions">
                    <a href="https://github.com/luimadrigal/ai-portfolio-cv" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        {lang === 'es' ? 'Ver Código en GitHub' : 'View Code on GitHub'}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BuildWithMe;
