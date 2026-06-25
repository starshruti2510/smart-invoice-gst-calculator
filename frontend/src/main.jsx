import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Aapka apna custom Success Message!
console.log("%cFRONTEND STATUS: Everything is working perfectly! All OK!", "color: #10b981; font-size: 16px; font-weight: bold;");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)