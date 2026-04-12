import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch(e) {
  document.body.innerHTML = '<pre style="color:red;padding:20px">' 
    + e.message + '\n' + e.stack + '</pre>'
}
