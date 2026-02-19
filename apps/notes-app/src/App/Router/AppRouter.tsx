import { createBrowserRouter, RouterProvider } from 'react-router';
import { lazy, Suspense } from 'react';
import { AppLayout } from './AppLayout';

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

const PageFallback = () => (
  <div className="p-8 text-center">로딩 중...</div>
);

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<PageFallback />}>
            <NoteListPage />
          </Suspense>
        ),
      },
      {
        path: '/notes/new',
        element: (
          <Suspense fallback={<PageFallback />}>
            <NoteWritePage />
          </Suspense>
        ),
      },
      {
        path: '/notes/:id',
        element: (
          <Suspense fallback={<PageFallback />}>
            <NoteDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/categories',
        element: (
          <Suspense fallback={<PageFallback />}>
            <CategoryManagePage />
          </Suspense>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
