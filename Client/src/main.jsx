import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, sessionStoragePersister } from './app/queryClient';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: sessionStoragePersister }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
);

