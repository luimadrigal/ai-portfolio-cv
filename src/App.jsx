import React from 'react'
import ChatInterface from './components/ChatInterface'
import { cvData } from './data/cvData'
import './App.css'
import profileImg from './assets/profile.jpg'

function App() {
  if (!cvData || !cvData.personal_info) return null;

  return (
    <div className="app-container">
      <header className="portfolio-header">
        <span className="title-badge">AI-Powered Executive Profile</span>

        <div className="profile-container">
          <img
            src={profileImg}
            alt={cvData.personal_info.name}
            className="profile-photo"
          />
          <div className="profile-text">
            <h1 id="executive-name">{cvData.personal_info.name}</h1>
            <p className="subtitle">
              {cvData.personal_info.title}
            </p>

            {/* Nueva sección de acciones para el CV */}
            <div className="actions-container">
              <a
                href="./CV_Luis_Madrigal.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                View Full CV (PDF)
              </a>
              <a
                href="./CV_Luis_Madrigal.pdf"
                download
                className="btn-secondary"
              >
                Download
              </a>
            </div>
          </div>
        </div>
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