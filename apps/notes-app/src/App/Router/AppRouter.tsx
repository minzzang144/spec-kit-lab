import { createBrowserRouter, RouterProvider } from 'react-router';
import { lazy, Suspense } from 'react';

const NoteListPage = lazy(() =>
  import('#/Pages/NoteList').then((m) => ({ default: m.NoteListPage })),
);
const NoteWritePage = lazy(() =>
  import('#/Pages/NoteWrite').then((m) => ({ default: m.NoteWritePage })),
);
const NoteDetailPage = lazy(() =>
  import('#/Pages/NoteDetail').then((m) => ({ default: m.NoteDetailPage })),
);
const CategoryManagePage = lazy(() =>
  import('#/Pages/CategoryManage').then((m) => ({
    default: m.CategoryManagePage,
  })),
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="p-8 text-center">로딩 중...</div>}>
        <NoteListPage />
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
        <NoteDetailPage />
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
