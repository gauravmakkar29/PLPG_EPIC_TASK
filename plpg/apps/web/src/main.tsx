import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import DevApp from './DevApp';
import { queryClient } from './lib/queryClient';
import './styles/globals.css';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isDev = !CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY === 'pk_test_...';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {isDev ? (
          <DevApp />
        ) : (
          <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            <App />
          </ClerkProvider>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
