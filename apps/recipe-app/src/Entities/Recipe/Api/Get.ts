import { httpClient } from '#/Shared/Api';

import { toRecipe, toRecipeList } from '../Model';
import type { Recipe, RecipeDto } from '../Type';
import type { GetRecipeListQuery } from '../Type';

export async function getRecipeList(
	query?: GetRecipeListQuery,
): Promise<Recipe[]> {
	const params = new URLSearchParams();
	if (query?.categoryId) {
		params.set('categoryId', query.categoryId);
	}
	const search = params.toString();
	const url = search ? `/recipes?${search}` : '/recipes';
	const dtoList = await httpClient.get<RecipeDto[]>(url);
	return toRecipeList(dtoList);
}

export async function getRecipe(id: string): Promise<Recipe> {
	const dto = await httpClient.get<RecipeDto>(`/recipes/${id}`);
	return toRecipe(dto);
}
