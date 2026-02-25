import { deleteRecipe } from './Delete';
import { recipeDeleteMutationKey } from './Key';

export const recipeDeleteMutationOption = {
	delete: (id: string) => ({
		mutationKey: recipeDeleteMutationKey.delete,
		mutationFn: () => deleteRecipe(id),
	}),
};
