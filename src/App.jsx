import React from 'react'
import ChatInterface from './components/ChatInterface'
import { cvData } from './data/cvData'
import './App.css'

function App() {
  if (!cvData) return null;

  return (
    <div className="app-container">
      <header className="portfolio-header">
        <span className="title-badge">AI-Powered Executive Profile</span>
        <h1>{cvData.personal_info?.name}</h1>
        <p style={{ color: '#a0a0a0', fontSize: '1.2rem' }}>
          {cvData.personal_info?.title}
        </p>
      </header>

      <main className="chat-window">
        <ChatInterface data={cvData} />
      </main>

      <footer className="portfolio-footer">
        <p>Heredia, Costa Rica | {cvData.education_certs[0]}</p>
      </footer>
    </div>
  )
}

export default App