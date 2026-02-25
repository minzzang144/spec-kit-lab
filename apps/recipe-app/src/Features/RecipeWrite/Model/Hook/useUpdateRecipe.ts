import { useMutation, useQueryClient } from '@tanstack/react-query';

import { recipeQueryKey } from '#/Entities/Recipe';

import { recipeWriteMutationOption } from '../../Api';

export function useUpdateRecipe(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		...recipeWriteMutationOption.update(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: recipeQueryKey.all,
			});
		},
	});
}
