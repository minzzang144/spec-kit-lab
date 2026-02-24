import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { CreateRecipeRequestDto } from '../Type';

import { postRecipe } from './Post';

const server = setupServer(
	http.post('/api/recipes', async ({ request }) => {
		const body = (await request.json()) as CreateRecipeRequestDto;
		return HttpResponse.json(
			{
				_id: 'recipe-new',
				title: body.title,
				description: body.description,
				category_id: body.category_id,
				category: {
					id: body.category_id,
					name: 'Breakfast',
					color: '#F59E0B',
				},
				cooking_time: body.cooking_time,
				difficulty: body.difficulty,
				ingredients: body.ingredients,
				created_at: '2026-02-10T00:00:00.000Z',
				updated_at: '2026-02-10T00:00:00.000Z',
			},
			{ status: 201 },
		);
	}),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('postRecipe', () => {
	it('should send POST request and return created recipe', async () => {
		const body: CreateRecipeRequestDto = {
			title: 'Test Recipe',
			description: 'A test recipe',
			category_id: 'cat-breakfast',
			cooking_time: 15,
			difficulty: 'Easy',
			ingredients: [{ name: 'Flour', amount: 200, unit: 'g' }],
		};

		const result = await postRecipe(body);

		expect(result._id).toBe('recipe-new');
		expect(result.title).toBe('Test Recipe');
		expect(result.category_id).toBe('cat-breakfast');
	});

	it('should throw on validation error', async () => {
		server.use(
			http.post('/api/recipes', () => {
				return HttpResponse.json(
					{ error: 'Validation failed', details: ['title is required'] },
					{ status: 400 },
				);
			}),
		);

		await expect(
			postRecipe({
				title: '',
				description: '',
				category_id: '',
				cooking_time: 0,
				difficulty: '',
				ingredients: [],
			}),
		).rejects.toEqual({
			error: 'Validation failed',
			details: ['title is required'],
		});
	});
});
