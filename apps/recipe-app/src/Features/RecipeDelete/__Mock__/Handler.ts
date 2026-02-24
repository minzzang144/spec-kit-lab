import { http, HttpResponse } from 'msw';

import { deleteRecipe } from '#/Entities/Recipe/__Mock__';

export const recipeDeleteFeatureHandler = [
	http.delete('/api/recipes/:id', ({ params }) => {
		const deleted = deleteRecipe(params.id as string);
		if (!deleted) {
			return HttpResponse.json(
				{ error: 'Recipe not found' },
				{ status: 404 },
			);
		}
		return new HttpResponse(null, { status: 204 });
	}),
];
