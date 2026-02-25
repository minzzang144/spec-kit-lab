import { httpClient } from '#/Shared/Api';

import type { RecipeDto } from '#/Entities/Recipe';

import type { UpdateRecipeRequestDto } from '../Type';

export async function putRecipe(
	id: string,
	body: UpdateRecipeRequestDto,
): Promise<RecipeDto> {
	return httpClient.put<RecipeDto>(`/recipes/${id}`, body);
}
