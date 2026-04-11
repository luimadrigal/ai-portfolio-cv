import React, { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import { cvData } from './data/cvData'
import './App.css'

// We extract the base URL from Vite's environment variables
// This handles the sub-directory path in GitHub Pages automatically
const baseUrl = import.meta.env.BASE_URL;

function App() {
  const [lang, setLang] = useState('en');

  // Security check to ensure data is loaded before rendering
  if (!cvData?.[lang]?.personal_info) return null;

  // We define the PDF path once to keep the code DRY
  const pdfPath = `${baseUrl}CV_Luis_Madrigal_Lobo.pdf`;

  return (
    <div className="app-container">
      {/* Pass the localized data and language state to the chat component */}
      <ChatInterface data={cvData[lang]} pdfPath={pdfPath} lang={lang} setLang={setLang} />
    </div>
  )
}

export default App