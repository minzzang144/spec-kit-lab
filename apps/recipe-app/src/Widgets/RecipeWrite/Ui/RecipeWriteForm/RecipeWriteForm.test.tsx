import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { CATEGORY_SEED_DATA } from '#/Entities/Category/__Mock__';

import { RecipeWriteForm } from './RecipeWriteForm';

const server = setupServer(
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

describe('RecipeWriteForm', () => {
	it('should render all form fields', async () => {
		const onSubmit = vi.fn();
		render(<RecipeWriteForm onSubmit={onSubmit} />, {
			wrapper: createWrapper(),
		});

		expect(screen.getByLabelText('제목')).toBeInTheDocument();
		expect(screen.getByLabelText('설명')).toBeInTheDocument();
		expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
		expect(screen.getByLabelText('조리 시간 (분)')).toBeInTheDocument();
		expect(screen.getByLabelText('난이도')).toBeInTheDocument();
	});

	it('should show validation errors for empty required fields', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<RecipeWriteForm onSubmit={onSubmit} />, {
			wrapper: createWrapper(),
		});

		await user.click(screen.getByText('저장'));

		await waitFor(() => {
			expect(screen.getByText('제목을 입력하세요')).toBeInTheDocument();
		});

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('should add and remove ingredient rows', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<RecipeWriteForm onSubmit={onSubmit} />, {
			wrapper: createWrapper(),
		});

		const initialIngredientInput =
			screen.getAllByPlaceholderText('재료명');
		expect(initialIngredientInput).toHaveLength(1);

		await user.click(screen.getByText('+ 재료 추가'));

		const afterAddInput = screen.getAllByPlaceholderText('재료명');
		expect(afterAddInput).toHaveLength(2);

		const deleteButtonList = screen.getAllByText('삭제');
		await user.click(deleteButtonList[0]!);

		const afterRemoveInput = screen.getAllByPlaceholderText('재료명');
		expect(afterRemoveInput).toHaveLength(1);
	});
});
