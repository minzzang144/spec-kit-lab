import { useMutation, useQueryClient } from '@tanstack/react-query';

import { categoryQueryKey } from '#/Entities/Category';

import { categoryWriteMutationOption } from '../../Api';

export function useCreateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		...categoryWriteMutationOption.create(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: categoryQueryKey.all });
		},
	});
}
