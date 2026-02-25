import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { CATEGORY_SEED_DATA } from '#/Entities/Category/__Mock__';
import { RECIPE_SEED_DATA } from '#/Entities/Recipe/__Mock__';

import { RecipeList } from './RecipeList';

const server = setupServer(
	http.get('/api/recipes', () => {
		return HttpResponse.json(RECIPE_SEED_DATA);
	}),
	http.get('/api/categories', () => {
		return HttpResponse.json(CATEGORY_SEED_DATA);
	}),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<MemoryRouter>{children}</MemoryRouter>
			</QueryClientProvider>
		);
	};
}

describe('RecipeList', () => {
	it('should render recipe cards after loading', async () => {
		render(<RecipeList />, { wrapper: createWrapper() });

		expect(
			await screen.findByText('Fluffy Pancakes'),
		).toBeInTheDocument();
		expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument();
	});

	it('should show empty state when no recipes', async () => {
		server.use(
			http.get('/api/recipes', () => {
				return HttpResponse.json([]);
			}),
		);

		render(<RecipeList />, { wrapper: createWrapper() });

		expect(
			await screen.findByText('아직 등록된 레시피가 없습니다.'),
		).toBeInTheDocument();
	});

	it('should show error message on API failure', async () => {
		server.use(
			http.get('/api/recipes', () => {
				return HttpResponse.json(
					{ error: 'Server Error' },
					{ status: 500 },
				);
			}),
		);

		render(<RecipeList />, { wrapper: createWrapper() });

		expect(
			await screen.findByText('레시피를 불러오지 못했습니다.'),
		).toBeInTheDocument();
	});
});
