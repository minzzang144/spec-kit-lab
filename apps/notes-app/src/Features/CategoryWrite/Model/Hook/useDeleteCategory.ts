import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryQueryKey } from '#/Entities/Category';
import { noteQueryKey } from '#/Entities/Note';
import { categoryWriteMutationOption } from '../../Api';

export function useDeleteCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    ...categoryWriteMutationOption.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKey.all });
      queryClient.invalidateQueries({ queryKey: noteQueryKey.all });
    },
  });
}
