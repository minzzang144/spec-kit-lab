import { httpClient } from '#/Shared/Api';

import type { RecipeDto } from '#/Entities/Recipe';

import type { CreateRecipeRequestDto } from '../Type';

export async function postRecipe(
	body: CreateRecipeRequestDto,
): Promise<RecipeDto> {
	return httpClient.post<RecipeDto>('/recipes', body);
}
