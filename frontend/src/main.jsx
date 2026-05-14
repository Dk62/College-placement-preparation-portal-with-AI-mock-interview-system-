import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import axios from 'axios';
import App from './App.jsx';

// Standardized Axios Deployment Pipeline
axios.defaults.withCredentials = true;
axios.interceptors.request.use((config) => {
  // Dynamically inject cloud API route if provided by Hosting Providers
  const cloudApi = import.meta.env.VITE_API_URL;
  if (cloudApi && config.url && config.url.includes('http://localhost:5000')) {
    config.url = config.url.replace('http://localhost:5000', cloudApi);
  }
  return config;
}, (error) => Promise.reject(error));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="79330316522-7j9kic3d7lf1b7a8387uom7tlja2f1aj.apps.googleusercontent.com">
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
