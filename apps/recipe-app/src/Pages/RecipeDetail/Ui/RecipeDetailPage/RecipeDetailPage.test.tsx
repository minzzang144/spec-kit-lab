import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { CATEGORY_SEED_DATA } from '#/Entities/Category/__Mock__';
import { RECIPE_SEED_DATA } from '#/Entities/Recipe/__Mock__';

import { RecipeDetailPage } from './RecipeDetailPage';

const server = setupServer(
	http.get('/api/recipes/:id', ({ params }) => {
		const recipe = RECIPE_SEED_DATA.find((r) => r._id === params.id);
		if (!recipe) {
			return HttpResponse.json(
				{ error: 'Recipe not found' },
				{ status: 404 },
			);
		}
		return HttpResponse.json(recipe);
	}),
	http.get('/api/categories', () => {
		return HttpResponse.json(CATEGORY_SEED_DATA);
	}),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithRoute(recipeId: string) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[`/recipes/${recipeId}`]}>
				<Routes>
					<Route
						path="/recipes/:id"
						element={<RecipeDetailPage />}
					/>
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

describe('RecipeDetailPage', () => {
	it('should render recipe detail for valid ID', async () => {
		renderWithRoute('recipe-1');
		expect(
			await screen.findByText('Fluffy Pancakes'),
		).toBeInTheDocument();
	});

	it('should show not-found for invalid ID', async () => {
		renderWithRoute('non-existent');
		expect(
			await screen.findByText('레시피를 찾을 수 없습니다'),
		).toBeInTheDocument();
	});

	it('should show back link to list', async () => {
		renderWithRoute('recipe-1');
		expect(await screen.findByText('← 목록으로')).toBeInTheDocument();
	});
});
