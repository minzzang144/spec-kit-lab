import { Suspense, lazy } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';

import { ErrorBoundary } from '#/Shared/Ui';

const RecipeListPage = lazy(() =>
	import('#/Pages/RecipeList').then((m) => ({ default: m.RecipeListPage })),
);
const RecipeDetailPage = lazy(() =>
	import('#/Pages/RecipeDetail').then((m) => ({
		default: m.RecipeDetailPage,
	})),
);
const RecipeWritePage = lazy(() =>
	import('#/Pages/RecipeWrite').then((m) => ({
		default: m.RecipeWritePage,
	})),
);

const PageFallback = () => <div className="p-8 text-center">로딩 중...</div>;

const router = createBrowserRouter([
	{
		path: '/',
		element: (
			<ErrorBoundary>
				<Suspense fallback={<PageFallback />}>
					<RecipeListPage />
				</Suspense>
			</ErrorBoundary>
		),
	},
	{
		path: '/recipes',
		element: (
			<ErrorBoundary>
				<Suspense fallback={<PageFallback />}>
					<RecipeListPage />
				</Suspense>
			</ErrorBoundary>
		),
	},
	{
		path: '/recipes/new',
		element: (
			<ErrorBoundary>
				<Suspense fallback={<PageFallback />}>
					<RecipeWritePage />
				</Suspense>
			</ErrorBoundary>
		),
	},
	{
		path: '/recipes/:id/edit',
		element: (
			<ErrorBoundary>
				<Suspense fallback={<PageFallback />}>
					<RecipeWritePage />
				</Suspense>
			</ErrorBoundary>
		),
	},
	{
		path: '/recipes/:id',
		element: (
			<ErrorBoundary>
				<Suspense fallback={<PageFallback />}>
					<RecipeDetailPage />
				</Suspense>
			</ErrorBoundary>
		),
	},
]);

export function AppRouter() {
	return <RouterProvider router={router} />;
}
