import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { DeleteRecipeAction } from './DeleteRecipeAction';

const server = setupServer(
	http.delete('/api/recipes/:id', () => {
		return new HttpResponse(null, { status: 204 });
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

describe('DeleteRecipeAction', () => {
	it('should render delete button', () => {
		render(<DeleteRecipeAction recipeId="recipe-1" />, {
			wrapper: createWrapper(),
		});
		expect(screen.getByText('삭제')).toBeInTheDocument();
	});

	it('should open confirmation dialog on click', async () => {
		const user = userEvent.setup();
		render(<DeleteRecipeAction recipeId="recipe-1" />, {
			wrapper: createWrapper(),
		});

		await user.click(screen.getByText('삭제'));

		expect(
			screen.getByText('레시피를 삭제할까요?'),
		).toBeInTheDocument();
		expect(
			screen.getByText('이 작업은 되돌릴 수 없습니다.'),
		).toBeInTheDocument();
	});

	it('should close dialog on cancel', async () => {
		const user = userEvent.setup();
		render(<DeleteRecipeAction recipeId="recipe-1" />, {
			wrapper: createWrapper(),
		});

		await user.click(screen.getByText('삭제'));
		expect(
			screen.getByText('레시피를 삭제할까요?'),
		).toBeInTheDocument();

		await user.click(screen.getByText('취소'));
		expect(
			screen.queryByText('레시피를 삭제할까요?'),
		).not.toBeInTheDocument();
	});
});
