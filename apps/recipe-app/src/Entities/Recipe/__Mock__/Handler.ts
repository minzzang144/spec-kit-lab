import { http, HttpResponse } from 'msw';

import { getRecipeById, getRecipeList } from './Db';

export const recipeEntityHandler = [
	http.get('/api/recipes', ({ request }) => {
		const url = new URL(request.url);
		const categoryId = url.searchParams.get('categoryId') ?? undefined;
		return HttpResponse.json(getRecipeList(categoryId));
	}),

	http.get('/api/recipes/:id', ({ params }) => {
		const recipe = getRecipeById(params.id as string);
		if (!recipe) {
			return HttpResponse.json(
				{ error: 'Recipe not found' },
				{ status: 404 },
			);
		}
		return HttpResponse.json(recipe);
	}),
];
