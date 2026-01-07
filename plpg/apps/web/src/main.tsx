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
// Check if it's a placeholder or empty - if so, use dev mode
// Allow any placeholder value or empty string to use dev mode
const isDev = !CLERK_PUBLISHABLE_KEY || 
              CLERK_PUBLISHABLE_KEY === 'pk_test_...' || 
              CLERK_PUBLISHABLE_KEY === 'pk_test_placeholder' ||
              (CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.includes('placeholder'));

// If we're in dev mode (placeholder or missing), use DevApp which doesn't require Clerk
// Only throw error if we have a non-placeholder key that's invalid (shouldn't happen with current logic)
if (!isDev && (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY.trim() === '')) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

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
