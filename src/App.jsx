import React from 'react'
import ChatInterface from './components/ChatInterface'
import { cvData } from './data/cvData'
import profileImg from './assets/profile.jpg'
import './App.css'

function App() {
  if (!cvData?.personal_info) return null;

  return (
    <div className="app-container">
      <header className="portfolio-header">
        <img src={profileImg} alt="Luis Madrigal" className="profile-photo" />
        <h1 id="executive-name">{cvData.personal_info.name}</h1>
        <p className="subtitle">{cvData.personal_info.title}</p>

        <div className="actions-container">
          <a href="./CV_Luis_Madrigal.pdf" target="_blank" className="btn-primary">View Full CV</a>
          <a href="./CV_Luis_Madrigal.pdf" download className="btn-secondary">Download</a>
        </div>
      </header>

      <main className="chat-window">
        <ChatInterface data={cvData} />
      </main>

      <footer className="portfolio-footer">
        <p>{cvData.education_certs[0]}</p>
        <p>Built with React + Vite + OpenAI</p>
      </footer>
    </div>
  )
}

export default App