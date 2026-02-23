import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { deleteCategory } from './Delete';

const server = setupServer(
	http.delete('/api/categories/:id', ({ params }) => {
		const { id } = params;

		if (id === 'uncategorized') {
			return HttpResponse.json(
				{
					error: 'Bad Request',
					message: '기본 카테고리는 삭제할 수 없습니다.',
					statusCode: 400,
				},
				{ status: 400 },
			);
		}

		if (id === 'nonexistent') {
			return HttpResponse.json(
				{
					error: 'Not Found',
					message: '카테고리를 찾을 수 없습니다.',
					statusCode: 404,
				},
				{ status: 404 },
			);
		}

		return HttpResponse.json({
			message: '카테고리가 삭제되었습니다.',
			movedNotesCount: 2,
		});
	}),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('deleteCategory', () => {
	it('should delete category without error', async () => {
		await expect(deleteCategory('cat-1')).resolves.toBeUndefined();
	});

	it('should throw error when deleting default category', async () => {
		await expect(deleteCategory('uncategorized')).rejects.toEqual(
			expect.objectContaining({
				message: '기본 카테고리는 삭제할 수 없습니다.',
			}),
		);
	});

	it('should throw error when category not found', async () => {
		await expect(deleteCategory('nonexistent')).rejects.toEqual(
			expect.objectContaining({ statusCode: 404 }),
		);
	});
});
