import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { noteQueryKey } from '#/Entities/Note';
import { ROUTES } from '#/Shared/Config';
import { noteWriteMutationOption } from '../../Api';

export function useCreateNote() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    ...noteWriteMutationOption.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: noteQueryKey.all,
      });
      navigate(ROUTES.HOME);
    },
  });
}
