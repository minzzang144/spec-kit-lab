import { MemoryRouter } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { NoteList } from './NoteList';

const MOCK_NOTE_LIST = [
	{
		id: '1',
		title: '최신 노트',
		content: '최신 노트 내용',
		categoryId: 'cat-1',
		createdAt: '2026-02-10T09:00:00.000Z',
		updatedAt: '2026-02-10T09:00:00.000Z',
	},
	{
		id: '2',
		title: '이전 노트',
		content: '이전 노트 내용',
		categoryId: 'uncategorized',
		createdAt: '2026-02-09T09:00:00.000Z',
		updatedAt: '2026-02-09T09:00:00.000Z',
	},
];

const MOCK_CATEGORY_LIST = [
	{ id: 'uncategorized', name: '미분류', isDefault: true },
	{ id: 'cat-1', name: '업무', isDefault: false },
];

const server = setupServer(
	http.get('/api/notes', () => HttpResponse.json({ data: MOCK_NOTE_LIST })),
	http.get('/api/categories', () =>
		HttpResponse.json({ data: MOCK_CATEGORY_LIST }),
	),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createQueryClient() {
	return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderWithProvider(ui: React.ReactElement) {
	return render(
		<MemoryRouter>
			<QueryClientProvider client={createQueryClient()}>
				{ui}
			</QueryClientProvider>
		</MemoryRouter>,
	);
}

describe('NoteList', () => {
	it('should render note titles after loading', async () => {
		renderWithProvider(<NoteList />);

		await waitFor(() => {
			expect(screen.getByText('최신 노트')).toBeInTheDocument();
			expect(screen.getByText('이전 노트')).toBeInTheDocument();
		});
	});

	it('should render category badge for each note', async () => {
		renderWithProvider(<NoteList />);

		await waitFor(() => {
			expect(screen.getByText('업무')).toBeInTheDocument();
			expect(screen.getByText('미분류')).toBeInTheDocument();
		});
	});

	it('should render formatted date for each note', async () => {
		renderWithProvider(<NoteList />);

		await waitFor(() => {
			expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);
		});
	});

	it('should render empty state when no notes', async () => {
		server.use(
			http.get('/api/notes', () => HttpResponse.json({ data: [] })),
		);
		renderWithProvider(<NoteList />);

		await waitFor(() => {
			expect(
				screen.getByText('아직 작성된 노트가 없습니다'),
			).toBeInTheDocument();
		});
	});

	it('should render CTA link in empty state', async () => {
		server.use(
			http.get('/api/notes', () => HttpResponse.json({ data: [] })),
		);
		renderWithProvider(<NoteList />);

		await waitFor(() => {
			const ctaLink = screen.getByRole('link', {
				name: '첫 노트 작성하기',
			});
			expect(ctaLink).toBeInTheDocument();
			expect(ctaLink).toHaveAttribute('href', '/notes/new');
		});
	});

	it('should render loading skeleton initially', () => {
		renderWithProvider(<NoteList />);

		expect(
			document.querySelectorAll('[data-testid="note-card-skeleton"]')
				.length,
		).toBeGreaterThan(0);
	});

	it('should render note items as clickable articles', async () => {
		renderWithProvider(<NoteList />);

		await waitFor(() => {
			const articleList = screen.getAllByRole('article');
			expect(articleList.length).toBe(2);
		});
	});
});
