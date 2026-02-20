import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { postCategory } from './Post';

const server = setupServer(
	http.post('/api/categories', async ({ request }) => {
		const body = (await request.json()) as { name?: string };

		if (!body.name || body.name.trim().length === 0) {
			return HttpResponse.json(
				{
					error: 'Bad Request',
					message: '카테고리 이름을 입력해주세요.',
					statusCode: 400,
				},
				{ status: 400 },
			);
		}

		if (body.name === '중복이름') {
			return HttpResponse.json(
				{
					error: 'Bad Request',
					message: '이미 존재하는 카테고리 이름입니다.',
					statusCode: 400,
				},
				{ status: 400 },
			);
		}

		return HttpResponse.json(
			{ data: { id: 'cat-new', name: body.name, isDefault: false } },
			{ status: 201 },
		);
	}),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('postCategory', () => {
	it('should create category and return it', async () => {
		const result = await postCategory({ name: '독서' });

		expect(result.name).toBe('독서');
		expect(result.isDefault).toBe(false);
	});

	it('should throw error when name is empty', async () => {
		await expect(postCategory({ name: '' })).rejects.toEqual(
			expect.objectContaining({ statusCode: 400 }),
		);
	});

	it('should throw error when name is duplicate', async () => {
		await expect(postCategory({ name: '중복이름' })).rejects.toEqual(
			expect.objectContaining({
				message: '이미 존재하는 카테고리 이름입니다.',
			}),
		);
	});
});
