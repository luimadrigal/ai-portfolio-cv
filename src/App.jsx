import React from 'react'
import ChatInterface from './components/ChatInterface'
import { cvData } from './data/cvData'
import './App.css'

function App() {
  // Verificación de datos antes de renderizar
  if (!cvData) return <div>Cargando datos maestros...</div>;

  return (
    <div className="app-container">
      <header>
        {/* Usamos el nombre exacto que definiste en cvData.js */}
        <h1>{cvData.personal_info?.name}</h1>
        <p>{cvData.personal_info?.title}</p>
      </header>

      <main>
        {/* Solo cargamos el chat si la API Key y los datos están listos */}
        <ChatInterface data={cvData} />
      </main>
    </div>
  );
}

export default App