import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import './index.css';

// Configure the generated API client to use the deployed backend.
const apiUrl = import.meta.env.VITE_API_URL;

if (apiUrl) {
  setBaseUrl(apiUrl);
} else {
  console.warn(
    'VITE_API_URL is not configured. API requests will use the current origin.'
  );
}

createRoot(document.getElementById('root')!).render(<App />);