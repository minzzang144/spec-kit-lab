import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryProvider } from './App/Provider';
import { AppRouter } from './App/Router';
import './App/Style/global.css';

async function enableMocking(): Promise<void> {
  if (import.meta.env.DEV) {
    const { worker } = await import('./App/Mock/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
}

enableMocking().then(() => {
  const root = document.getElementById('root');

  if (!root) {
    throw new Error('Root element not found');
  }

  createRoot(root).render(
    <StrictMode>
      <QueryProvider>
        <AppRouter />
      </QueryProvider>
    </StrictMode>,
  );
});
