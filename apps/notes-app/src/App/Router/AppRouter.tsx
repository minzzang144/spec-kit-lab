import { createBrowserRouter, RouterProvider } from 'react-router';
import { lazy, Suspense } from 'react';

const HomePage = lazy(() =>
  import('#/Pages/HomePage').then((m) => ({ default: m.HomePage })),
);
const NoteWritePage = lazy(() =>
  import('#/Pages/NoteWritePage').then((m) => ({ default: m.NoteWritePage })),
);
const NoteViewPage = lazy(() =>
  import('#/Pages/NoteViewPage').then((m) => ({ default: m.NoteViewPage })),
);
const CategoryManagePage = lazy(() =>
  import('#/Pages/CategoryManagePage').then((m) => ({
    default: m.CategoryManagePage,
  })),
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="p-8 text-center">로딩 중...</div>}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: '/notes/new',
    element: (
      <Suspense fallback={<div className="p-8 text-center">로딩 중...</div>}>
        <NoteWritePage />
      </Suspense>
    ),
  },
  {
    path: '/notes/:id',
    element: (
      <Suspense fallback={<div className="p-8 text-center">로딩 중...</div>}>
        <NoteViewPage />
      </Suspense>
    ),
  },
  {
    path: '/categories',
    element: (
      <Suspense fallback={<div className="p-8 text-center">로딩 중...</div>}>
        <CategoryManagePage />
      </Suspense>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
