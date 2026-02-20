import { useMutation, useQueryClient } from '@tanstack/react-query';

import { noteQueryKey } from '#/Entities/Note';

import { noteWriteMutationOption } from '../../Api';

export function useUpdateNote(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		...noteWriteMutationOption.update(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: noteQueryKey.all });
		},
	});
}
