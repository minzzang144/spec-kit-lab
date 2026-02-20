import { useNavigate } from 'react-router';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { noteQueryKey } from '#/Entities/Note';

import { ROUTES } from '#/Shared/Config';

import { noteDeleteMutationOption } from '../../Api';

export function useDeleteNote(id: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		...noteDeleteMutationOption.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: noteQueryKey.all });
			navigate(ROUTES.HOME);
		},
	});
}
