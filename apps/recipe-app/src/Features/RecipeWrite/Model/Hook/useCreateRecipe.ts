import { useMutation, useQueryClient } from '@tanstack/react-query';

import { recipeQueryKey } from '#/Entities/Recipe';

import { recipeWriteMutationOption } from '../../Api';

export function useCreateRecipe() {
	const queryClient = useQueryClient();

	return useMutation({
		...recipeWriteMutationOption.create(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: recipeQueryKey.all,
			});
		},
	});
}
