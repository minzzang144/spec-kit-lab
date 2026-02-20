import { Suspense, lazy } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';

import { ErrorBoundary } from '#/Shared/Ui';

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

const PageFallback = () => <div className="p-8 text-center">로딩 중...</div>;

const router = createBrowserRouter([
	{
		element: <AppLayout />,
		children: [
			{
				path: '/',
				element: (
					<ErrorBoundary>
						<Suspense fallback={<PageFallback />}>
							<NoteListPage />
						</Suspense>
					</ErrorBoundary>
				),
			},
			{
				path: '/notes/new',
				element: (
					<ErrorBoundary>
						<Suspense fallback={<PageFallback />}>
							<NoteWritePage />
						</Suspense>
					</ErrorBoundary>
				),
			},
			{
				path: '/notes/:id',
				element: (
					<ErrorBoundary>
						<Suspense fallback={<PageFallback />}>
							<NoteDetailPage />
						</Suspense>
					</ErrorBoundary>
				),
			},
			{
				path: '/categories',
				element: (
					<ErrorBoundary>
						<Suspense fallback={<PageFallback />}>
							<CategoryManagePage />
						</Suspense>
					</ErrorBoundary>
				),
			},
		],
	},
]);

export function AppRouter() {
	return <RouterProvider router={router} />;
}
