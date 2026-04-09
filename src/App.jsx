import React from 'react'
import ChatInterface from './components/ChatInterface'
import { cvData } from './data/cvData'
import './App.css'

function App() {
  return (
    <div className="app-container">
      {/* Header Ejecutivo */}
      <header className="portfolio-header">
        <h1>{cvData?.personal_info?.name || "Luis Madrigal Lobo"}</h1>
        <p className="title">{cvData.personalInfo.title}</p>
      </header>

      {/* Interfaz de IA interactiva */}
      <main>
        <ChatInterface data={cvData} />
      </main>

      {/* Footer con enfoque en tu Maestría */}
      <footer className="portfolio-footer">
        <p>© 2026 - Especialista en Big Data & Business Analytics</p>
      </footer>
    </div>
  )
}

export default App