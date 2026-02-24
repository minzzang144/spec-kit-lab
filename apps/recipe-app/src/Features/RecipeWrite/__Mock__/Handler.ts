import { http, HttpResponse } from 'msw';

import { createRecipe, updateRecipe } from '#/Entities/Recipe/__Mock__';

export const recipeWriteFeatureHandler = [
	http.post('/api/recipes', async ({ request }) => {
		const body = await request.json();
		const created = createRecipe(body as Parameters<typeof createRecipe>[0]);
		return HttpResponse.json(created, { status: 201 });
	}),

	http.put('/api/recipes/:id', async ({ params, request }) => {
		const body = await request.json();
		const updated = updateRecipe(
			params.id as string,
			body as Parameters<typeof updateRecipe>[1],
		);
		if (!updated) {
			return HttpResponse.json(
				{ error: 'Recipe not found' },
				{ status: 404 },
			);
		}
		return HttpResponse.json(updated);
	}),
];
