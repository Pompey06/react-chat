import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './null.css'
import App from './App.jsx'
import './i18n';
import {ChatProvider} from './context/ChatContext.jsx'

createRoot(document.getElementById('root')).render(
   <ChatProvider>
      <StrictMode>
         <App />
      </StrictMode>
  </ChatProvider>
)
