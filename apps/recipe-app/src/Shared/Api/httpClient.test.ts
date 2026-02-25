import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { httpClient } from './httpClient';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('httpClient', () => {
	describe('get', () => {
		it('should send GET request and return data', async () => {
			server.use(
				http.get('/api/test', () => {
					return HttpResponse.json([{ id: '1', name: 'Test' }]);
				}),
			);

			const result =
				await httpClient.get<Array<{ id: string; name: string }>>(
					'/test',
				);
			expect(result).toEqual([{ id: '1', name: 'Test' }]);
		});
	});

	describe('post', () => {
		it('should send POST request with body and return data', async () => {
			server.use(
				http.post('/api/items', async ({ request }) => {
					const body = (await request.json()) as {
						title: string;
					};
					return HttpResponse.json(
						{ id: 'new-1', title: body.title },
						{ status: 201 },
					);
				}),
			);

			const result = await httpClient.post<{
				id: string;
				title: string;
			}>('/items', { title: 'New Item' });
			expect(result).toEqual({ id: 'new-1', title: 'New Item' });
		});
	});

	describe('put', () => {
		it('should send PUT request with body and return data', async () => {
			server.use(
				http.put('/api/items/1', async ({ request }) => {
					const body = (await request.json()) as {
						title: string;
					};
					return HttpResponse.json({ id: '1', title: body.title });
				}),
			);

			const result = await httpClient.put<{
				id: string;
				title: string;
			}>('/items/1', { title: 'Updated' });
			expect(result).toEqual({ id: '1', title: 'Updated' });
		});
	});

	describe('delete', () => {
		it('should send DELETE request and handle 204 No Content', async () => {
			server.use(
				http.delete('/api/items/1', () => {
					return new HttpResponse(null, { status: 204 });
				}),
			);

			const result = await httpClient.delete<undefined>('/items/1');
			expect(result).toBeUndefined();
		});
	});

	describe('error handling', () => {
		it('should throw error body on non-ok response', async () => {
			server.use(
				http.get('/api/fail', () => {
					return HttpResponse.json(
						{ error: 'Not Found' },
						{ status: 404 },
					);
				}),
			);

			await expect(httpClient.get('/fail')).rejects.toEqual({
				error: 'Not Found',
			});
		});

		it('should throw on 400 Bad Request', async () => {
			server.use(
				http.post('/api/items', () => {
					return HttpResponse.json(
						{
							error: 'Validation failed',
							details: ['title is required'],
						},
						{ status: 400 },
					);
				}),
			);

			await expect(
				httpClient.post('/items', {}),
			).rejects.toEqual({
				error: 'Validation failed',
				details: ['title is required'],
			});
		});
	});
});
