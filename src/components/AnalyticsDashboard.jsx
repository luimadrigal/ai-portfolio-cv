// src/components/AnalyticsDashboard.jsx
import React from 'react';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ onClose, lang }) => {
    const isEn = lang === 'en';
    
    // Fake mock data to demonstrate analytics capability
    const data = {
        title: isEn ? "User Analytics Dashboard" : "Dashboard de Analíticas",
        totalSessions: 142,
        avgSessionTime: "04:32",
        positiveRating: "94%",
        topQueries: isEn ? ["Tell me about your Azure migrations", "What is your Spark experience?", "Leadership style"] 
                         : ["Háblame de tus migraciones a Azure", "¿Tu experiencia con Spark?", "Estilo de liderazgo"]
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📊 {data.title}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>{isEn ? "Total Sessions" : "Sesiones Totales"}</h3>
                            <p className="stat-value">{data.totalSessions}</p>
                        </div>
                        <div className="stat-card">
                            <h3>{isEn ? "Avg Session Time" : "Tiempo Promedio"}</h3>
                            <p className="stat-value">{data.avgSessionTime}</p>
                        </div>
                        <div className="stat-card">
                            <h3>{isEn ? "Positive Rating" : "Percepción Positiva"}</h3>
                            <p className="stat-value text-green">{data.positiveRating}</p>
                        </div>
                    </div>
                    
                    <div className="queries-section">
                        <h3>{isEn ? "Trending Queries" : "Consultas Frecuentes"}</h3>
                        <ul className="trending-list">
                            {data.topQueries.map((q, i) => (
                                <li key={i}>"{q}"</li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="analytics-info">
                        <p>{isEn ? "Note: This is a mocked dashboard demonstrating data tracking capabilities." 
                                 : "Nota: Este es un dashboard simulado demostrando capacidades de tracking de datos."}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
