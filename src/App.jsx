import React from 'react'
import ChatInterface from './components/ChatInterface'
import { cvData } from './data/cvData'
import './App.css'

function App() {
  // Defensive check for data loading
  if (!cvData || !cvData.personal_info) return null;

  return (
    <div className="app-container">
      <header className="portfolio-header">
        <span className="title-badge">AI-Powered Executive Profile</span>
        <h1>{cvData.personal_info.name}</h1>
        <p className="subtitle">
          {cvData.personal_info.title}
        </p>
      </header>

      <main className="chat-window">
        <ChatInterface data={cvData} />
      </main>

      <footer className="portfolio-footer">
        <p>Heredia, Costa Rica | {cvData.education_certs[0]}</p>
        <p className="footer-note">Built with React + Vite + OpenAI</p>
      </footer>
    </div>
  )
}

export default App