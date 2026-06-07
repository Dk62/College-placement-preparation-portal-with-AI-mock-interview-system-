import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import axios from 'axios';
import App from './App.jsx';

// Global axios config
axios.defaults.withCredentials = true;

// 🚀 PRODUCTION only: If frontend and backend are on different domains (e.g., Vercel + Railway),
// set VITE_API_URL in your hosting provider's env vars to override the base URL.
const productionApi = import.meta.env.VITE_API_URL;
if (productionApi) {
  // Sanitize: remove trailing slashes, ensure https:// protocol
  const cleanApi = productionApi.replace(/\/$/, '').startsWith('http')
    ? productionApi.replace(/\/$/, '')
    : `https://${productionApi.replace(/\/$/, '')}`;
  axios.defaults.baseURL = cleanApi;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="79330316522-7j9kic3d7lf1b7a8387uom7tlja2f1aj.apps.googleusercontent.com">
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
