import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { SocketProvider } from './context/socketprovider.jsx'
import { Provider } from './context/peer.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <SocketProvider>
      <Provider><App />
      </Provider>
    
    </SocketProvider>
    </BrowserRouter>
   
  </StrictMode>,
)
