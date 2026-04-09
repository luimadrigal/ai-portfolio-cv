import React from 'react'
import ChatInterface from './components/ChatInterface'
import { cvData } from './data/cvData'
import profileImg from './assets/profile.jpg'
import './App.css'

// We extract the base URL from Vite's environment variables
// This handles the sub-directory path in GitHub Pages automatically
const baseUrl = import.meta.env.BASE_URL;

function App() {
  // Security check to ensure data is loaded before rendering
  if (!cvData?.personal_info) return null;

  // We define the PDF path once to keep the code DRY (Don't Repeat Yourself)
  const pdfPath = `${baseUrl}CV_Luis_Madrigal.pdf`;

  return (
    <div className="app-container">
      <header className="portfolio-header">
        <img
          src={profileImg}
          alt={cvData.personal_info.name}
          className="profile-photo"
        />
        <h1 id="executive-name">{cvData.personal_info.name}</h1>
        <p className="subtitle">{cvData.personal_info.title}</p>

        <div className="actions-container">
          {/* View PDF in a new tab */}
          <a
            href={pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            View Full CV
          </a>

          {/* Download PDF directly */}
          <a
            href={pdfPath}
            download="CV_Luis_Madrigal_Lobo.pdf"
            className="btn-secondary"
          >
            Download
          </a>
        </div>
      </header>

      <main className="chat-window">
        {/* Pass the English-localized data to the chat component */}
        <ChatInterface data={cvData} />
      </main>

      <footer className="portfolio-footer">
        {/* Displays your current Master's degree status */}
        <p>{cvData.education_certs[0]}</p>
        <p className="footer-tech">Built with React + Vite + OpenAI | 2026</p>
      </footer>
    </div>
  )
}

export default App