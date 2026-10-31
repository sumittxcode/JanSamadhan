import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import axios from 'axios';
import App from './App.jsx';

// Set production API base URL for Axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://jansamadhan-backend-vxjw.onrender.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
