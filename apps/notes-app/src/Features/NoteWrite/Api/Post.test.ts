import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { postNote } from './Post';

const server = setupServer(
	http.post('/api/notes', async ({ request }) => {
		const body = (await request.json()) as {
			title?: string;
			content?: string;
			categoryId?: string;
		};

		if (!body.title || body.title.trim().length === 0) {
			return HttpResponse.json(
				{
					error: 'Bad Request',
					message: '제목을 입력해주세요.',
					statusCode: 400,
				},
				{ status: 400 },
			);
		}

		return HttpResponse.json(
			{
				data: {
					id: 'new-1',
					title: body.title,
					content: body.content ?? '',
					categoryId: body.categoryId ?? 'uncategorized',
					createdAt: '2026-02-12T00:00:00.000Z',
					updatedAt: '2026-02-12T00:00:00.000Z',
				},
			},
			{ status: 201 },
		);
	}),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('postNote', () => {
	it('should send POST request and return created note', async () => {
		const result = await postNote({
			title: '테스트 노트',
			content: '테스트 내용',
			categoryId: 'cat-1',
		});

		expect(result).toEqual({
			id: 'new-1',
			title: '테스트 노트',
			content: '테스트 내용',
			categoryId: 'cat-1',
			createdAt: '2026-02-12T00:00:00.000Z',
			updatedAt: '2026-02-12T00:00:00.000Z',
		});
	});

	it('should send POST with default categoryId when not provided', async () => {
		const result = await postNote({ title: '미분류 노트' });

		expect(result.categoryId).toBe('uncategorized');
		expect(result.title).toBe('미분류 노트');
		expect(result.content).toBe('');
	});

	it('should throw error when title is empty', async () => {
		await expect(postNote({ title: '' })).rejects.toEqual(
			expect.objectContaining({
				error: 'Bad Request',
				message: '제목을 입력해주세요.',
				statusCode: 400,
			}),
		);
	});
});
