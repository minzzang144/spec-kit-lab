import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

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
      <div>Notes App - Loading...</div>
    </StrictMode>,
  );
});
