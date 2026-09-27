import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import './index.css';

const apiUrl = import.meta.env.VITE_API_URL;

console.log('Frontend API URL:', apiUrl);

if (apiUrl) {
  setBaseUrl(apiUrl);
} else {
  console.warn(
    'VITE_API_URL is not configured. API requests will use the current origin.'
  );
}

createRoot(document.getElementById('root')!).render(<App />);