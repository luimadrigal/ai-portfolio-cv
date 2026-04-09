import React from 'react'
import ChatInterface from './components/ChatInterface'
import { cvData } from './data/cvData'
import './App.css'
// Task 1: Import your profile image
import profileImg from './assets/profile.jpg'

function App() {
  // Defensive check for data loading
  if (!cvData || !cvData.personal_info) return null;

  return (
    <div className="app-container">
      <header className="portfolio-header">
        <span className="title-badge">AI-Powered Executive Profile</span>

        {/* Task 2: New Executive Layout */}
        <div className="profile-container">
          <img
            src={profileImg}
            alt={cvData.personal_info.name}
            className="profile-photo"
          />
          <div className="profile-text">
            {/* The ID is needed for the CSS fix */}
            <h1 id="executive-name">{cvData.personal_info.name}</h1>
            <p className="subtitle">
              {cvData.personal_info.title}
            </p>
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