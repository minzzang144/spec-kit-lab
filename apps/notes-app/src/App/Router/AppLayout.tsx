import { Outlet } from 'react-router';
import { CategorySidebar } from '#/Widgets/CategorySidebar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <CategorySidebar />
      <main className="flex-1 min-w-0 overflow-auto md:ml-0">
        <Outlet />
      </main>
    </div>
  );
}
