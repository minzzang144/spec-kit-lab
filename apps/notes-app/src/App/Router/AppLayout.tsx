import { Outlet } from 'react-router';
import { Sidebar } from '#/Widgets/Sidebar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto md:ml-0">
        <Outlet />
      </main>
    </div>
  );
}
