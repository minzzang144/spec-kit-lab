import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { recipeQueryKey } from '#/Entities/Recipe';
import { ROUTES } from '#/Shared/Config';

import { recipeDeleteMutationOption } from '../../Api';

export function useDeleteRecipe(id: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		...recipeDeleteMutationOption.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: recipeQueryKey.all,
			});
			navigate(ROUTES.RECIPE_LIST);
		},
	});
}
