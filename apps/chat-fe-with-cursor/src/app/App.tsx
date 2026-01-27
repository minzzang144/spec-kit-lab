import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Main } from '@/pages/main';
import { Lobby } from '@/pages/lobby';
import { Room } from '@/pages/room';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:id" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
