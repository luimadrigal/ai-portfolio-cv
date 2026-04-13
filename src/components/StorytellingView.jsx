import React, { useEffect, useRef } from 'react';
import './StorytellingView.css';

const StorytellingView = ({ data, onClose, lang }) => {
    const timelineRef = useRef(null);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        const items = timelineRef.current.querySelectorAll('.story-item');
        items.forEach(item => observer.observe(item));

        // Close on Escape
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
            observer.disconnect();
        };
    }, [onClose]);

    const experiences = data?.experience || [];

    return (
        <div className="story-overlay">
            <button className="close-story" onClick={onClose} aria-label="Close Storytelling">
                <span>×</span>
            </button>
            
            <div className="story-container" ref={timelineRef}>
                <header className="story-header">
                    <span className="story-label">{lang === 'es' ? 'Mi Trayectoria' : 'My Journey'}</span>
                    <h1>{lang === 'es' ? 'La Historia de un Líder' : 'The Story of a Leader'}</h1>
                    <p className="story-intro">
                        {lang === 'es' 
                            ? 'Más de 20 años transformando organizaciones a través de la tecnología y el liderazgo humano.' 
                            : 'Over 20 years transforming organizations through technology and human leadership.'}
                    </p>
                </header>

                <div className="story-timeline">
                    {experiences.map((exp, index) => (
                        <div key={index} className="story-item">
                            <div className="story-dot"></div>
                            <div className="story-content">
                                <span className="story-date">{exp.duration}</span>
                                <h2>{exp.role}</h2>
                                <h3 className="story-company">{exp.company}</h3>
                                {exp.description && <p className="story-desc">{exp.description}</p>}
                                {exp.highlights && (
                                    <ul className="story-highlights">
                                        {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="story-footer">
                    <p>{lang === 'es' ? 'Continuará...' : 'To be continued...'}</p>
                    <button className="btn btn-primary" onClick={onClose}>
                        {lang === 'es' ? 'Volver al Chat' : 'Back to Chat'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default StorytellingView;
