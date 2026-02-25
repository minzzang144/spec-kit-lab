import type { CreateRecipeRequestDto, UpdateRecipeRequestDto } from '../Type';

import { recipeWriteMutationKey } from './Key';
import { postRecipe } from './Post';
import { putRecipe } from './Put';

export const recipeWriteMutationOption = {
	create: () => ({
		mutationKey: recipeWriteMutationKey.create,
		mutationFn: (body: CreateRecipeRequestDto) => postRecipe(body),
	}),
	update: (id: string) => ({
		mutationKey: recipeWriteMutationKey.update,
		mutationFn: (body: UpdateRecipeRequestDto) => putRecipe(id, body),
	}),
};
